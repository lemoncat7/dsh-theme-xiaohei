import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {build} from 'esbuild'
import {injectRiftBoot} from '../lib/rift/boot.js'
import {RIFT_CSS} from '../lib/rift/styles.js'
const native=await readFile('node_modules/@deepseek-ai/dsh-client-ui-theme/lib/client.js','utf8')
const adapter=(await build({entryPoints:['src/rift/appearance.ts'],bundle:true,write:false,format:'iife',globalName:'RiftAppearance'})).outputFiles[0].text
const {chromium}=await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const browser=await chromium.launch({args:['--no-sandbox']})
try{
 for(const preference of ['dark','light','system']){
  const page=await browser.newPage({colorScheme:'light'})
  await page.emulateMedia({colorScheme:preference==='light'?'dark':'light'})
  await page.setContent(injectRiftBoot(`<html><head></head><body><script>
  const preference = "${preference}";
  document.documentElement.dataset.dsThemeSource = preference;
  const dark = preference==='dark'||preference==='system'&&matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.toggleAttribute('data-ds-dark-theme', dark);
  </script><main>Appearance fixture — no production settings writes</main></body></html>`))
  const initial=await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--rift-boot-base'))
  // Reproduce the native runtime's temporary schema-default presenter.
  await page.evaluate(()=>{document.documentElement.dataset.dsThemeSource='system';document.body.toggleAttribute('data-ds-dark-theme',matchMedia('(prefers-color-scheme: dark)').matches)})
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--rift-boot-base')),initial,'boot wallpaper must not follow an unhydrated body marker')
  await page.addStyleTag({content:RIFT_CSS})
  await page.evaluate(()=>{window.__ModuleLoader__={load:module=>window.NativeTheme=module.factory(()=>({}))}})
  await page.addScriptTag({content:native});await page.addScriptTag({content:adapter})
  await page.evaluate(()=>{
   const listeners=new Set(),formListeners=new Set();let formState={status:'loading',value:undefined}
   window.preferenceWrites=[]
   const section=p=>({preference:p,textFontFamily:'',codeFontFamily:'',terminalFontFamily:'',fontSize:14,codeFontSize:13,terminalFontSize:13})
   const form={getSnapshot:()=>formState,subscribe:fn=>{formListeners.add(fn);return()=>formListeners.delete(fn)},set:async(key,value)=>{window.preferenceWrites.push([key,value]);formState={status:'ready',value:section(value)};for(const fn of formListeners)fn()}}
   const ctx={inject:()=>{},effect:fn=>fn(),emit:(_event,snapshot)=>{for(const fn of listeners)fn(snapshot)},on:(_event,fn)=>{listeners.add(fn);return()=>listeners.delete(fn)},configForms:{get:()=>form}}
   ctx.theme=new window.NativeTheme.ThemeRuntime(ctx,form)
   const present=s=>{document.documentElement.dataset.dsThemeSource=s.preference;document.body.toggleAttribute('data-ds-dark-theme',s.active.colorScheme==='dark');for(const[k,v]of Object.entries(s.active.tokens))document.body.style.setProperty(k,v)}
   listeners.add(present);present(ctx.theme.getTheme())
   window.releaseAppearance=window.RiftAppearance.bindRiftAppearance(ctx,document)
   window.fixtureTheme=ctx.theme
   window.hydrate=p=>{formState={status:'ready',value:section(p)};for(const fn of formListeners)fn()}
  })
  const wanted=preference==='system'?'light':preference
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.xiaoheiAppearance),wanted)
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme),wanted)
  assert.deepEqual(await page.evaluate(()=>window.preferenceWrites),[],'adapter must never change saved preferences')
  await page.evaluate(p=>window.hydrate(p),preference)
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.xiaoheiAppearance),wanted)
  // This fake settings form is isolated in the fixture, not connected to DSH.
  await page.evaluate(async()=>{await window.fixtureTheme.setTheme('system');await Promise.resolve()})
  for(const mode of ['dark','light','dark']){
   await page.emulateMedia({colorScheme:mode})
   await page.waitForFunction(mode=>document.documentElement.dataset.xiaoheiAppearance===mode,mode)
   assert.equal(await page.evaluate(()=>document.body.hasAttribute('data-ds-dark-theme')),mode==='dark')
   assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme),mode)
  }
  await page.evaluate(()=>window.releaseAppearance())
  assert.equal(await page.evaluate(()=>document.documentElement.hasAttribute('data-xiaohei-appearance')),false)
  await page.close()
 }
 console.log('PASS: real DSH rc.2 ThemeRuntime, persisted light/dark hydration, system switching both ways, no adapter preference writes, clean disposal')
}finally{await browser.close()}
