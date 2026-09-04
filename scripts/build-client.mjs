import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build } from 'esbuild'

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

await build({
  entryPoints: ['src/client.ts'],
  outfile: 'lib/client.js',
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  jsx: 'automatic',
  sourcemap: true,
  plugins: [rawImportPlugin],
  external: [
    'react',
    'react/jsx-runtime',
    '@deepseek-ai/dsh-client-ui-theme/client',
  ],
  banner: {
    js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(pluginId)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;`,
  },
  footer: {
    js: 'return module.exports; } });',
  },
})
