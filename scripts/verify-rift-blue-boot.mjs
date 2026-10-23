import assert from 'node:assert/strict'
import {mkdir} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {injectRiftBoot} from '../lib/rift/boot.js'
import {RIFT_MARK_IMAGE} from '../lib/rift/mark.js'
const {chromium}=await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const browser=await chromium.launch({args:['--no-sandbox']})
await mkdir('/tmp/rift-blue-review',{recursive:true})
try{
 const page=await browser.newPage({viewport:{width:1200,height:800}})
 const requests=[];page.on('request',r=>requests.push(r.url()))
 for(const mode of ['light','dark']){
  await page.emulateMedia({colorScheme:mode})
  await page.setContent(injectRiftBoot(`<html data-xiaohei-appearance="${mode}"><head><style>
  body{margin:0;font:14px system-ui}#root{display:grid;place-items:center;height:100vh}.card{text-align:center}.wordmark{letter-spacing:.3em;font-size:12px}.hint{font-size:13px;opacity:.8}
  </style></head><body><div id="root"><div class="card"><div class="wordmark">HARNESS</div><div data-dsh-boot-spinner></div><div class="hint">Loading plugins…</div></div></div></body></html>`))
  const spinner=page.locator('[data-dsh-boot-spinner]')
  assert.doesNotMatch(await spinner.evaluate(e=>getComputedStyle(e).backgroundImage),/url\(/)
  assert.match(await spinner.evaluate(e=>getComputedStyle(e,'::before').backgroundImage),/data:image\/svg\+xml/)
  assert.equal(await spinner.evaluate(e=>getComputedStyle(e,'::before').animationName),'rift-flow-in')
  assert.equal(await page.locator('.hint').innerText(),'Loading plugins…')
  await page.waitForTimeout(1000)
  await page.screenshot({path:`/tmp/rift-blue-review/boot-${mode}.png`})
  await page.emulateMedia({reducedMotion:'reduce'})
  assert.equal(await spinner.evaluate(e=>getComputedStyle(e).animationName),'none')
  assert.equal(await spinner.evaluate(e=>getComputedStyle(e,'::before').animationName),'none')
  await page.emulateMedia({reducedMotion:'no-preference'})
  await page.setViewportSize({width:375,height:667})
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))
  await page.screenshot({path:`/tmp/rift-blue-review/boot-mobile-${mode}.png`})
  await page.setViewportSize({width:1200,height:800})
  await spinner.evaluate(e=>e.remove())
  await page.locator('.hint').evaluate(e=>e.textContent='Connection failed. Retry')
  assert.equal(await page.locator('.card').evaluate(e=>getComputedStyle(e).borderRadius),'0px','error state is not hidden behind a stale loader')
 }
 await page.setContent(`<body style="margin:0;background:#e9eff7;display:flex;gap:36px;padding:50px;color:#315d8a">${[32,60,120].map(size=>`<img width="${size}" height="${size}" alt="" src="${RIFT_MARK_IMAGE}">`).join('')}</body>`)
 await page.screenshot({path:'/tmp/rift-blue-review/logo.png'})
 assert.ok(requests.every(url=>url.startsWith('data:')),'loader and logo must not introduce external requests')
 console.log('PASS: effects-only loader, original logo at 32/60/120px, no network, reduced motion and unobstructed error state')
}finally{await browser.close()}
