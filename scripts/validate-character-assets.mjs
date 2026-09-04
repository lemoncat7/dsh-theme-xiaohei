import { readFile } from 'node:fs/promises'

const assets = [
  ['xiaohei-idle-blink-v1.webp', 256, 256],
  ['xiaohei-idle-eye-base-v1.webp', 256, 256],
  ['xiaohei-idle-ear-left-v1.webp', 2304, 256],
  ['xiaohei-idle-ear-right-v1.webp', 2304, 256],
  ['xiaohei-idle-tail-v1.webp', 2560, 256],
  ['xiaohei-thinking-canonical-v12.webp', 512, 512],
  ['xiaohei-streaming-tailwrite-v1.webp', 512, 512],
  ['xiaohei-tool-canonical-v2.webp', 512, 512],
  ['xiaohei-waiting-canonical-v2.webp', 512, 512],
  ['xiaohei-complete-canonical-v2.webp', 512, 512],
  ['xiaohei-error-canonical-v2.webp', 512, 512],
]

for (const [filename, expectedWidth, expectedHeight] of assets) {
  const source = await readFile(new URL(`../src/assets/character/${filename}`, import.meta.url))
  const { width, height } = readWebpDimensions(source)
  if (width !== expectedWidth || height !== expectedHeight) {
    throw new Error(`${filename}: expected ${expectedWidth}x${expectedHeight}, received ${width}x${height}`)
  }
}

for (const filename of [
  'xiaohei-avatar-2d-front-v1.webp',
  'xiaohei-avatar-2d-blink-v1.webp',
]) {
  const source = await readFile(new URL(`../src/assets/model/${filename}`, import.meta.url))
  const { width, height } = readWebpDimensions(source)
  if (width !== 768 || height !== 768) {
    throw new Error(`${filename}: expected 768x768, received ${width}x${height}`)
  }
}

for (const filename of [
  'xiaohei-breakframe-idle-v1.webp',
  'xiaohei-breakframe-blink-v1.webp',
  'xiaohei-breakframe-brace-v1.webp',
  'xiaohei-breakframe-reach-v1.webp',
  'xiaohei-breakframe-thinking-v1.webp',
  'xiaohei-breakframe-working-v1.webp',
  'xiaohei-breakframe-complete-v1.webp',
  'xiaohei-breakframe-error-v1.webp',
]) {
  const source = await readFile(new URL(`../src/assets/model/${filename}`, import.meta.url))
  const { width, height } = readWebpDimensions(source)
  if (width !== 512 || height !== 512) {
    throw new Error(`${filename}: expected 512x512, received ${width}x${height}`)
  }
}

const avatarModel = await readFile(
  new URL('../src/assets/model/xiaohei-avatar-hi3d-rig-web-v2.glb', import.meta.url),
)
if (avatarModel.toString('ascii', 0, 4) !== 'glTF' || avatarModel.readUInt32LE(4) !== 2) {
  throw new Error('xiaohei-avatar-hi3d-rig-web-v2.glb must be a GLB 2.0 container')
}
if (avatarModel.length > 2_500_000) {
  throw new Error('xiaohei-avatar-hi3d-rig-web-v2.glb exceeds the reviewed 2.5 MB web budget')
}
const jsonLength = avatarModel.readUInt32LE(12)
const manifest = JSON.parse(
  avatarModel.subarray(20, 20 + jsonLength).toString('utf8').replaceAll('\0', '').trim(),
)
const primitive = manifest.meshes?.[0]?.primitives?.[0]
const positionAccessor = manifest.accessors?.[primitive?.attributes?.POSITION]
const indexAccessor = manifest.accessors?.[primitive?.indices]
if ((positionAccessor?.count ?? 0) < 40_000 || (positionAccessor?.count ?? 0) > 70_000) {
  throw new Error('xiaohei-avatar-hi3d-rig-web-v2.glb must keep 40k-70k reviewed vertices')
}
if ((indexAccessor?.count ?? 0) < 180_000 || (indexAccessor?.count ?? 0) > 300_000) {
  throw new Error('xiaohei-avatar-hi3d-rig-web-v2.glb triangle density is outside the web budget')
}
if (manifest.images?.[0]?.bufferView === undefined || primitive?.attributes?.TEXCOORD_0 === undefined) {
  throw new Error('xiaohei-avatar-hi3d-rig-web-v2.glb must contain an embedded texture and UVs')
}
if (manifest.images[0].mimeType !== 'image/webp') {
  throw new Error('xiaohei-avatar-hi3d-rig-web-v2.glb must use the reviewed embedded WebP texture')
}
const binaryOffset = 20 + jsonLength + 8
const imageView = manifest.bufferViews[manifest.images[0].bufferView]
const embeddedTexture = avatarModel.subarray(
  binaryOffset + (imageView.byteOffset ?? 0),
  binaryOffset + (imageView.byteOffset ?? 0) + imageView.byteLength,
)
const textureSize = readWebpDimensions(embeddedTexture)
if (textureSize.width !== 1024 || textureSize.height !== 1024) {
  throw new Error(
    `xiaohei-avatar-hi3d-rig-web-v2.glb texture must be 1024x1024, received ${textureSize.width}x${textureSize.height}`,
  )
}

function readWebpDimensions(source) {
  if (source.toString('ascii', 0, 4) !== 'RIFF' || source.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('character asset is not a valid WebP RIFF container')
  }

  let offset = 12
  while (offset + 8 <= source.length) {
    const type = source.toString('ascii', offset, offset + 4)
    const size = source.readUInt32LE(offset + 4)
    const data = offset + 8

    if (type === 'VP8X') {
      return {
        width: 1 + readUInt24LE(source, data + 4),
        height: 1 + readUInt24LE(source, data + 7),
      }
    }

    if (type === 'VP8L') {
      if (source[data] !== 0x2f) throw new Error('invalid VP8L signature')
      const bits = source.readUInt32LE(data + 1)
      return {
        width: 1 + (bits & 0x3fff),
        height: 1 + ((bits >>> 14) & 0x3fff),
      }
    }

    if (type === 'VP8 ') {
      if (source[data + 3] !== 0x9d || source[data + 4] !== 0x01 || source[data + 5] !== 0x2a) {
        throw new Error('invalid VP8 key-frame signature')
      }
      return {
        width: source.readUInt16LE(data + 6) & 0x3fff,
        height: source.readUInt16LE(data + 8) & 0x3fff,
      }
    }

    offset = data + size + (size % 2)
  }

  throw new Error('WebP dimensions were not found')
}

function readUInt24LE(source, offset) {
  return source[offset] | (source[offset + 1] << 8) | (source[offset + 2] << 16)
}
