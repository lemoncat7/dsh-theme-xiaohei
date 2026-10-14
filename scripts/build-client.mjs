import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build } from 'esbuild'
import { createHash } from 'node:crypto'

const pluginId = '@lemoncat7/dsh-theme-xiaohei'
const rawImportPlugin = {
  name: 'raw-import',
  setup(build) {
    build.onResolve({ filter: /\?raw$/ }, args => ({
      path: resolve(args.resolveDir, args.path.slice(0, -4)),
      namespace: 'raw-import',
    }))
    build.onLoad({ filter: /.*/, namespace: 'raw-import' }, async args => ({
      contents: await readFile(args.path, 'utf8'),
      loader: 'text',
    }))
  },
}

const shared = {
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  minify: true,
  sourcemap: true,
  plugins: [rawImportPlugin],
  external: [
    'react',
    'react/jsx-runtime',
    '@deepseek-ai/dsh-client-ui-theme/client',
  ],
  footer: {
    js: 'return module.exports; } });',
  },
}
const assetRoot = new URL('../src/assets/', import.meta.url)
const manifest = JSON.parse(await readFile(new URL('runtime/manifest.json', assetRoot), 'utf8'))
const digest = data => createHash('sha256').update(data).digest('hex')
async function runtimeImage(name) {
  const record = manifest.assets[name]
  const source = await readFile(new URL(name, assetRoot))
  const bytes = await readFile(new URL(`runtime/${name}`, assetRoot))
  if (!record || digest(source) !== record.sourceSha256 || digest(bytes) !== record.runtimeSha256) {
    throw Error(`Stale compressed character asset: ${name}; run scripts/compress-character-assets.py`)
  }
  return `data:image/webp;base64,${bytes.toString('base64')}`
}
async function dataChunk(chunk, contents) {
  await build({ ...shared, stdin: { contents, loader: 'js' }, outfile: `lib/${chunk}`,
    banner: { js: `window.__ModuleLoader__.load({id:${JSON.stringify(pluginId)},chunk:${JSON.stringify(chunk)},factory:(require)=>{var module={exports:{}};var exports=module.exports;` },
  })
}
for (const [pose, version] of Object.entries({seated:'v7',peek:'v7',chin:'v8',doze:'v8',halfpeek:'v8'})) {
  for (const mode of ['light','dark']) {
    const image = await runtimeImage(`background/xiaohei-${pose}-${version}-${mode}.webp`)
    await dataChunk(`client.pose-${pose}-${mode}.js`, `export const image=${JSON.stringify(image)}`)
  }
}
const catalog = JSON.parse(await readFile(new URL('character-motion/catalog.json', assetRoot), 'utf8'))
for (const [pose, modes] of Object.entries(catalog)) for (const [mode, rig] of Object.entries(modes)) {
  for (const layer of Object.values(rig.layers)) {
    layer.src = await runtimeImage(`character-motion/${layer.file}`)
    delete layer.file
  }
  await dataChunk(`client.rig-${pose}-${mode}.js`, `export const rig=${JSON.stringify(rig)}`)
}
// Publish the chunk before stamping the owner entry: DSH derives all chunk
// revisions from client.js and serves these immutable resources on every carrier.
for (const [entry, output, chunk] of [
  ['src/decorations-entry.ts', 'lib/client.decorations.js', 'client.decorations.js'],
  ['src/client-entry.ts', 'lib/client.js', undefined],
]) await build({
  ...shared,
  entryPoints: [entry],
  outfile: output,
  banner: { js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(pluginId)}, ${chunk ? `chunk: ${JSON.stringify(chunk)}, ` : ''}factory: (require) => { var module = { exports: {} }; var exports = module.exports;` },
})
