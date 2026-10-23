import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {createRequire} from 'node:module'
import {dirname} from 'node:path'
import {pathToFileURL} from 'node:url'
import {build} from 'esbuild'
import {injectRiftBoot} from '../lib/rift/boot.js'
const require=createRequire(import.meta.url)
const {chromium}=await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const code=(await build({stdin:{contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';
 import {RiftMotion,RiftMark,RiftBrand} from './src/rift/controls.tsx';
 import {bindRiftPresentation} from './src/rift/view.ts';
 import {installRiftChrome} from './src/rift/styles.ts';
 installRiftChrome(document);
 window.mounts=0;window.unmounts=0;
 window.stop=bindRiftPresentation(document,()=>{window.mounts++;const scene=document.createElement('div');scene.className='rift-scene';document.body.prepend(scene);return()=>{window.unmounts++;scene.remove()}});
 createRoot(document.getElementById('root')).render(<aside data-slot="sidebar"><div><RiftMark/><RiftBrand/><footer data-slot="sidebar.footer.action"><RiftMotion wide/></footer></div></aside>);
 `,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',jsx:'automatic',
 alias:{react:dirname(require.resolve('react/package.json')),'react-dom/client':process.env.XIAOHEI_REACT_DOM||require.resolve('react-dom/client')},define:{'process.env.NODE_ENV':'"production"'}})).outputFiles[0].text
const browser=await chromium.launch({args:['--no-sandbox']})
await mkdir('/tmp/rift-view-review',{recursive:true})
try{
 for(const appearance of ['light','dark'])for(const width of [375,1440]){
  const page=await browser.newPage({colorScheme:appearance,viewport:{width,height:860}})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  const html=injectRiftBoot(`<html data-rift-theme data-xiaohei-appearance="${appearance}"><head><meta charset="utf-8"><style>
  body{margin:0;font:14px system-ui}aside{width:248px;height:100vh}aside>div{height:100%;padding:12px;box-sizing:border-box;display:flex;flex-direction:column}footer{margin-top:auto}
  </style></head><body><div id="root"></div></body></html>`)
  await page.route('http://rift.test/',r=>r.fulfill({contentType:'text/html; charset=utf-8',body:html}))
  await page.goto('http://rift.test/')
  await page.evaluate(()=>localStorage.setItem('dsh-theme-xiaohei/rift-view','solid'))
  await page.reload()
  const initial=await page.evaluate(()=>({mode:document.documentElement.dataset.riftView,bg:getComputedStyle(document.documentElement).backgroundImage,base:getComputedStyle(document.documentElement).backgroundColor}))
  assert.equal(initial.mode,'solid');assert.equal(initial.bg,'none')
  assert.equal(initial.base,appearance==='light'?'rgb(245, 245, 245)':'rgb(32, 33, 36)')
  await page.addScriptTag({content:code})
  await page.getByRole('button',{name:'界隙外观',exact:true}).click()
  const dialog=page.locator('dialog')
  await dialog.waitFor({state:'visible'})
  assert.equal(await page.evaluate(()=>window.mounts),0)
  await page.getByRole('radio',{name:'柔和渐变'}).check()
  assert.match(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundImage),/gradient/)
  assert.doesNotMatch(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundImage),/url/)
  assert.equal(await page.getByRole('checkbox',{name:'完整界隙动效'}).isDisabled(),true)
  assert.equal(await page.evaluate(()=>window.mounts),0)
  await page.screenshot({path:`/tmp/rift-view-review/${appearance}-${width}.png`})
  const bounds=await dialog.boundingBox()
  assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width&&bounds.y>=0&&bounds.y+bounds.height<=860)
  await page.getByRole('radio',{name:'完整界隙',exact:false}).check()
  assert.equal(await page.evaluate(()=>window.mounts),1)
  const motion=page.getByRole('checkbox',{name:'完整界隙动效'})
  await motion.uncheck()
  await page.getByRole('radio',{name:'纯色专注'}).check()
  assert.equal(await page.evaluate(()=>window.unmounts),1)
  await page.getByRole('radio',{name:'完整界隙',exact:false}).check()
  assert.equal(await motion.isChecked(),false,'motion preference survives presentation changes')
  await page.getByRole('radio',{name:'柔和渐变'}).check()
  await page.keyboard.press('ArrowDown')
  assert.equal(await page.getByRole('radio',{name:'纯色专注'}).isChecked(),true,'native radio keyboard navigation')
  await page.keyboard.press('Escape')
  await dialog.waitFor({state:'hidden'})
  assert.equal(await page.getByRole('button',{name:'界隙外观',exact:true}).evaluate(e=>e===document.activeElement),true)
  await page.getByRole('button',{name:'界隙外观',exact:true}).click()
  await page.mouse.click(width-4,4)
  await dialog.waitFor({state:'hidden'})
  await page.reload()
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.riftView),'solid')
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).backgroundImage),'none')
  assert.deepEqual(errors,[])
  await page.close()
 }
 console.log('PASS: actual React picker, paired quiet first paint, mobile/desktop layout, unmount/remount, preserved motion, native keyboard/Escape/backdrop/focus, reload persistence')
}finally{await browser.close()}
