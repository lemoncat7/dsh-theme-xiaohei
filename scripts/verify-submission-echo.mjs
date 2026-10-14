import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
import {XIAOHEI_CHROME_CSS} from '../lib/chrome.js'
const {chromium}=await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
try {
  const page=await browser.newPage({reducedMotion:'reduce'})
  for(const dark of [false,true]) for(const width of [375,1280]) {
    await page.setViewportSize({width,height:800})
    await page.setContent(`<html data-xiaohei-appearance="${dark?'dark':'light'}"><style>
      *{box-sizing:border-box}body{margin:0;padding:12px}#root{width:100%}
      @media(width > 760px){body{padding-inline:64px}}
      .row{display:flex;justify-content:flex-end}.stack{max-width:85%;min-width:0}
      .bubble{white-space:pre-wrap;overflow-wrap:anywhere;padding:8px;border-radius:8px}
      [data-message-attachments]{display:flex;gap:8px}.file{border:1px solid gray;padding:8px}img{width:72px;height:48px}
      li{display:flex;gap:8px;padding:8px;flex-wrap:wrap}.preview{flex:1;min-width:0;overflow-wrap:anywhere}li[data-submission-echo]{opacity:.5}button:disabled{opacity:.4}
      ${XIAOHEI_CHROME_CSS}
    </style><div id="root">
      <div id="text" class="row" data-submission-echo="true"><div class="stack"><div class="bubble">提前回显的消息 ${'long-reference/'.repeat(10)}</div></div></div>
      <div id="steer" class="row" data-pending-steering="true"><div class="stack"><div class="bubble">插话内容</div></div></div>
      <div id="file" class="row" data-submission-echo="true"><div class="stack"><div data-message-attachments><span class="file">report.md</span></div></div></div>
      <div id="mixed" class="row" data-submission-echo="true"><div class="stack"><div data-message-attachments><img alt="预览" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"></div><div class="bubble">附图说明</div><div id="reference">引用摘要</div></div></div>
      <ul><li data-submission-echo id="queue"><span class="preview">排队消息</span><span role="status">发送中…</span><button disabled>编辑</button><button disabled>移除</button></li></ul>
    </div>`)
    const style=selector=>page.locator(selector).evaluate(el=>{const s=getComputedStyle(el);return {background:s.backgroundColor,padding:s.padding,border:s.borderRadius,opacity:s.opacity,visible:s.visibility}})
    const text=await style('#text .bubble'),steer=await style('#steer .bubble')
    assert.notEqual(text.background,'rgba(0, 0, 0, 0)');assert.equal(text.background,steer.background)
    assert.equal(text.border,'18px 9px 18px 18px')
    const avatar=await page.locator('#text').evaluate(el=>{const s=getComputedStyle(el,'::after');return {content:s.content,width:s.width,right:s.right,display:s.display}})
    assert.equal(avatar.content,'"我"')
    assert.equal(avatar.width,width<=760?'32px':'40px')
    assert.equal(avatar.right,width<=760?'0px':'-50px')
    assert.notEqual(avatar.display,'none')
    assert.equal(await page.locator('#queue').evaluate(el=>getComputedStyle(el,'::after').content),'none')
    assert.equal((await style('#file [data-message-attachments]')).padding,'0px')
    assert.equal((await style('#reference')).padding,'0px')
    assert.equal((await style('#mixed .bubble')).background,text.background)
    assert.equal((await style('#queue')).opacity,'1')
    assert.equal(await page.getByRole('button',{name:'编辑'}).isDisabled(),true)
    assert.equal(await page.getByRole('status').isVisible(),true)
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)
    // Host settlement removes the echo; theme must not leave overlays or controls.
    await page.evaluate(()=>document.querySelector('#text').remove())
    assert.equal(await page.locator('#text').count(),0)
  }
  console.log('PASS: light/dark, 375/1280, text/steering/file/image echoes, native disabled actions and removal')
} finally {await browser.close()}
