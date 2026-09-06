import assert from 'node:assert/strict'
import {createServer} from 'node:http'
import {mkdir} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {build} from 'esbuild'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT ? pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href : 'playwright-core')

const output='/tmp/xiaohei-2d-motion-review'
await mkdir(output,{recursive:true})
const bundle=await build({stdin:{contents:`
import {createCharacterMotion} from './src/scene/character-motion';
import {CHARACTER_POSES} from './src/scene/character-poses';
Math.random=()=>.99;
const motion=createCharacterMotion(document);
window.mount=(pose,appearance)=>{
 motion.setPose(undefined,'hidden');
 document.documentElement.dataset.xiaoheiAppearance=appearance;
 document.body.style.background=appearance==='light'?'#bcc5cc':'#202830';
 const part=document.getElementById('part');part.dataset.motion='';
 part.style.backgroundImage='url("'+CHARACTER_POSES[pose][appearance]+'")';
 part.style.width=pose==='peek'?'104px':pose==='halfpeek'?'60px':'240px';
 part.style.height=pose==='peek'?'165px':pose==='halfpeek'?'137px':'340px';
 motion.setPose(part,pose);
};
window.dispose=()=>motion.dispose();
window.mount('peek','light');
`,resolveDir:process.cwd()},bundle:true,write:false,format:'iife',platform:'browser'})
const server=createServer((req,res)=>{
 res.setHeader('content-type',req.url==='/app.js'?'text/javascript':'text/html');
 res.end(req.url==='/app.js'?bundle.outputFiles[0].contents:`<style>body{margin:0}#part{position:absolute;left:50px;top:30px;background-size:contain;background-position:left center;background-repeat:no-repeat}#part[data-motion]:not([data-motion='rest']):not([data-motion='']){background-image:none!important}.xiaohei-character-motion{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:left center;pointer-events:none}</style><div id="part"></div><script src="/app.js"></script>`)
})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
try{
 const page=await browser.newPage({viewport:{width:375,height:450},deviceScaleFactor:2}),errors=[]
 page.on('pageerror',e=>{errors.push(e.message);console.log('Page error:',e.message)})
 await page.addInitScript(()=>{window.paints=0;const draw=CanvasRenderingContext2D.prototype.drawImage;CanvasRenderingContext2D.prototype.drawImage=function(...args){paints++;return draw.apply(this,args)}})
 await page.goto('http://127.0.0.1:'+server.address().port)
 for(const appearance of ['light','dark'])for(const pose of ['peek','seated','chin','halfpeek']){
   await page.evaluate(({pose,appearance})=>mount(pose,appearance),{pose,appearance})
   try { await page.waitForFunction(()=>document.getElementById('part').dataset.motion==='blink',{},{timeout:15000}) }
   catch(error) { console.log(await page.evaluate(()=>({pose:document.getElementById('part').dataset.motion,box:document.getElementById('part').getBoundingClientRect().toJSON(),canvases:document.querySelectorAll('canvas').length,paints})));await page.screenshot({path:output+'/failure.png'});throw error }
   await page.waitForTimeout(130)
   await page.screenshot({path:output+'/'+pose+'-'+appearance+'-blink.png'})
   await page.waitForSelector('[data-motion="rest"]')
   const count=await page.evaluate(()=>paints);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>paints),count,'no idle drawing')
   if(appearance==='light'){
     await page.waitForFunction(action=>document.getElementById('part').dataset.motion===action,pose==='seated'?'tail':pose==='halfpeek'?'ear0':'ear1',{timeout:15000})
     await page.waitForTimeout(pose==='seated'?300:160)
     await page.screenshot({path:output+'/'+pose+'-gesture.png'})
   }
 }
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('canvas').count(),0)
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForSelector('canvas')
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});assert.equal(await page.locator('canvas').count(),0)
 await page.evaluate(()=>{dispose();mount('seated','dark')});assert.equal(await page.locator('canvas').count(),0)
 assert.deepEqual(errors,[]);console.log(JSON.stringify({errors,output,poses:4,appearances:2,reducedMotion:true,hidden:true,idleSleep:true}))
}finally{await browser.close();await new Promise(r=>server.close(r))}
