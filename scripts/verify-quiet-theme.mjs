import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {build} from 'esbuild'
import {injectRiftBoot} from '../lib/rift/boot.js'
const {chromium}=await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const bundle=(await build({stdin:{contents:`
 import{installRiftChrome}from'./src/rift/styles.ts';import{bindViewPalette}from'./src/rift/quiet-palette.ts';import{setView}from'./src/rift/view.ts';
 window.setView=mode=>setView(window,mode);window.stopChrome=installRiftChrome(document);
 bindViewPalette({overrideTokens(source,tokens){const dark=document.documentElement.dataset.xiaoheiAppearance==='dark';for(const[k,v]of Object.entries(tokens))document.body.style.setProperty(k,dark?v.dark:v.light);return()=>{for(const k of Object.keys(tokens))document.body.style.removeProperty(k)}}},window);
 `,resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'iife'})).outputFiles[0].text
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']})
await mkdir('/tmp/quiet-theme-review',{recursive:true})
try{
 for(const scheme of ['light','dark'])for(const mode of ['gradient','solid'])for(const width of [375,1440]){
  const page=await browser.newPage({viewport:{width,height:900},colorScheme:scheme})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.setContent(injectRiftBoot(`<html data-rift-view="${mode}" data-xiaohei-appearance="${scheme}"><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}body{margin:0;font:14px/1.6 system-ui}#root{display:flex;min-height:100vh;color:var(--dsw-alias-label-primary)}aside{width:240px;flex-shrink:0}aside>div{height:100%;padding:20px 12px}main{flex:1;min-width:0}header{height:64px;padding:20px}article{max-width:800px;padding:48px 24px;margin:auto}button{font:inherit;color:inherit;cursor:pointer}button.native_newSession{width:100%;padding:8px}nav{margin-top:28px}[role=treeitem]{padding:10px;margin:4px 0}.native_bubble{padding:12px 16px;max-width:80%;margin-left:auto}.native_actions{text-align:right;color:var(--dsw-alias-label-tertiary);font-size:12px;margin:6px 0 24px}[data-composer-card]{margin-top:64px;padding:16px}textarea{width:100%;height:70px;border:0;font:inherit;resize:none}section>div[role=menu]{margin:20px 24px;width:180px;padding:6px}[role=menuitem]{padding:8px}.writeback{color:var(--dsw-alias-label-tertiary);font-size:12px}[hidden='until-found']{content-visibility:hidden}footer{margin-top:40px}.native_actions button{border:0;background:none}.swatch{background:var(--dsw-alias-bg-overlay);padding:12px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px}
  @media(max-width:760px){aside{width:100px}aside>div{padding:12px 6px}[role=treeitem]{padding:8px;font-size:12px}article{padding:24px 12px}header{padding:16px}[data-composer-card]{padding:10px}.native_bubble{max-width:100%}}
  </style></head><body><div id="root"><aside data-slot="sidebar"><div><div class="rift-brand"><strong>界隙</strong><small>RIFT</small></div><button class="native_newSession">新建会话</button><nav data-slot="sidebar.workspaces"><div role="treeitem" aria-selected="true">项目方案</div><div role="treeitem" aria-expanded="true">文档整理</div><div role="treeitem">工作日报</div></nav><footer data-slot="sidebar.footer.action"><button class="rift-motion">界隙外观</button></footer></div></aside><main><div data-slot="conversation.header"><header>项目方案　/　产品设计</header></div><article data-conversation-scroll><div data-chat-flow-kind="user"><div class="native_bubble">请整理一下这次讨论的要点，给出后续安排。</div><div class="native_actions">14:32　<button>复制</button></div></div><div data-chat-flow-kind="assistant-step"><h2>让工作界面回归内容</h2><p>统一边栏、消息与控件的视觉语言，保留清晰的层次和阅读节奏。</p><div class="swatch">工具执行完成 · 已整理 3 项待办</div></div><div data-chat-flow-kind="assistant-step" hidden="until-found"><div>折叠的分析过程</div></div><div class="writeback" data-chat-flow-kind="turn-tail">知识库回写　无需收录</div><div data-composer-card="true"><textarea placeholder="继续讨论…"></textarea><button>发送</button></div></article><section><div role="menu"><div role="menuitem">复制链接</div><div role="menuitem">导出会话</div></div></section></main></div></body></html>`))
  await page.addScriptTag({content:bundle})
  const sample=selector=>page.locator(selector).first().evaluate(e=>{const s=getComputedStyle(e);return{radius:s.borderRadius,shadow:s.boxShadow,image:s.backgroundImage,bg:s.backgroundColor,stroke:s.webkitTextStrokeWidth,border:s.borderWidth,before:getComputedStyle(e,'::before').content,font:s.fontFamily}})
  const composer=await sample('[data-composer-card]'),bubble=await sample('.native_bubble'),sidebar=await sample('aside>div'),header=await sample('header'),menu=await sample('[role=menu]'),row=await sample('[aria-selected=true]')
  assert.equal(composer.radius,'14px');assert.equal(composer.border,'1px');assert.equal(composer.before,'none')
  assert.equal(bubble.radius,'14px');assert.equal(bubble.stroke,'0px');assert.equal(bubble.shadow,'none')
  assert.equal(sidebar.radius,'0px');assert.equal(sidebar.shadow,'none');assert.equal(header.radius,'0px')
  assert.equal(menu.radius,'12px');assert.equal(menu.image,'none');assert.equal(row.radius,'8px');assert.equal(row.shadow,'none')
  if(mode==='solid'){assert.equal(sidebar.image,'none');assert.equal(header.image,'none');assert.equal(bubble.image,'none')}
  else{assert.match(sidebar.image,/gradient/);assert.match(header.image,/gradient/);assert.match(bubble.image,/gradient/)}
  assert.equal((await page.locator('[hidden="until-found"]').boundingBox()).height,0)
  assert.equal((await sample('[data-chat-flow-kind="turn-tail"]')).image,'none')
  await page.locator('textarea').focus()
  await page.screenshot({path:`/tmp/quiet-theme-review/${mode}-${scheme}-${width}.png`})
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
  // Right panel and portalled/fixed menus must share the palette without
  // introducing a filtered containing block or leaking the artwork material.
  await page.evaluate(()=>{
   const panel=document.createElement('section');panel.dataset.slot='rightbar'
   panel.innerHTML='<div id="quiet-right-panel"><div role="dialog" id="quiet-dialog" style="position:fixed;right:8px;top:8px;width:240px;padding:16px"><label>名称<input value="项目方案"></label></div></div>'
   document.getElementById('root').append(panel)
  })
  const right=await sample('#quiet-right-panel'),dialog=await sample('#quiet-dialog'),field=await sample('#quiet-dialog input')
  assert.equal(right.image,sidebar.image);assert.equal(right.bg,sidebar.bg)
  assert.equal(dialog.radius,'16px');assert.equal(dialog.image,'none');assert.equal(field.radius,'8px')
  const fixed=await page.locator('#quiet-dialog').boundingBox()
  assert.equal(Math.round(fixed.x+fixed.width),width-8);assert.equal(Math.round(fixed.y),8)
  await page.locator('[data-slot="rightbar"]').evaluate(e=>e.remove())
  await page.evaluate(()=>window.setView('full'))
  assert.equal((await sample('[data-composer-card]')).radius,'4px 24px')
  await page.evaluate(mode=>window.setView(mode),mode)
  assert.equal((await sample('[data-composer-card]')).radius,'14px')
  assert.deepEqual(errors,[])
  await page.close()
 }
 console.log('PASS: independent theme switch; gradient/solid × light/dark × mobile/desktop; sidebar/header/message/composer/menu/selection, folded history, no outlines/glass, restoration')
}finally{await browser.close()}
