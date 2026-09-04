import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { injectXiaoheiSylvaAvatarModel } from '../lib/scene/avatar-model.js'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = resolve(
  projectRoot,
  'src/shaders/sylva-living-world/sources',
)
const sourcePath = resolve(sourceDirectory, 'inner-green-3d.html')
const outputDirectory = resolve(projectRoot, 'output/3d/xiaohei-idle-v2')
const outputPath = resolve(outputDirectory, 'isolated-review.html')

const source = await readFile(sourcePath, 'utf8')
const reviewStyle = `
<base href="${pathToFileURL(`${sourceDirectory}/`).href}">
<style>
  .dock-wrap,
  .stage > * { visibility: hidden !important; }
  #scene { opacity: 1 !important; }
</style>
`
const reviewSource = injectXiaoheiSylvaAvatarModel(
  source.replace('</head>', `${reviewStyle}</head>`),
).replace(
  "model.rotation.y = Math.PI;",
  "model.rotation.y = Number(new URLSearchParams(location.search).get('angle') || Math.PI);",
)

await mkdir(outputDirectory, { recursive: true })
await writeFile(outputPath, reviewSource, 'utf8')
console.log(outputPath)
