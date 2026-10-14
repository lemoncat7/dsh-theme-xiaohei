import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { pathToFileURL } from 'node:url'
const { chromium } = await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const bundle = await build({ entryPoints: ['src/scene/runtime.ts'], bundle: true, format: 'iife', globalName: 'wallpaper', write: false, platform: 'browser' })
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  for (const appearance of ['light', 'dark']) for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 800 })
    await page.setContent(`<html data-xiaohei-appearance="${appearance}"><head></head><body><div id="root"></div></body></html>`)
    await page.addScriptTag({ content: bundle.outputFiles[0].text })
    const result = await page.evaluate(async () => {
      // Any scheduling here would cause the test to fail; no character chunk exists.
      window.requestIdleCallback = () => { throw Error('wallpaper must not wait for idle') }
      const dispose = window.wallpaper.installXiaoheiScene(document)
      const world = document.querySelector('.xiaohei-scene__world')
      const image = getComputedStyle(world).backgroundImage
      const img = new Image(); img.src = image.slice(5, -2); await img.decode()
      const result = { present: !!world, background: getComputedStyle(document.body).backgroundColor, decoded: img.naturalWidth > 0, character: !!document.querySelector('.xiaohei-wallpaper-character') }
      dispose(); result.removed = !document.querySelector('[data-xiaohei-scene]')
      return result
    })
    assert.equal(result.present, true); assert.equal(result.decoded, true)
    assert.equal(result.character, false); assert.equal(result.removed, true)
    assert.equal(result.background, appearance === 'light' ? 'rgb(212, 213, 213)' : 'rgb(21, 28, 38)')
  }
  console.log('Immediate wallpaper: light/dark, narrow/wide, decoded without character chunk, cleanup passed')
} finally { await browser.close() }
