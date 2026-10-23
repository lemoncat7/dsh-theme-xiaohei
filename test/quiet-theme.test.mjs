import test from 'node:test'
import assert from 'node:assert/strict'
import {QUIET_COLORS,viewPalette,quietPaletteCss,bindViewPalette} from '../lib/rift/quiet-palette.js'
import {RIFT_DARK,RIFT_LIGHT} from '../lib/rift/palette.js'
import {QUIET_CSS} from '../lib/rift/quiet-styles.js'
import {setView} from '../lib/rift/view.js'
const luminance=hex=>hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
test('quiet themes have independent complete paired native palettes, readable text and unchanged semantic status colors',()=>{
 for(const mode of ['gradient','solid'])for(const scheme of ['light','dark']){
  const p=QUIET_COLORS[mode][scheme],tokens=viewPalette(mode,scheme)
  assert.deepEqual(Object.keys(tokens).sort(),Object.keys(RIFT_DARK).sort())
  assert.equal(tokens['--dsw-specific-sidebar-fill'],p.nav)
  assert.equal(tokens['--dsw-specific-bubble'],p.bubble)
  assert.equal(tokens['--dsw-alias-bg-overlay'],p.surface)
  assert.ok(Object.values(tokens).every(v=>typeof v==='string'&&v.length>0))
  for(const fg of [p.text,p.secondary,p.muted])for(const bg of [p.base,p.surface,p.nav,p.bubble])assert.ok(contrast(fg,bg)>=4.5,`${mode}/${scheme}: ${fg} on ${bg}`)
  assert.ok(contrast(p.accent,p.onAccent)>=4.5)
  assert.equal(tokens['--dsw-alias-label-error'],undefined)
 }
 assert.equal(viewPalette('full','dark'),RIFT_DARK);assert.equal(viewPalette('full','light'),RIFT_LIGHT)
 assert.doesNotMatch(QUIET_CSS,/clip-path:|backdrop-filter:|@keyframes|text-stroke:|Noto Serif/)
 assert.match(quietPaletteCss('system'),/prefers-color-scheme:light/)
})
test('view token layer changes once per mode, restores full palette and disposes cleanly',()=>{
 const attrs=new Map([['data-rift-view','full']]),store=new Map(),win=new EventTarget()
 win.document={documentElement:{getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v)}}
 win.localStorage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)}
 let active,calls=0,releases=0
 const stop=bindViewPalette({overrideTokens(_source,tokens){active=tokens;calls++;return()=>{releases++}}},win)
 assert.equal(active['--dsw-specific-sidebar-fill'].light,'transparent')
 setView(win,'solid');setView(win,'solid');assert.equal(calls,2)
 assert.equal(active['--dsw-specific-sidebar-fill'].light,QUIET_COLORS.solid.light.nav)
 setView(win,'gradient');assert.equal(active['--dsw-specific-bubble'].dark,QUIET_COLORS.gradient.dark.bubble)
 setView(win,'full');assert.equal(active['--dsw-specific-sidebar-fill'].dark,'transparent')
 stop();assert.equal(releases,calls)
})
