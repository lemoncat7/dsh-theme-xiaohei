import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
import {build} from 'esbuild'
import {RIFT_CSS} from '../lib/rift/styles.js'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT?pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href:'playwright-core')
const bundle=await build({stdin:{contents:`import {createRiftImpulse} from './src/rift/impulse.ts';import {bindRiftInteractions} from './src/rift/interaction.ts';window.install=()=>{const impulse=createRiftImpulse(document);const unbind=bindRiftInteractions(document,(signal,target)=>impulse.show(signal,target));return()=>{unbind();impulse.dispose()}}`,resolveDir:process.cwd()},bundle:true,write:false,format:'iife'})
const browser=await chromium.launch({args:['--no-sandbox']})
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}})
 for(const mode of ['light','dark']){
  await page.setContent(`<html data-rift-theme data-xiaohei-appearance="${mode}"><head><style>${RIFT_CSS}</style></head><body><div id="root">
  <div data-slot="sidebar.workspaces"><button data-row-key="session:test" style="width:240px;height:36px">会话</button></div>
  <div style="transform:translate(40px,20px);margin:70px"><div data-composer-card="true" style="position:relative;width:600px;height:120px"><textarea></textarea></div></div>
  <div data-files-entry="file"><button style="width:150px;height:30px">文件</button></div></div>
  <div data-slot="shell.overlay" style="transform:translate(50px,40px)"></div></body></html>`)
  await page.addScriptTag({content:bundle.outputFiles[0].text})
  await page.evaluate(()=>window.dispose=window.install())
  const composer=page.locator('[data-composer-card]'),outline=page.locator('.rift-impulse')
  const before=await composer.boundingBox()
  await page.locator('textarea').focus();await outline.waitFor()
  assert.deepEqual(await composer.boundingBox(),before,'native composer must not bounce')
  assert.deepEqual(await outline.boundingBox(),before,'outline must not inherit shell overlay transform')
  assert.equal(await outline.evaluate(e=>e.parentElement.tagName),'BODY')
  assert.equal(await outline.evaluate(e=>getComputedStyle(e).pointerEvents),'none')
  assert.equal(await outline.locator('.rift-impulse__edge').evaluate(e=>getComputedStyle(e).animationName),'rift-impulse')
  const shards=await outline.locator('.rift-impulse__shard').evaluateAll(elements=>elements.map(e=>{
   const s=getComputedStyle(e)
   return {width:s.width,height:s.height,animation:s.animationName,dx:s.getPropertyValue('--rift-dx'),dy:s.getPropertyValue('--rift-dy'),left:s.left,right:s.right}
  }))
  assert.equal(shards.length,2)
  assert.deepEqual(shards.map(s=>[s.width,s.height,s.animation,s.dx,s.dy]),[
   ['4px','32px','rift-shard','-17px','-22px'],['4px','32px','rift-shard','17px','22px'],
  ])
  assert.equal(shards[0].left,'-6px');assert.equal(shards[1].right,'-6px')
  await composer.evaluate(e=>{e.style.width='780px';e.style.height='180px'})
  await page.waitForTimeout(40)
  assert.deepEqual(await outline.boundingBox(),await composer.boundingBox(),'resized composer contour')
  await page.locator('[data-row-key]').click();await outline.waitFor()
  assert.equal(await outline.count(),1)
  assert.deepEqual(await outline.boundingBox(),await page.locator('[data-row-key]').boundingBox())
  await page.locator('[data-files-entry] button').click();await page.waitForTimeout(40)
  assert.deepEqual(await outline.boundingBox(),await page.locator('[data-files-entry] button').boundingBox())
  await page.waitForTimeout(950);assert.equal(await outline.count(),0)
  await page.locator('[data-row-key]').click();await outline.waitFor()
  await page.evaluate(()=>document.documentElement.setAttribute('data-rift-paused',''));assert.equal(await outline.count(),0)
  await page.evaluate(()=>document.documentElement.removeAttribute('data-rift-paused'))
  await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-row-key]').click();assert.equal(await outline.count(),0)
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.locator('[data-row-key]').click();await outline.waitFor()
  await page.evaluate(()=>window.dispose());assert.equal(await outline.count(),0)
 }
 console.log('PASS: light/dark contour geometry, live resize, native controls stationary, replace/expiry/pause/reduced-motion/dispose')
}finally{await browser.close()}
