import { readFile, writeFile } from 'node:fs/promises'

const [, , inputPath, outputPath] = process.argv
if (inputPath === undefined || outputPath === undefined) {
  throw new Error('usage: node scripts/merge-hi3d-parts.mjs <input.glb> <output.glb>')
}

const source = await readFile(inputPath)
const jsonLength = source.readUInt32LE(12)
const manifest = JSON.parse(
  source.subarray(20, 20 + jsonLength).toString('utf8').replaceAll('\0', '').trim(),
)
const binaryOffset = 20 + jsonLength + 8

const positions = []
const normals = []
const uvs = []
const indices = []
let vertexOffset = 0

for (const mesh of manifest.meshes) {
  for (const primitive of mesh.primitives) {
    const partPositions = readAccessor(primitive.attributes.POSITION)
    const partNormals = readAccessor(primitive.attributes.NORMAL)
    const partUvs = readAccessor(primitive.attributes.TEXCOORD_0)
    const partIndices = readAccessor(primitive.indices)
    positions.push(...partPositions.values)
    normals.push(...partNormals.values)
    uvs.push(...partUvs.values)
    for (const index of partIndices.values) indices.push(index + vertexOffset)
    vertexOffset += partPositions.count
  }
}

const indexBuffer = Buffer.alloc(indices.length * 4)
for (let index = 0; index < indices.length; index += 1) {
  indexBuffer.writeUInt32LE(indices[index], index * 4)
}

const vertexBuffer = Buffer.alloc(vertexOffset * 32)
const boundsMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
const boundsMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY]
for (let vertex = 0; vertex < vertexOffset; vertex += 1) {
  const target = vertex * 32
  for (let component = 0; component < 3; component += 1) {
    const value = positions[vertex * 3 + component]
    vertexBuffer.writeFloatLE(value, target + component * 4)
    boundsMin[component] = Math.min(boundsMin[component], value)
    boundsMax[component] = Math.max(boundsMax[component], value)
  }
  vertexBuffer.writeFloatLE(uvs[vertex * 2], target + 12)
  vertexBuffer.writeFloatLE(uvs[vertex * 2 + 1], target + 16)
  for (let component = 0; component < 3; component += 1) {
    vertexBuffer.writeFloatLE(normals[vertex * 3 + component], target + 20 + component * 4)
  }
}

const baseColorTexture = manifest.textures[0]
const baseColorImage = manifest.images[baseColorTexture.source]
const baseColorView = manifest.bufferViews[baseColorImage.bufferView]
const imageBuffer = source.subarray(
  binaryOffset + (baseColorView.byteOffset ?? 0),
  binaryOffset + (baseColorView.byteOffset ?? 0) + baseColorView.byteLength,
)

const indexOffset = 0
const vertexOffsetBytes = align4(indexBuffer.length)
const imageOffset = align4(vertexOffsetBytes + vertexBuffer.length)
const binaryLength = align4(imageOffset + imageBuffer.length)
const binary = Buffer.alloc(binaryLength)
indexBuffer.copy(binary, indexOffset)
vertexBuffer.copy(binary, vertexOffsetBytes)
imageBuffer.copy(binary, imageOffset)

const outputManifest = {
  asset: {
    version: '2.0',
    generator: 'dsh-theme-xiaohei Hi3D semantic merge v1',
  },
  accessors: [
    {
      bufferView: 0,
      componentType: 5125,
      count: indices.length,
      type: 'SCALAR',
      min: [0],
      max: [vertexOffset - 1],
    },
    {
      bufferView: 1,
      byteOffset: 0,
      componentType: 5126,
      count: vertexOffset,
      type: 'VEC3',
      min: boundsMin,
      max: boundsMax,
    },
    {
      bufferView: 1,
      byteOffset: 12,
      componentType: 5126,
      count: vertexOffset,
      type: 'VEC2',
    },
    {
      bufferView: 1,
      byteOffset: 20,
      componentType: 5126,
      count: vertexOffset,
      type: 'VEC3',
    },
  ],
  bufferViews: [
    { buffer: 0, byteOffset: indexOffset, byteLength: indexBuffer.length, target: 34963 },
    {
      buffer: 0,
      byteOffset: vertexOffsetBytes,
      byteLength: vertexBuffer.length,
      byteStride: 32,
      target: 34962,
    },
    { buffer: 0, byteOffset: imageOffset, byteLength: imageBuffer.length },
  ],
  buffers: [{ byteLength: binary.length }],
  images: [{ bufferView: 2, mimeType: baseColorImage.mimeType }],
  samplers: [manifest.samplers?.[baseColorTexture.sampler] ?? {}],
  textures: [{ source: 0, sampler: 0 }],
  materials: [
    {
      name: 'xiaohei-avatar-basecolor',
      pbrMetallicRoughness: {
        baseColorTexture: { index: 0 },
        metallicFactor: 0,
        roughnessFactor: 1,
      },
    },
  ],
  meshes: [
    {
      name: 'xiaohei-avatar-rig-source',
      primitives: [
        {
          attributes: { POSITION: 1, TEXCOORD_0: 2, NORMAL: 3 },
          indices: 0,
          material: 0,
          mode: 4,
        },
      ],
    },
  ],
  nodes: [{ name: 'xiaohei-avatar-rig-source', mesh: 0 }],
  scenes: [{ nodes: [0] }],
  scene: 0,
}

const json = Buffer.from(JSON.stringify(outputManifest))
const paddedJson = Buffer.alloc(align4(json.length), 0x20)
json.copy(paddedJson)
const output = Buffer.alloc(12 + 8 + paddedJson.length + 8 + binary.length)
output.write('glTF', 0, 'ascii')
output.writeUInt32LE(2, 4)
output.writeUInt32LE(output.length, 8)
output.writeUInt32LE(paddedJson.length, 12)
output.writeUInt32LE(0x4e4f534a, 16)
paddedJson.copy(output, 20)
const outputBinaryHeader = 20 + paddedJson.length
output.writeUInt32LE(binary.length, outputBinaryHeader)
output.writeUInt32LE(0x004e4942, outputBinaryHeader + 4)
binary.copy(output, outputBinaryHeader + 8)
await writeFile(outputPath, output)
console.log(`${outputPath}: ${vertexOffset} vertices, ${indices.length / 3} triangles, ${output.length} bytes`)

function readAccessor(accessorIndex) {
  const accessor = manifest.accessors[accessorIndex]
  const view = manifest.bufferViews[accessor.bufferView]
  const itemSizes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
  const componentSizes = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 }
  const itemSize = itemSizes[accessor.type]
  const componentSize = componentSizes[accessor.componentType]
  const stride = view.byteStride ?? itemSize * componentSize
  const start = binaryOffset + (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0)
  const values = new Array(accessor.count * itemSize)
  for (let item = 0; item < accessor.count; item += 1) {
    for (let component = 0; component < itemSize; component += 1) {
      const offset = start + item * stride + component * componentSize
      values[item * itemSize + component] = readComponent(offset, accessor.componentType)
    }
  }
  return { values, count: accessor.count, itemSize }
}

function readComponent(offset, componentType) {
  if (componentType === 5126) return source.readFloatLE(offset)
  if (componentType === 5125) return source.readUInt32LE(offset)
  if (componentType === 5123) return source.readUInt16LE(offset)
  if (componentType === 5121) return source.readUInt8(offset)
  throw new Error(`unsupported accessor component type ${componentType}`)
}

function align4(value) {
  return Math.ceil(value / 4) * 4
}
