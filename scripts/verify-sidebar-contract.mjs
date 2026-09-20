import assert from 'node:assert/strict'
import { pathToFileURL } from 'node:url'
import { XIAOHEI_SIDEBAR_CSS } from '../lib/chrome/sidebar.js'
const { chromium } = await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const browser = await chromium.launch({headless:true,args:['--no-sandbox']})
try {
  for (const width of [375,1440]) for (const reducedMotion of ['reduce','no-preference']) {
    const page = await browser.newPage({viewport:{width,height:800},reducedMotion})
    for (const toggleFirst of [true,false]) {
      const toggle = '<button aria-label="Collapse sidebar">收起</button>'
      const brand = '<button><span data-xiaohei-sidebar-brand>小黑</span></button>'
      await page.setContent(`<style>${XIAOHEI_SIDEBAR_CSS}</style><div id="root"><aside data-sidebar-collapsed="false"><div data-slot="sidebar"><div data-xiaohei-sidebar-reveal="waiting"><header>${toggleFirst?toggle+brand:brand+toggle}</header><button aria-label="New session">新建</button></div></div></aside></div>`)
      for (const label of ['Collapse sidebar','New session']) {
        const control = page.getByRole('button',{name:label,exact:true})
        await control.click()
        assert.deepEqual(await control.evaluate(el=>{const s=getComputedStyle(el);return [s.visibility,s.opacity]}),['visible','1'])
      }
      const mark=page.locator('[data-xiaohei-sidebar-brand]')
      assert.equal(await mark.evaluate(el=>getComputedStyle(el).visibility),reducedMotion==='reduce'?'visible':'hidden')
      await page.locator('[data-xiaohei-sidebar-reveal]').evaluate(el=>el.setAttribute('data-xiaohei-sidebar-reveal','ready'))
      await mark.waitFor({state:'visible'})
    }
    await page.close()
  }
  console.log('Sidebar controls visible and clickable: both orders, mobile/desktop, reduced motion.')
} finally { await browser.close() }
