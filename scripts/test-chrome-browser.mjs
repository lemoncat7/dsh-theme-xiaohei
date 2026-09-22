import assert from 'node:assert/strict'
import { XIAOHEI_SIDEBAR_CSS } from '../lib/chrome/sidebar.js'
import { XIAOHEI_CONVERSATION_MESSAGES_CSS } from '../lib/chrome/conversation-messages.js'

// Uses an existing Playwright installation; no host/core code is patched.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright')
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.setContent(`<style>
      :root { --xiaohei-conversation-assistant: #eee; --xiaohei-conversation-edge: #aaa }
      #root [data-slot=sidebar] button { opacity:0; visibility:hidden; pointer-events:none; display:none }
      [data-variant=think] { height:24px }
      ${XIAOHEI_SIDEBAR_CSS}
      ${XIAOHEI_CONVERSATION_MESSAGES_CSS}
    </style><div id="root">
      <div data-slot="sidebar"><div data-xiaohei-sidebar-reveal="waiting">
        <span data-xiaohei-sidebar-brand>Brand</span>
        <button aria-label="收起侧边栏" onclick="this.dataset.clicked='yes'">收起</button>
        <button aria-label="Collapse sidebar">Collapse</button>
        <button aria-label="Collapse sidebar" hidden>Hidden native</button>
      </div></div>
      <div id="thinking" data-chat-flow-kind="assistant-step"><div data-slot="conversation.chat.node"><div><div><div><div data-variant="think">思考</div></div></div></div></div></div>
      <div id="mixed" data-chat-flow-kind="assistant-step"><div data-slot="conversation.chat.node"><div><div><div><div data-variant="think">思考</div></div><div><p>正常正文</p></div></div></div></div></div>
    </div>`)
    await page.getByRole('button', { name: '收起侧边栏', exact: true }).click()
    assert.equal(await page.getByRole('button', { name: '收起侧边栏', exact: true }).getAttribute('data-clicked'), 'yes')
    assert.equal(await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).count(), 1)
    const check = await page.evaluate(() => {
      const row = document.querySelector('#thinking')
      const box = row.querySelector('[data-slot] > div')
      const mixed = document.querySelector('#mixed [data-slot] > div')
      return { height: box.getBoundingClientRect().height, padding: getComputedStyle(box).padding,
        border: getComputedStyle(box).borderWidth, avatar: getComputedStyle(row, '::before').content,
        indent: getComputedStyle(row).paddingInlineStart, mixedPadding: getComputedStyle(mixed).paddingTop }
    })
    assert.equal(check.height, 24)
    assert.equal(check.padding, '0px'); assert.equal(check.border, '0px')
    assert.equal(check.avatar, 'none'); assert.equal(check.indent, '0px')
    assert.notEqual(check.mixedPadding, '0px')
  }
  console.log('Chrome regression: desktop/mobile toggle clicking, hidden controls, thinking-only and mixed messages passed')
} finally { await browser.close() }
