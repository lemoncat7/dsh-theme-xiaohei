import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDirectory = resolve(
  projectRoot,
  'src/shaders/sylva-living-world/sources',
)
const sourcePath = resolve(sourceDirectory, 'inner-green-3d.html')
const outputDirectory = resolve(projectRoot, 'output/3d/sylva-2d-layers')
const reviewPath = resolve(outputDirectory, 'layer-export.html')
const assetDirectory = resolve(projectRoot, 'src/assets/background')

const playwrightModule = process.env.PLAYWRIGHT_CORE_PATH ?? 'playwright-core'
const chromiumExecutable = process.env.CHROMIUM_EXECUTABLE

const { chromium } = await import(playwrightModule)

const source = await readFile(sourcePath, 'utf8')
const base = `<base href="${pathToFileURL(`${sourceDirectory}/`).href}">`
const exportStyle = `<style data-sylva-layer-export>
  html, body, .hero { background: transparent !important; }
  body::before, body::after, .hero::before, .hero::after,
  .stage > *, .dock-wrap { visibility: hidden !important; }
  #scene { opacity: 1 !important; }
</style>`

const instrumented = source
  .replace('<head>', `<head>${base}${exportStyle}`)
  .replace(
    'new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !small })',
    'new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !small, preserveDrawingBuffer: true })',
  )
  .replace(
    'if (++frames === 2) window.__ready = true;',
    `if (++frames === 2) {
      window.__ready = true;
      window.__sylvaExport = {
        renderer: renderer,
        scene: scene,
        camera: camera,
        near: nearGroup,
        far: farGroup,
        motes: motes,
        shadow: shadowMesh,
        glow: glowMesh,
        render: function () { renderer.render(scene, camera); }
      };
    }`,
  )

await mkdir(outputDirectory, { recursive: true })
await mkdir(assetDirectory, { recursive: true })
await writeFile(reviewPath, instrumented, 'utf8')

const browser = await chromium.launch({
  headless: true,
  ...(chromiumExecutable ? { executablePath: chromiumExecutable } : {}),
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
  ],
})

const page = await browser.newPage({
  viewport: { width: 1600, height: 900 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
})

page.on('pageerror', (error) => console.error(error))
await page.goto(`${pathToFileURL(reviewPath).href}?blades=18000`, {
  waitUntil: 'domcontentloaded',
  timeout: 30_000,
})
await page.waitForFunction(() => window.__ready === true, { timeout: 90_000 })
await page.waitForTimeout(4_200)

const layers = [
  { name: 'far', visible: ['far'] },
  { name: 'near', visible: ['near'] },
  { name: 'atmosphere', visible: ['motes'] },
  { name: 'lighting', visible: ['shadow', 'glow'] },
  { name: 'composite', visible: ['near', 'far', 'motes', 'shadow', 'glow'] },
]

for (const layer of layers) {
  const dataUrl = await page.evaluate((visible) => {
    const exported = window.__sylvaExport
    for (const key of ['near', 'far', 'motes', 'shadow', 'glow']) {
      if (exported[key]) exported[key].visible = visible.includes(key)
    }
    exported.render()
    return exported.renderer.domElement.toDataURL('image/png')
  }, layer.visible)
  const encoded = dataUrl.slice(dataUrl.indexOf(',') + 1)
  await writeFile(
    resolve(assetDirectory, `sylva-${layer.name}-source.png`),
    Buffer.from(encoded, 'base64'),
  )
}

await browser.close()
console.log(assetDirectory)
