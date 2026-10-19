import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
import {RIFT_CSS} from '../lib/rift/styles.js'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT?pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href:'playwright-core')
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}})
 for(const mode of ['light','dark']){
  await page.setContent(`<html data-rift-theme data-xiaohei-appearance="${mode}"><head><style>
   [data-slot=sidebar]{width:278px} [role=treeitem]{position:relative;display:flex;align-items:center;height:36px;padding:0 8px;margin:4px 10px}
   .native_title{flex:1}.native_newSession{width:240px;height:40px}button{cursor:pointer}
   ${RIFT_CSS}
  </style></head><body><div id="root"><div data-slot="sidebar"><div>
   <button class="native_newSession">新会话</button><div data-slot="sidebar.workspaces">
   <div id="project" role="treeitem" aria-expanded="true"><span>项目</span></div>
   <div id="selected" role="treeitem" aria-selected="true" tabindex="0"><span class="native_title">当前会话</span><button id="menu" onclick="this.dataset.clicked='yes'">⋯</button></div>
   <div id="other" role="treeitem" aria-selected="false" tabindex="0"><span>其他会话</span></div>
   </div></div></div>
   <div style="transform:translate(25px,12px);margin:40px"><div id="composer" data-composer-card="true" style="width:600px;height:110px"><textarea aria-label="消息"></textarea></div></div>
   </div><div data-slot="shell.overlay" style="transform:translate(40px,20px)"></div></body></html>`)
  const initial=await page.locator('#selected').boundingBox()
  const css=()=>page.locator('#selected').evaluate(el=>({before:getComputedStyle(el,'::before').content,after:getComputedStyle(el,'::after').animationName}))
  assert.equal((await css()).before,'none');assert.equal((await css()).after,'none')
  const composer=page.locator('#composer'),bounds=await composer.boundingBox()
  await page.getByRole('textbox',{name:'消息'}).focus()
  assert.deepEqual(await composer.boundingBox(),bounds)
  const contour=()=>composer.evaluate(el=>{const s=getComputedStyle(el,'::before');return{left:s.left,right:s.right,width:parseFloat(s.width),height:parseFloat(s.height),animation:s.animationName}})
  const first=await contour();assert.equal(first.left,'-7px');assert.equal(first.right,'-7px');assert.equal(first.animation,'none')
  await composer.evaluate(el=>{el.style.width='780px';el.style.height='180px'})
  const grown=await contour();assert.equal(grown.width-first.width,180);assert.equal(grown.height-first.height,70)
  await page.waitForTimeout(200)
  assert.deepEqual(await page.locator('#selected').boundingBox(),initial)
  await page.locator('#menu').click();assert.equal(await page.locator('#menu').getAttribute('data-clicked'),'yes')
  await page.locator('.native_newSession').hover()
  assert.equal(await page.locator('.native_newSession').evaluate(el=>getComputedStyle(el,'::after').animationName),'rift-sidebar-gate')
  await page.evaluate(()=>document.documentElement.setAttribute('data-rift-paused',''))
  assert.equal((await css()).after,'none')
  await page.evaluate(()=>document.documentElement.removeAttribute('data-rift-paused'))
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal((await css()).after,'none')
  await page.emulateMedia({reducedMotion:'no-preference',forcedColors:'active'})
  assert.equal(await page.locator('#selected').evaluate(el=>getComputedStyle(el,'::after').display),'none')
  await page.emulateMedia({forcedColors:'none'})
  await page.evaluate(()=>{document.querySelector('#selected').setAttribute('aria-selected','false');document.querySelector('#other').setAttribute('aria-selected','true')})
  assert.equal((await css()).after,'none')
  assert.equal(await page.locator('#other').evaluate(el=>getComputedStyle(el,'::after').animationName),'none')
  await page.setViewportSize({width:390,height:844})
  assert.equal(await page.locator('#other').evaluate(el=>getComputedStyle(el,'::after').animationName),'none')
  await page.setViewportSize({width:1280,height:900})
 }
 console.log('PASS: no session ears/current/follow, composer contour tracks actual resizing without jumping, native menus and motion fallbacks preserved')
}finally{await browser.close()}
