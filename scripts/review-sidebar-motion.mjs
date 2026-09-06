import assert from 'node:assert/strict'
import {readFile,mkdir} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import ts from 'typescript'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT ? pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href : 'playwright-core')

const output='/tmp/xiaohei-sidebar-motion'
await mkdir(output,{recursive:true})
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
try {
 for(const modified of process.env.XIAOHEI_DEPLOYED ? [false] : [false,true]) {
  const context=await browser.newContext({storageState:'/tmp/dsh-ssh-playwright-direct-state.json',viewport:{width:1440,height:960},serviceWorkers:'block'})
  if(modified)await context.route('**/plugins/**',async route=>{
   if(!decodeURIComponent(route.request().url()).includes('@lemoncat7/dsh-theme-xiaohei/client.js')){await route.continue();return}
   const response=await route.fetch(),body=await response.text()
   const parsed=ts.createSourceFile('plugins.js',body,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS)
   const statement=parsed.statements.find(n=>ts.isExpressionStatement(n)&&ts.isCallExpression(n.expression)&&n.expression.arguments.some(a=>ts.isObjectLiteralExpression(a)&&a.properties.some(p=>ts.isPropertyAssignment(p)&&p.name.getText(parsed)==='id'&&ts.isStringLiteral(p.initializer)&&p.initializer.text==='@lemoncat7/dsh-theme-xiaohei')))
   assert.ok(statement)
   await route.fulfill({response,body:body.slice(0,statement.getStart(parsed))+'\n'+await readFile('lib/client.js','utf8')+'\n'+body.slice(statement.end)})
  })
  const page=await context.newPage(),errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.addInitScript(()=>{
   const old=Element.prototype.getBoundingClientRect
   Element.prototype.getBoundingClientRect=function(){if(window.audit)window.audit.reads++;return old.call(this)}
   const compile=WebGL2RenderingContext.prototype.compileShader
   WebGL2RenderingContext.prototype.compileShader=function(...args){if(window.audit)window.audit.compiles++;return compile.apply(this,args)}
  })
  await page.goto('http://127.0.0.1:3080/',{waitUntil:'domcontentloaded'})
  await page.waitForSelector('[aria-label="Collapse sidebar"]')
  await page.waitForTimeout(1400)
  const samples=[]
  for(let i=0;i<6;i++) {
   const sample=await page.evaluate(()=>new Promise(resolve=>{
    window.audit={reads:0,compiles:0,gaps:[]}
    const start=performance.now();let last=start
    const tick=now=>{
     audit.gaps.push(now-last);last=now
     if(now-start<750)requestAnimationFrame(tick)
     else {
      const glass=document.getElementById('dsh-theme-xiaohei/sidebar-glass')
      const column=document.querySelector('[data-slot="sidebar"]').parentElement
      const g=glass.getBoundingClientRect(),c=column.getBoundingClientRect()
      resolve({...audit,glassWidth:g.width,columnWidth:c.width,moving:document.documentElement.hasAttribute('data-xiaohei-sidebar-resizing'),pose:document.querySelector('.xiaohei-wallpaper-character').dataset.pose})
      window.audit=null
     }
    }
    document.querySelector('[aria-label="Collapse sidebar"],[aria-label="Open sidebar"]').click()
    requestAnimationFrame(tick)
   }))
   assert.ok(Math.abs(sample.glassWidth-(sample.columnWidth-14))<1)
   assert.equal(sample.moving,false)
   if(modified || process.env.XIAOHEI_DEPLOYED)assert.equal(sample.compiles,0,'cached sidebar mark must not compile shaders during toggles')
   samples.push({reads:sample.reads,compiles:sample.compiles,maxGap:Math.max(...sample.gaps),slowFrames:sample.gaps.filter(t=>t>34).length,pose:sample.pose})
  }
  await page.screenshot({path:output+'/'+(modified?'updated':'installed')+'.png'})
  await page.evaluate(async()=>{
   for(let i=0;i<8;i++){
    document.querySelector('[aria-label="Collapse sidebar"],[aria-label="Open sidebar"]').click()
    await new Promise(r=>setTimeout(r,60))
   }
  })
  await page.waitForTimeout(1000)
  assert.equal(await page.evaluate(()=>document.documentElement.hasAttribute('data-xiaohei-sidebar-resizing')),false)
  for(const viewport of [{width:375,height:812},{width:812,height:375}]) {
   await page.setViewportSize(viewport)
   await page.waitForTimeout(700)
   await page.screenshot({path:output+'/'+(modified?'updated':'installed')+'-'+viewport.width+'.png'})
  }
  await page.emulateMedia({reducedMotion:'reduce'})
  await page.waitForFunction(()=>!document.querySelector('.xiaohei-character-motion'))
  assert.deepEqual(errors,[])
  console.log(JSON.stringify({modified,samples,errors}))
  await context.close()
 }
} finally {await browser.close()}
