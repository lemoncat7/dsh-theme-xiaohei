import assert from 'node:assert/strict'
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import ts from 'typescript'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT ? pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href : 'playwright-core')
const output='/tmp/xiaohei-2d-motion-live'
await mkdir(output,{recursive:true})
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']})
try {
 const context=await browser.newContext({storageState:process.env.XIAOHEI_STORAGE_STATE??'/tmp/dsh-ssh-playwright-direct-state.json',viewport:{width:1920,height:1000},serviceWorkers:'block'})
 let swapped=false
 if(!process.env.XIAOHEI_DEPLOYED)await context.route('**/plugins/**',async route=>{
   if(!decodeURIComponent(route.request().url()).includes('@lemoncat7/dsh-theme-xiaohei/client.js')){await route.continue();return}
   const response=await route.fetch(),body=await response.text()
   const parsed=ts.createSourceFile('plugins.js',body,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS)
   const statement=parsed.statements.find(n=>ts.isExpressionStatement(n)&&ts.isCallExpression(n.expression)&&n.expression.arguments.some(a=>ts.isObjectLiteralExpression(a)&&a.properties.some(p=>ts.isPropertyAssignment(p)&&p.name.getText(parsed)==='id'&&ts.isStringLiteral(p.initializer)&&p.initializer.text==='@lemoncat7/dsh-theme-xiaohei')))
   assert.ok(statement,'theme registration exists')
   await route.fulfill({response,body:body.slice(0,statement.getStart(parsed))+'\n'+await readFile('lib/client.js','utf8')+'\n'+body.slice(statement.end)});swapped=true
 })
 const page=await context.newPage(),errors=[]
 page.on('pageerror',e=>errors.push(e.message))
 await page.goto(process.env.XIAOHEI_REVIEW_URL??'http://127.0.0.1:3080/',{waitUntil:'domcontentloaded',timeout:60000})
 const action=async name=>page.waitForFunction(name=>[...document.querySelectorAll('.xiaohei-wallpaper-character > span')].some(e=>name==='gesture'?/^(ear|tail)/.test(e.dataset.motion??''):e.dataset.motion===name),name,{timeout:20000})
 const capture=async name=>{
   const state=await page.evaluate(()=>{
     const part=[...document.querySelectorAll('.xiaohei-wallpaper-character > span')].find(e=>e.dataset.motion&&e.dataset.motion!=='rest')
     if(!part)return null
     const canvas=part.querySelector('canvas')
     return {action:part.dataset.motion,background:getComputedStyle(part).backgroundImage,opacity:getComputedStyle(part).opacity,image:canvas.toDataURL()}
   })
   assert.ok(state,'capture a live action frame');assert.equal(state.background,'none');assert.equal(state.opacity,'1')
   await writeFile(output+'/'+name+'-frame.png',Buffer.from(state.image.split(',')[1],'base64'))
 }
 await action('blink');await page.waitForTimeout(130)
 await capture('seated-blink')
 await page.screenshot({path:output+'/seated-blink.png'})
 await action('gesture');await page.waitForTimeout(160)
 await capture('seated-gesture')
 await page.screenshot({path:output+'/seated-gesture.png'})
 await page.setViewportSize({width:1440,height:960})
 await action('blink');await page.waitForTimeout(130)
 await capture('peek-blink')
 await page.screenshot({path:output+'/peek-blink.png'})
 await action('gesture');await page.waitForTimeout(160)
 await capture('peek-ear')
 await page.screenshot({path:output+'/peek-ear.png'})
 await page.emulateMedia({reducedMotion:'reduce'})
 assert.equal(await page.locator('.xiaohei-character-motion').count(),0)
 await page.setViewportSize({width:375,height:812});await page.waitForTimeout(400)
 await page.screenshot({path:output+'/mobile-reduced.png'})
 assert.equal(await page.locator('.xiaohei-character-motion').count(),0)
 assert.deepEqual(errors,[])
 if(!process.env.XIAOHEI_DEPLOYED)assert.ok(swapped)
 console.log(JSON.stringify({deployed:!!process.env.XIAOHEI_DEPLOYED,swapped,errors,blink:true,gestures:true,reducedMotion:true,output}))
}finally{await browser.close()}
