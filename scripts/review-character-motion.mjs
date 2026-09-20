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
import {CHARACTER_MOTION} from './src/generated-character-motion';
import {createRigRenderer} from './src/scene/character-rig-renderer';
import {EYE_RIGS} from './src/scene/character-eye-rig';
Math.random=()=>.5;
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
window.eyeDetail=(pose)=>{
 const eyes=EYE_RIGS[pose];
 const left=Math.min(...eyes.map(e=>e.left[0]))/2-8,top=Math.min(...eyes.map(e=>e.upper[1]))/2-8;
 const right=Math.max(...eyes.map(e=>e.right[0]))/2+8,bottom=Math.max(...eyes.map(e=>e.lower[1]))/2+8;
 for(const canvas of document.querySelectorAll('#audit canvas')){
  const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;copy.getContext('2d').drawImage(canvas,0,0);
  canvas.width=240;canvas.height=200;canvas.style.width='180px';canvas.style.height='150px';
  canvas.getContext('2d').drawImage(copy,left,top,right-left,bottom-top,0,0,240,200);
 }
};
window.sample=async(pose,appearance,action)=>{
 motion.setPose(undefined,'hidden');
 document.getElementById('part').style.display='none';
 document.getElementById('audit')?.remove();
 const audit=document.createElement('div');audit.id='audit';audit.style.cssText='display:flex;gap:12px;padding:12px';
 document.body.append(audit);
 document.body.style.background=appearance==='light'?'#c4c9ce':'#30353c';
 const rig=CHARACTER_MOTION[pose][appearance],images=new Map();
 for(const layer of Object.values(rig.layers)){const image=new Image();image.src=layer.src;await image.decode();images.set(layer.src,image)}
 const durations=[],frames=[];
 for(const t of [0,.15,.3,.45,.6,.75,.9,1]){
  const canvas=document.createElement('canvas');canvas.width=rig.size[0];canvas.height=rig.size[1];
  canvas.style.width=pose==='halfpeek'?'90px':pose==='peek'?'120px':'180px';canvas.style.height='auto';canvas.style.alignSelf='start';
  audit.append(canvas);
  const render=createRigRenderer(canvas.getContext('2d'),rig,images,EYE_RIGS[pose]);
  const started=performance.now();render(action==='gaze'?undefined:action,t,action==='gaze'?[Math.cos(t*Math.PI*2),Math.sin(t*Math.PI*2)]:[0,0]);durations.push(performance.now()-started);
  frames.push(canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data);
 }
 if(action==='blink'||action==='ear0'){
  if(frames[0].some((v,i)=>v!==frames[7][i]))throw new Error(action+' does not return to rest: '+pose);
  if(!frames[0].some((v,i)=>v!==frames[2][i]))throw new Error(action+' has no visible movement: '+pose);
 }
 if(action==='blink'){
  for(let i=0;i<frames[0].length;i+=4){
   if(frames[0].slice(i,i+4).every((v,k)=>v===frames[2][i+k]))continue;
   const x=(i/4)%rig.size[0],y=Math.floor(i/4/rig.size[0]);
   if(!EYE_RIGS[pose].some(e=>x>=e.left[0]/2-10 && x<=e.right[0]/2+10 && y>=e.upper[1]/2-10 && y<=e.lower[1]/2+10))throw new Error('Blink modified face outside eye bounds: '+pose);
  }
 }
 return durations;
};
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
 if (!process.env.XIAOHEI_SEQUENCE_ONLY) for(const appearance of ['light','dark'])for(const pose of ['peek','seated','chin','halfpeek']){
   await page.evaluate(({pose,appearance})=>mount(pose,appearance),{pose,appearance})
   try { await page.waitForFunction(()=>document.getElementById('part').dataset.motion==='blink',{},{timeout:15000}) }
   catch(error) { console.log(await page.evaluate(()=>({pose:document.getElementById('part').dataset.motion,box:document.getElementById('part').getBoundingClientRect().toJSON(),canvases:document.querySelectorAll('canvas').length,paints})));await page.screenshot({path:output+'/failure.png'});throw error }
   await page.waitForTimeout(130)
   await page.screenshot({path:output+'/'+pose+'-'+appearance+'-blink.png'})
   await page.waitForSelector('[data-motion="rig-rest"]')
   const count=await page.evaluate(()=>paints);await page.waitForTimeout(250);assert.equal(await page.evaluate(()=>paints),count,'no idle drawing')
   await page.mouse.move(374,449)
   await page.waitForTimeout(850)
   const settled=await page.evaluate(()=>paints)
   await page.waitForTimeout(200)
   assert.equal(await page.evaluate(()=>paints),settled,'gaze sleeps after settling')
   await page.mouse.move(0,0)
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>!document.querySelector('canvas'));assert.equal(await page.locator('canvas').count(),0)
 await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForSelector('canvas')
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});assert.equal(await page.locator('canvas').count(),0)
 await page.evaluate(()=>{dispose();mount('seated','dark')});assert.equal(await page.locator('canvas').count(),0)
 await page.setViewportSize({width:1560,height:520})
 const timings=[]
 for(const appearance of ['light','dark']) for(const pose of ['seated','peek','chin','halfpeek']){
   timings.push(...await page.evaluate(({pose,appearance})=>sample(pose,appearance,'attention'),{pose,appearance}))
   await page.screenshot({path:output+'/'+pose+'-'+appearance+'-rig-sequence.png'})
   await page.evaluate(({pose,appearance})=>sample(pose,appearance,'blink'),{pose,appearance})
   await page.screenshot({path:output+'/'+pose+'-'+appearance+'-blink-sequence.png'})
   await page.evaluate(pose=>eyeDetail(pose),pose)
   await page.screenshot({path:output+'/'+pose+'-'+appearance+'-eye-detail.png'})
   await page.evaluate(({pose,appearance})=>sample(pose,appearance,'gaze'),{pose,appearance})
   await page.screenshot({path:output+'/'+pose+'-'+appearance+'-gaze-sequence.png'})
   await page.evaluate(({pose,appearance})=>sample(pose,appearance,'ear0'),{pose,appearance})
   await page.screenshot({path:output+'/'+pose+'-'+appearance+'-ear-sequence.png'})
 }
 console.log(JSON.stringify({maxPaintMs:Math.max(...timings),meanPaintMs:timings.reduce((a,b)=>a+b,0)/timings.length}))
 assert.deepEqual(errors,[]);console.log(JSON.stringify({errors,output,poses:4,appearances:2,reducedMotion:true,hidden:true,idleSleep:true}))
}finally{await browser.close();await new Promise(r=>server.close(r))}
