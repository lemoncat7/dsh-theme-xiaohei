// Isolated browser regression: no production messages, credentials or settings.
import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { pathToFileURL } from 'node:url'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
const { chromium } = await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const bundle = await build({ stdin: { contents: `export {installComposerBloub} from './src/bloub-heixiu/runtime.ts';
 export {resolveHeixiuBox,resolveHeixiuDock,resolveHeixiuWelcome} from './src/bloub-heixiu/layout.ts';`, resolveDir: process.cwd(), loader: 'ts' },
  bundle: true, format: 'iife', globalName: 'companion', write: false, platform: 'browser' })
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const output = await mkdtemp(join(tmpdir(), 'theme-conversation-performance-'))
const errors = []; let cases = 0
try {
 for (const width of [375, 1280]) for (const dark of [false, true]) for (const reduced of [true, false]) {
  const page = await browser.newPage({ viewport: { width, height: 800 }, reducedMotion: reduced ? 'reduce' : 'no-preference' })
  page.on('pageerror', e => errors.push(e.message))
  await page.setContent(`<style>
   *{box-sizing:border-box} body{margin:0;background:${dark?'#171e24':'#e4e6e3'};color:${dark?'#eee':'#222'};font:14px sans-serif}
   [data-slot=sidebar]{position:fixed;left:0;top:0;width:${width<760?48:220}px;height:100%;background:#7773}
   [data-slot=sidebar]>div{height:100%;width:100%}
   [data-conversation-scroll]{position:fixed;left:${width<760?54:230}px;right:10px;top:10px;height:540px;overflow:auto}
   [data-chat-flow]>p{padding:12px;border-bottom:1px solid #7774}
   [data-composer-card]{position:fixed;left:${width<760?64:380}px;right:16px;top:620px;border:1px solid #777;min-height:110px;background:${dark?'#283136':'#fff'};padding:12px}
   ._headline{position:fixed;left:${width<760?170:640}px;top:550px;height:50px}
   .xiaohei-brand-mark{display:block;width:40px;height:40px}
   textarea{display:block;width:100%;height:50px;resize:none}
  </style><div id="root"><div data-slot="sidebar"><div>菜单</div></div>
   <div data-conversation-scroll><div data-chat-flow>${Array.from({length:80},(_,i)=>`<p>历史消息 ${i}</p>`).join('')}</div></div>
   <div data-composer-card="true"><textarea aria-label="消息"></textarea><div data-toolbar><button>发送</button></div></div></div>`)
  await page.addScriptTag({ content: bundle.outputFiles[0].text })
  await page.evaluate(() => {
   window.reads = { host: 0, own: 0 }; window.writes = false; window.violations = 0
   const original = Element.prototype.getBoundingClientRect
   Element.prototype.getBoundingClientRect = function() {
    if (this.classList.contains('xiaohei-bloub')) window.reads.own++
    if (this.matches('[data-composer-card], [data-slot="sidebar"]>div, .xiaohei-brand-mark')) {
     window.reads.host++; if(window.writes)window.violations++
    }
    return original.call(this)
   }
   // Mark own layout style writes for this callback. Renderer SVG attributes
   // are deliberately not counted: they do not alter dock geometry.
   const set = CSSStyleDeclaration.prototype.setProperty
   CSSStyleDeclaration.prototype.setProperty = function(key,value,priority) {
    if(key.startsWith('--heixiu-welcome')||key.startsWith('--heixiu-follow')){
     window.writes=true;queueMicrotask(()=>{window.writes=false})
    }
    return set.call(this,key,value,priority)
   }
   window.stopCompanion = companion.installComposerBloub(document)
  })
  await page.locator('.xiaohei-bloub').waitFor({state:'visible',timeout:15000})
  await page.waitForTimeout(100)
  assert.equal(await page.locator('[data-toolbar]').evaluate(e=>e.parentElement.lastElementChild===e),true)
  assert.equal(await page.evaluate(()=>window.reads.own),0)
  const checkBox = async () => {
   const result=await page.evaluate(()=>{
    const composer=document.querySelector('[data-composer-card]'),rect=composer.getBoundingClientRect()
    const sidebar=document.querySelector('[data-slot=sidebar]>div').getBoundingClientRect()
    const hero=document.querySelector('.xiaohei-brand-mark')?.getBoundingClientRect()
    const expected=companion.resolveHeixiuBox(rect,{left:composer.clientLeft,top:composer.clientTop},
      companion.resolveHeixiuDock(rect.left,sidebar.right,innerWidth),hero&&companion.resolveHeixiuWelcome(hero,rect,sidebar.right,innerWidth))
    const bot=document.querySelector('.xiaohei-bloub'),actual=bot.getBoundingClientRect()
    return {expected,actual:{left:actual.left,top:actual.top,width:actual.width,height:actual.height},mode:composer.dataset.heixiuDock}
   })
   for(const key of ['left','top','width','height'])assert.ok(Math.abs(result.expected[key]-result.actual[key])<1,`${width} ${key}: ${JSON.stringify(result)}`)
  }
  await checkBox()
  // Repeated streamed DOM commits + history scrolling must not measure the dock.
  const before=await page.evaluate(()=>({...window.reads}))
  for(let i=0;i<12;i++) {
   await page.evaluate(i=>{const p=document.createElement('p');p.textContent='流式消息 '+i;document.querySelector('[data-chat-flow]').append(p);document.querySelector('[data-conversation-scroll]').scrollTop=i*100},i)
   await page.waitForTimeout(20)
  }
  assert.deepEqual(await page.evaluate(()=>window.reads),before)
  if(!reduced){
   await page.locator('.xiaohei-bloub').focus();await page.keyboard.press('Shift+Enter')
   assert.equal(await page.locator('.xiaohei-bloub').getAttribute('data-action'),'burst')
  }
  // Host replacement + welcome/compact/outside transitions still reconcile.
  await page.evaluate(()=>{
   const old=document.querySelector('[data-composer-card]'),next=old.cloneNode(true)
   next.querySelector('.xiaohei-bloub').remove();old.replaceWith(next)
   const row=document.createElement('div');row.className='_headline'
   row.innerHTML='<span class="xiaohei-brand-mark" data-brand-context="hero"></span>';document.querySelector('#root').append(row)
  })
  await page.waitForTimeout(1300);await checkBox()
  assert.equal(await page.locator('.xiaohei-bloub').count(),1)
  await page.screenshot({path:join(output,`${width}-${dark?'dark':'light'}-${reduced?'reduced':'motion'}.png`)})
  assert.equal(await page.evaluate(()=>window.violations),0,'no read immediately after companion style writes')
  await page.evaluate(()=>stopCompanion())
  assert.equal(await page.locator('.xiaohei-bloub').count(),0)
  assert.equal(await page.locator('[data-heixiu-dock]').count(),0)
  await page.close();cases++;console.log(JSON.stringify({width,dark,reduced,passed:true}))
 }
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({cases,errors:0,streamLayoutReads:0,screenshots:output}))
} finally { await browser.close() }
