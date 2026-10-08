// Isolated rc.2 footer contract; no live profile or credentials required.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { XIAOHEI_SIDEBAR_CSS } from '../lib/chrome/sidebar.js'
const { chromium } = await import(process.env.XIAOHEI_PLAYWRIGHT
  ? pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href : 'playwright-core')
const knowledgeCss = await readFile(new URL('../../dsh-knowledge/src/client.css', import.meta.url), 'utf8')
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
let cases = 0
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } })
  for (const dark of [false, true]) for (const wide of [false, true])
    for (const display of ['flex', 'contents']) for (const oldKnowledge of [false, true])
      for (const nativeColumn of [false, true]) {
        await page.setContent(`<style>
          * { box-sizing: border-box; }
          .sidebar { width: ${wide ? 256 : 48}px; }
          .actions { display: flex; flex-direction: ${nativeColumn ? 'column' : 'row'}; gap: 4px; }
          .slot { display: ${display}; align-items: center; gap: 4px; }
          button { height: 36px; flex: none; }
          .settings { display: flex; flex-direction: row; }
          .aa { display: flex; align-items: center; gap: 6px; }
          ${knowledgeCss}
          ${oldKnowledge ? '.dsh-knowledge-launcher { width:100%; flex:1 0 100%; }' : ''}
          ${XIAOHEI_SIDEBAR_CSS}
        </style><body ${dark ? 'data-ds-dark-theme' : ''}><div id="root">
          <div data-slot="sidebar" class="sidebar"><div>
            <button aria-label="Collapse sidebar">X</button>
            <footer><div class="actions"><div data-slot="sidebar.footer.action" class="slot">
              <div class="dsh-knowledge-launcher${wide ? '' : ' dsh-knowledge-launcher--rail'}">
                <button class="dsh-knowledge-trigger" aria-label="知识库">${wide ? '知识库' : 'K'}</button>
              </div>
              <button class="aa" aria-label="远程控制"><span>A</span>${wide ? '<span>远程控制</span>' : ''}</button>
              <button hidden>Hidden</button>
            </div></div><div data-slot="sidebar.settings" class="settings"><button>设置</button></div></footer>
          </div></div>
          <div class="unrelated" style="display:flex;flex-direction:row"><button>Other</button></div>
        </div></body>`)
        const bounds = await page.locator('.sidebar').boundingBox()
        const knowledge = page.getByRole('button', { name: '知识库', exact: true })
        const remote = page.getByRole('button', { name: '远程控制', exact: true })
        for (const control of [knowledge, remote]) {
          const r = await control.boundingBox()
          assert.ok(r.width >= 24 && r.height >= 24)
          assert.ok(r.x >= bounds.x && r.x + r.width <= bounds.x + bounds.width + 1, 'action overflows sidebar')
          await control.click({ timeout: 10000 })
        }
        const k = await knowledge.boundingBox(), a = await remote.boundingBox()
        assert.ok(a.y >= k.y + k.height, 'actions must stack without overlap')
        await knowledge.focus()
        await page.keyboard.press('Tab')
        assert.equal(await remote.evaluate(el => el === document.activeElement), true)
        for (const selector of ['.aa', '.settings', '.unrelated']) {
          assert.equal(await page.locator(selector).evaluate(el => getComputedStyle(el).flexDirection), 'row')
        }
        assert.equal(await page.locator('[hidden]').isVisible(), false)
        cases++
      }
  console.log(`Footer layout: ${cases} light/dark × wide/rail × slot × old/new knowledge × host-layout cases passed`)
} finally { await browser.close() }
