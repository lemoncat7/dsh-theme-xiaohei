import test from 'node:test'
import assert from 'node:assert/strict'
import {bindRiftAppearance} from '../lib/rift/appearance.js'
import {QUIET_COLORS} from '../lib/rift/quiet-palette.js'

function fixture({boot='dark',status='loading',preference='system',active='light',dark=false}={}){
 const attrs=new Map(),events=new Map(),mediaEvents=new Map(),layers=new Map()
 let themeListener,formListener
 let snapshot={preference,active:{colorScheme:active}},formState={status}
 const media={matches:dark,addEventListener:(k,f)=>mediaEvents.set(k,f),removeEventListener:k=>mediaEvents.delete(k)}
 const doc={documentElement:{getAttribute:k=>attrs.get(k)??null,setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)},
  getElementById:()=>boot?{getAttribute:()=>boot}:null,
  addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k),
  defaultView:{matchMedia:()=>media,addEventListener:(k,f)=>events.set(k,f),removeEventListener:k=>events.delete(k)}}
 const ctx={configForms:{get:ns=>{assert.equal(ns,'ui-theme');return {getSnapshot:()=>formState,subscribe:fn=>{formListener=fn;return()=>formListener=undefined}}}},
  theme:{getTheme:()=>snapshot,overrideTokens:(name,tokens)=>{layers.set(name,tokens);themeListener?.(snapshot);return()=>{layers.delete(name);themeListener?.(snapshot)}}},
  on:(event,fn)=>{assert.equal(event,'theme/change');themeListener=fn;return()=>themeListener=undefined}}
 const dispose=bindRiftAppearance(ctx,doc)
 return {attrs,layers,dispose,events,mediaEvents,
  theme(pref,scheme){snapshot={preference:pref,active:{colorScheme:scheme}};themeListener?.(snapshot)},
  settings(next){formState={status:next};formListener?.()},
  view(mode){attrs.set('data-rift-view',mode);themeListener?.(snapshot)},
  system(value){media.matches=value;mediaEvents.get('change')?.()},
  scheme:()=>attrs.get('data-xiaohei-appearance')}
}
test('persisted dark remains dark throughout settings hydration and native default events',()=>{
 const f=fixture();assert.equal(f.scheme(),'dark');assert.equal(f.layers.size,1)
 f.theme('system','light');assert.equal(f.scheme(),'dark')
 f.theme('dark','dark');f.settings('ready');assert.equal(f.scheme(),'dark');assert.equal(f.layers.size,0)
 f.theme('light','light');assert.equal(f.scheme(),'light')
 f.dispose();assert.equal(f.attrs.size,0);assert.equal(f.events.size,0);assert.equal(f.mediaEvents.size,0)
})
test('persisted light is equally protected from an OS-dark startup default',()=>{
 const f=fixture({boot:'light',active:'dark',dark:true});assert.equal(f.scheme(),'light')
 f.theme('light','light');f.settings('ready');assert.equal(f.scheme(),'light');assert.equal(f.layers.size,0);f.dispose()
})
test('system mode follows OS in both directions without setting or storing preferences',()=>{
 const f=fixture({boot:'system',dark:true});assert.equal(f.scheme(),'dark')
 f.settings('ready');f.theme('system','dark');assert.equal(f.layers.size,0)
 f.system(false);assert.equal(f.scheme(),'light');assert.equal(f.layers.size,1)
 f.theme('system','light');assert.equal(f.layers.size,0)
 f.system(true);assert.equal(f.scheme(),'dark')
 f.theme('dark','dark');f.system(false);assert.equal(f.scheme(),'dark')
 f.theme('light','light');f.system(true);assert.equal(f.scheme(),'light');f.dispose()
})
test('unavailable settings and missing bootstrap fall back to the live theme',()=>{
 const f=fixture();f.settings('unavailable');assert.equal(f.scheme(),'light');assert.equal(f.layers.size,0);f.dispose()
 const noBoot=fixture({boot:null});assert.equal(noBoot.scheme(),'light');noBoot.dispose()
})
test('startup bridge uses the selected whole-theme palette even if mode changes during hydration',()=>{
 const f=fixture()
 f.view('solid')
 assert.equal([...f.layers.values()][0]['--dsw-specific-sidebar-fill'].light,QUIET_COLORS.solid.dark.nav)
 f.view('gradient')
 assert.equal([...f.layers.values()][0]['--dsw-specific-sidebar-fill'].dark,QUIET_COLORS.gradient.dark.nav)
 f.theme('dark','dark');f.settings('ready');assert.equal(f.layers.size,0);f.dispose()
})
