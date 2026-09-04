import { readFile, writeFile } from 'node:fs/promises'

const [, , riggedPath, texturedPath, outputPath] = process.argv
if (!riggedPath || !texturedPath || !outputPath) {
  throw new Error(
    'usage: node scripts/prepare-rigged-avatar.mjs <rigged.glb> <textured.glb> <output.glb>',
  )
}

const rigged = await readGlb(riggedPath)
const textured = await readGlb(texturedPath)
const manifest = rigged.manifest

const skinnedMeshIndex = manifest.meshes.findIndex((mesh) =>
  mesh.primitives.some(
    (primitive) =>
      primitive.attributes?.JOINTS_0 !== undefined &&
      primitive.attributes?.WEIGHTS_0 !== undefined,
  ),
)
if (skinnedMeshIndex < 0 || !manifest.skins?.length || !manifest.animations?.length) {
  throw new Error('input does not contain a skinned animated mesh')
}

for (const scene of manifest.scenes ?? []) {
  scene.nodes = (scene.nodes ?? []).filter((nodeIndex) => {
    const meshIndex = manifest.nodes[nodeIndex]?.mesh
    return meshIndex === undefined || meshIndex === skinnedMeshIndex
  })
}

const sourceTexture = textured.manifest.textures?.[0]
const sourceImageIndex =
  sourceTexture?.source ?? sourceTexture?.extensions?.EXT_texture_webp?.source
const sourceImage = textured.manifest.images?.[sourceImageIndex]
if (!sourceImage || sourceImage.bufferView === undefined) {
  throw new Error('textured source does not contain an embedded image')
}
const sourceView = textured.manifest.bufferViews[sourceImage.bufferView]
const imageBytes = textured.binary.subarray(
  sourceView.byteOffset ?? 0,
  (sourceView.byteOffset ?? 0) + sourceView.byteLength,
)

const imageOffset = align4(rigged.binary.length)
const binary = Buffer.alloc(align4(imageOffset + imageBytes.length))
rigged.binary.copy(binary)
imageBytes.copy(binary, imageOffset)

manifest.bufferViews ??= []
const imageViewIndex = manifest.bufferViews.length
manifest.bufferViews.push({
  buffer: 0,
  byteOffset: imageOffset,
  byteLength: imageBytes.length,
})
manifest.images = [{ bufferView: imageViewIndex, mimeType: sourceImage.mimeType }]
manifest.samplers = [
  textured.manifest.samplers?.[sourceTexture.sampler] ?? {
    magFilter: 9729,
    minFilter: 9987,
    wrapS: 10497,
    wrapT: 10497,
  },
]
manifest.textures = [
  {
    sampler: 0,
    extensions: { EXT_texture_webp: { source: 0 } },
  },
]

const characterPrimitive = manifest.meshes[skinnedMeshIndex].primitives[0]
const characterMaterial = manifest.materials[characterPrimitive.material]
characterMaterial.pbrMetallicRoughness ??= {}
characterMaterial.pbrMetallicRoughness.baseColorFactor = [1, 1, 1, 1]
characterMaterial.pbrMetallicRoughness.baseColorTexture = { index: 0 }
characterMaterial.pbrMetallicRoughness.metallicFactor = 0
characterMaterial.pbrMetallicRoughness.roughnessFactor = 1

manifest.extensionsUsed = unique([...(manifest.extensionsUsed ?? []), 'EXT_texture_webp'])
manifest.extensionsRequired = unique([
  ...(manifest.extensionsRequired ?? []),
  'EXT_texture_webp',
])
manifest.buffers[0].byteLength = binary.length

await writeGlb(outputPath, manifest, binary)
console.log(
  `${outputPath}: attached ${imageBytes.length} texture bytes to mesh ${skinnedMeshIndex}`,
)

async function readGlb(path) {
  const source = await readFile(path)
  if (source.toString('ascii', 0, 4) !== 'glTF' || source.readUInt32LE(4) !== 2) {
    throw new Error(`${path} is not a GLB 2.0 file`)
  }
  const jsonLength = source.readUInt32LE(12)
  const manifest = JSON.parse(
    source
      .subarray(20, 20 + jsonLength)
      .toString('utf8')
      .replaceAll('\0', '')
      .trim(),
  )
  const binaryHeader = 20 + jsonLength
  const binaryLength = source.readUInt32LE(binaryHeader)
  const binaryOffset = binaryHeader + 8
  return {
    manifest,
    binary: source.subarray(binaryOffset, binaryOffset + binaryLength),
  }
}

async function writeGlb(path, manifest, binary) {
  const json = Buffer.from(JSON.stringify(manifest))
  const paddedJson = Buffer.alloc(align4(json.length), 0x20)
  json.copy(paddedJson)
  const output = Buffer.alloc(12 + 8 + paddedJson.length + 8 + binary.length)
  output.write('glTF', 0, 'ascii')
  output.writeUInt32LE(2, 4)
  output.writeUInt32LE(output.length, 8)
  output.writeUInt32LE(paddedJson.length, 12)
  output.writeUInt32LE(0x4e4f534a, 16)
  paddedJson.copy(output, 20)
  const binaryHeader = 20 + paddedJson.length
  output.writeUInt32LE(binary.length, binaryHeader)
  output.writeUInt32LE(0x004e4942, binaryHeader + 4)
  binary.copy(output, binaryHeader + 8)
  await writeFile(path, output)
}

function align4(value) {
  return Math.ceil(value / 4) * 4
}

function unique(values) {
  return [...new Set(values)]
}
