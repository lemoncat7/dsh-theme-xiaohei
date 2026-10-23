import assert from 'node:assert/strict'
import {readFile,mkdir} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {build} from 'esbuild'
import {RIFT_CSS} from '../lib/rift/styles.js'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT?pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href:'playwright-core')
const output='/tmp/rift-wind-review'
await mkdir(output,{recursive:true})
const bundle=await build({stdin:{contents:`import {createRiftRenderer} from './src/rift/renderer.ts';window.createRenderer=createRiftRenderer`,resolveDir:process.cwd()},bundle:true,write:false,format:'iife'})
const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']})
try{
 const page=await browser.newPage({viewport:{width:1672,height:940},deviceScaleFactor:1})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 for(const mode of ['light','dark']){
  const image='data:image/webp;base64,'+(await readFile(`src/assets/rift/scene${mode==='light'?'-light':''}-detail.webp`)).toString('base64')
  const atlas='data:image/webp;base64,'+(await readFile(`src/assets/rift/character-${mode}.webp`)).toString('base64')
  const cloth='data:image/webp;base64,'+(await readFile(`src/assets/rift/wind-layers-${mode}.webp`)).toString('base64')
  await page.setContent(`<html data-rift-theme data-xiaohei-appearance="${mode}"><head><style>${RIFT_CSS}\nbody{margin:0}canvas{position:fixed;inset:0;width:100%;height:100%}header{height:48px;display:flex;align-items:center;padding:0 24px;gap:24px}button{color:inherit;background:transparent;border:0}</style></head><body><canvas></canvas><div id="root"><div data-slot="conversation.header" style="display:contents"><div data-chain-overlay-fallback="conversation.header" style="display:contents"><header><span>罗小黑 · 会话</span><button>打开右侧边栏</button></header></div></div></div></body></html>`)
  await page.addScriptTag({content:bundle.outputFiles[0].text})
  await page.evaluate(async({image,atlas,cloth,mode})=>{
   const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})
   const renderer=window.createRenderer(document.querySelector('canvas'),await load(image),mode==='light',await load(atlas),await load(cloth))
   if(!renderer)throw Error('Full scene/character shader failed to compile')
   renderer.resize(1672,940);window.renderer=renderer
  },{image,atlas,cloth,mode})
  const header=await page.locator('header').evaluate(el=>{const s=getComputedStyle(el);return{image:s.backgroundImage,color:s.color,bg:s.backgroundColor,height:el.getBoundingClientRect().height,position:s.position}})
  assert.match(header.image,/linear-gradient/);assert.equal(header.bg,'rgba(0, 0, 0, 0)');assert.equal(header.height,48)
  for(const t of [0,1.5,3,6,9]){
   await page.evaluate(t=>window.renderer.paint(t,0,0),t)
   await page.screenshot({path:`${output}/${mode}-${t}.png`})
   await page.screenshot({path:`${output}/${mode}-${t}-character.png`,clip:{x:1140,y:160,width:430,height:600}})
   await page.screenshot({path:`${output}/${mode}-${t}-cloth.png`,clip:{x:1120,y:480,width:256,height:300}})
  }
  for(const ear of [-.02,0,.058]){
   await page.evaluate(ear=>window.renderer.paint(3,0,0,0,0,{
    character:{gaze:[0,0],tilt:0,nod:0,blink:0,ear},dust:{active:()=>false}
   }),ear)
   await page.screenshot({path:`${output}/${mode}-ear-${ear}.png`,clip:{x:1140,y:160,width:430,height:360}})
  }
  await page.setViewportSize({width:390,height:844})
  assert.equal(await page.locator('header').evaluate(e=>e.scrollWidth<=e.clientWidth),true,'mobile header does not overflow')
  await page.setViewportSize({width:1672,height:940})
  await page.evaluate(()=>window.renderer.dispose())
 }
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({fullShader:true,headerLightDark:true,mobile:true,errors,output}))
}finally{await browser.close()}
