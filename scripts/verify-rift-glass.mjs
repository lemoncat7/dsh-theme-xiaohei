import assert from 'node:assert/strict'
import {readFile,mkdir} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {RIFT_CSS} from '../lib/rift/styles.js'
const {chromium}=await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const browser=await chromium.launch({args:['--no-sandbox']})
await mkdir('/tmp/rift-glass-review',{recursive:true})
try{
 const page=await browser.newPage({viewport:{width:1440,height:960}})
 for(const mode of ['light','dark']){
  const image='data:image/webp;base64,'+(await readFile(`src/assets/rift/scene${mode==='light'?'-light':''}-detail.webp`)).toString('base64')
  await page.setContent(`<html data-rift-theme data-xiaohei-appearance="${mode}"><style>
   body{margin:0;font:14px system-ui}.rift-scene{position:fixed;inset:0;z-index:0}#root{display:flex;height:100vh;position:relative;z-index:1}aside{width:260px;flex:none}[data-slot=sidebar]>div{height:100%;box-sizing:border-box;padding:20px}main{flex:1}header{height:60px;box-sizing:border-box;padding:18px 24px}button{font:inherit;color:inherit;border:0;background:none;padding:10px}.row{padding:12px;margin-top:8px}
   </style><div class="rift-scene"><img src="${image}"></div><div id="root">
   <aside data-slot="sidebar"><div><h2>小黑 · 工作空间</h2><button>＋ 新建会话</button><div data-slot="sidebar.workspaces"><div role="treeitem" aria-expanded="true" class="row">我的项目</div><div role="treeitem" aria-selected="true" class="row">正在进行的会话</div><div role="treeitem" class="row">资料整理与创作</div></div><div id="fixed-probe" style="position:fixed;right:0;bottom:0;width:10px;height:10px"></div></div></aside>
   <main><div data-slot="conversation.header"><header>会话 · 轻玻璃材质</header></div></main></div></html>`)
  const before=await page.locator('header').boundingBox()
  await page.addStyleTag({content:RIFT_CSS})
  assert.deepEqual(await page.locator('header').boundingBox(),before)
  for(const selector of ['header','[data-slot=sidebar]>div']){
   const s=await page.locator(selector).evaluate(el=>({filter:getComputedStyle(el).backdropFilter,pseudo:getComputedStyle(el,'::before').backdropFilter,events:getComputedStyle(el,'::before').pointerEvents,bg:getComputedStyle(el).backgroundImage}))
   assert.equal(s.filter,'none');assert.equal(s.pseudo,'blur(8px)');assert.equal(s.events,'none');assert.match(s.bg,/linear-gradient/)
  }
  const accent=await page.locator('[data-slot=sidebar]').evaluate(el=>getComputedStyle(el).getPropertyValue('--rift-aura').trim())
  assert.equal(accent,mode==='light'?'#315d8a':'#b2d7ff','sidebar accents follow the blue glass, not global green')
  assert.deepEqual(await page.locator('#fixed-probe').boundingBox(),{x:1430,y:950,width:10,height:10},'fixed descendants remain viewport anchored')
  await page.screenshot({path:`/tmp/rift-glass-review/${mode}.png`})
  await page.emulateMedia({forcedColors:'active'})
  assert.equal(await page.locator('header').evaluate(el=>getComputedStyle(el,'::before').display),'none')
  await page.emulateMedia({forcedColors:'none'})
 }
 console.log('PASS: light/dark glass, unchanged header geometry, nonintercepting decorations, viewport-fixed child and forced-colors fallback')
}finally{await browser.close()}
