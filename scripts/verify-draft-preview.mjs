import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { XiaoheiDraftPreview } from '../lib/composer-draft-preview.js'
import { XIAOHEI_CHROME_CSS } from '../lib/chrome.js'
const { chromium } = await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  for (const dark of [false, true]) for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 800 })
    await page.setContent(`<html data-xiaohei-appearance="${dark ? 'dark' : 'light'}"><style>*{box-sizing:border-box}body{margin:12px}#root{--dsh-composer-side-clearance:24px;--dsh-chat-content-width:748px}.reference-scroll{padding:16px calc(var(--dsh-composer-side-clearance) + 16px)}.reference-column{max-width:var(--dsh-chat-content-width);width:100%;margin:0 auto}.reference-user{display:flex;justify-content:flex-end}@media(width <= 760px){.reference-user{padding-right:38px}}${XIAOHEI_CHROME_CSS}</style><div id="root"><div class="reference-scroll"><div class="reference-column"><div class="reference-user"><span id="reference-bubble">正式消息</span></div></div></div><div id="draft-seat"></div></div>`)
    // Render the real component's element tree without a second React runtime.
    for (const draft of ['你', '你好\n第二行', '<script>alert(1)</script>', '长文本/'.repeat(2000), '', '另一个会话']) {
      const node = XiaoheiDraftPreview({ input: { draft, phase: 'plain' } })
      await page.evaluate(tree => {
        function render(node) {
          if (typeof node === 'string') return document.createTextNode(node)
          const el = document.createElement(node.type)
          for (const [key, value] of Object.entries(node.props)) {
            if (key === 'children') for (const child of Array.isArray(value) ? value : [value]) el.append(render(child))
            else el.setAttribute(key === 'className' ? 'class' : key, value)
          }
          return el
        }
        const root = document.getElementById('draft-seat')
        root.replaceChildren(...(tree ? [render(tree)] : []))
      }, node ? JSON.parse(JSON.stringify(node)) : null)
      assert.equal(await page.locator('[data-xiaohei-draft-preview]').count(), draft ? 1 : 0)
      if (draft) {
        assert.equal(await page.locator('.xiaohei-draft-bubble').textContent(), draft)
        assert.ok((await page.locator('.xiaohei-draft-bubble').boundingBox()).height <= 161)
        const bubble = await page.locator('.xiaohei-draft-bubble').boundingBox()
        const reference = await page.locator('#reference-bubble').boundingBox()
        assert.ok(Math.abs(bubble.x + bubble.width - reference.x - reference.width) < 1, 'draft aligns with the native message column, not the page edge')
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    }
  }
  console.log('Draft preview: light/dark, mobile/desktop, long text, safe text and clearing passed')
} finally { await browser.close() }
