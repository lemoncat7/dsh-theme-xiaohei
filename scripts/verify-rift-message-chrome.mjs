// Native rc.2 DOM contract; no live session or credentials required.
import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
import {RIFT_CSS} from '../lib/rift/styles.js'
import {RIFT_DARK,RIFT_LIGHT} from '../lib/rift/palette.js'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT
 ? pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href : 'playwright-core')
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
const lum=rgb=>rgb.slice(0,3).map(n=>n/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)
const rgb=value=>value.match(/[\d.]+/g).map(Number)
const contrast=(fg,bg)=>{const a=lum(rgb(fg)),b=lum(rgb(bg));return(Math.max(a,b)+.05)/(Math.min(a,b)+.05)}
try{
 const page=await browser.newPage()
 for(const mode of ['light','dark'])for(const width of [390,1440]){
  await page.setViewportSize({width,height:900})
  const tokens=mode==='light'?RIFT_LIGHT:RIFT_DARK
  await page.setContent(`<html data-rift-theme data-xiaohei-appearance="${mode}"><head><style>
   :root {${Object.entries(tokens).map(([k,v])=>`${k}:${v}`).join(';')};--dsw-static-neutral-bluish-00:#fff}
   .native_bubble[role=tooltip] {position:fixed;background:var(--dsw-alias-tooltip-bg);color:var(--dsw-static-neutral-bluish-00);border-radius:8px;padding:3px 7px;display:none}
   .native_actions:hover [role=tooltip],.native_actions:focus-within [role=tooltip] {display:block}
   .native_timeStart,.native_action {color:var(--dsw-alias-label-tertiary)}
   .native_userRow {display:flex;flex-direction:column;align-items:flex-end;gap:6px}
   .native_userStack {display:flex;flex-direction:column;align-items:flex-end;max-width:82%;min-width:0}
   .native_bubble:not([role=tooltip]) {padding:10px 16px}
   ${RIFT_CSS}
  </style></head><body><div id="root">
   <div data-chat-flow-kind="user"><div data-slot="conversation.chat.node"><div><div>
    <div id="message" class="native_bubble">用户消息</div>
    <div class="native_actions"><span class="native_timeStart">2026/10/18 12:30</span><button class="native_action">复制</button>
     <span class="native_bubble" role="tooltip"><span>复制</span></span>
    </div>
   </div></div></div></div>
   <div data-chat-flow-kind="turn-tail"><div data-slot="conversation.chat.node"><div id="tail"><div data-slot="conversation.chat.turnTail">
    <div class="dsh-knowledge-writeback-notice"><div role="status">知识库回写 @lemoncat7/dsh-knowledge 无需收录 <button id="retry">重试</button></div></div>
   </div></div></div></div>
   <div data-chat-flow-kind="tool-call"><div data-slot="conversation.chat.node"><div id="tool">工具结果</div></div></div>
   <div id="process-header"><button id="process-toggle" aria-expanded="false" onclick="const row=document.getElementById('folded');row.toggleAttribute('hidden');if(row.hasAttribute('hidden'))row.setAttribute('hidden','until-found');this.setAttribute('aria-expanded',!row.hasAttribute('hidden'))">正在分析请求</button></div>
   <div id="folded" data-chat-flow-kind="assistant-step" data-chat-group-part="response" data-turn-process-member="true" data-turn-process-hidden="true" hidden="until-found"><div data-slot="conversation.chat.node" style="display:contents"><div class="native_root"><div class="native_body"><div class="native_markdown"><p>过程中的说明</p></div></div></div></div></div>
   <div id="answer" data-chat-flow-kind="assistant-step"><div data-slot="conversation.chat.node"><div><div><p>最终答复</p></div></div></div></div>
  </div></body></html>`)
  const sample=selector=>page.locator(selector).evaluate(el=>{
   const s=getComputedStyle(el);return{color:s.color,bg:s.backgroundColor,image:s.backgroundImage,stroke:s.webkitTextStrokeWidth,border:s.borderWidth,radius:s.borderRadius,shadow:s.boxShadow}
  })
  await page.locator('.native_action').hover()
  await page.getByRole('tooltip').waitFor({state:'visible'})
  const tooltip=await sample('[role=tooltip]'),time=await sample('.native_timeStart'),actions=await sample('.native_actions'),tail=await sample('#tail')
  assert.equal(tooltip.stroke,'0px');assert.equal(tooltip.image,'none');assert.equal(tooltip.border,'0px');assert.equal(tooltip.radius,'0px')
  assert.equal(tooltip.bg,'rgba(0, 0, 0, 0)');assert.equal(tooltip.shadow,'none')
  assert.ok(contrast(tooltip.color,mode==='light'?'rgb(233,233,230)':'rgb(16,18,24)')>=4.5)
  assert.equal(time.stroke,'0px')
  assert.equal(actions.bg,'rgba(0, 0, 0, 0)');assert.equal(actions.shadow,'none')
  assert.ok(contrast(time.color,mode==='light'?'rgb(233,233,230)':'rgb(16,18,24)')>=4.5)
  assert.equal(tail.bg,'rgba(0, 0, 0, 0)');assert.equal(tail.border,'0px');assert.equal(tail.shadow,'none')
  // Loading/unmounted status must not briefly paint an empty bubble.
  await page.locator('.dsh-knowledge-writeback-notice').evaluate(el=>el.classList.remove('dsh-knowledge-writeback-notice'))
  assert.equal((await sample('#tail')).bg,'rgba(0, 0, 0, 0)')
  assert.notEqual((await sample('#tool')).border,'0px')
  assert.notEqual((await sample('#message')).image,'none')
  // Host replaces the pending projection with a durable steering/user node.
  // Both states use UserStyleBubble; its full-width row must never be painted.
  for(const kind of ['steering','user']){
   await page.evaluate(()=>{
    const pending=document.createElement('div');pending.id='followup'
    pending.innerHTML='<div id="followup-row" class="native_userRow" data-pending-steering="true" data-time-hover-root><div class="native_userStack"><div id="followup-bubble" class="native_bubble">第二条消息</div></div><div class="native_actions"><button id="followup-copy">复制</button></div></div>'
    document.querySelector('#root').append(pending)
   })
   const pendingPaint=await sample('#followup-bubble')
   assert.notEqual(pendingPaint.image,'none')
   assert.equal((await sample('#followup-row')).bg,'rgba(0, 0, 0, 0)')
   await page.evaluate(kind=>{
    const flow=document.querySelector('#followup'),row=document.querySelector('#followup-row')
    row.removeAttribute('data-pending-steering')
    const outlet=document.createElement('div');outlet.dataset.slot='conversation.chat.node';outlet.style.display='contents'
    flow.dataset.chatFlowKind=kind;flow.append(outlet);outlet.append(row)
   },kind)
   for(const selector of ['#followup','#followup-row']){
    const paint=await sample(selector)
    assert.equal(paint.bg,'rgba(0, 0, 0, 0)',`${mode}/${width}/${kind}: ${selector} must not paint a full-width strip`)
    assert.equal(paint.image,'none');assert.equal(paint.shadow,'none')
   }
   assert.deepEqual(await sample('#followup-bubble'),pendingPaint,'admission must preserve the bubble appearance')
   assert.ok((await page.locator('#followup-row').boundingBox()).width>(await page.locator('#followup-bubble').boundingBox()).width)
   await page.locator('#followup-copy').click()
   await page.locator('#followup').evaluate(el=>el.remove())
  }
  const folded=page.locator('#folded')
  const checkFolded=async()=>{
   const paint=await sample('#folded')
   assert.equal(paint.image,'none');assert.equal(paint.bg,'rgba(0, 0, 0, 0)');assert.equal(paint.border,'0px')
   assert.equal((await folded.boundingBox()).height,0,'collapsed until-found step must not leave a 24px bubble')
   assert.notEqual(await folded.evaluate(e=>getComputedStyle(e).display),'none','preserve native find-in-page reveal')
   assert.equal(await folded.evaluate(e=>getComputedStyle(e,'::before').content),'none')
  }
  await checkFolded()
  assert.ok((await page.locator('#answer').boundingBox()).height>0)
  await page.locator('#process-toggle').click()
  assert.ok((await folded.boundingBox()).height>24,'disclosure must reveal process')
  assert.notEqual((await sample('#folded')).image,'none')
  await page.locator('#process-toggle').click();await checkFolded()
  await page.mouse.move(width-1,899);await page.locator('.native_action').focus()
  await page.getByRole('tooltip').waitFor({state:'visible'})
  await page.locator('#retry').click()
 }
 console.log('PASS: light/dark × mobile/desktop; pending → steering/user without full-width paint; writeback, tooltips, metadata and tool cards preserved')
}finally{await browser.close()}
