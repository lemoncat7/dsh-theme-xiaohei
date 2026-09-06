import test from 'node:test'
import assert from 'node:assert/strict'
import {createSidebarReveal} from '../lib/sidebar-reveal.js'

function fixture() {
 let notify,disconnected=false
 const attrs=new Map()
 const shell={className:'native_collapsed',style:{width:''},
  getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)}
 const doc={defaultView:{MutationObserver:class{
  constructor(fn){notify=fn}observe(){}disconnect(){disconnected=true}
 }}}
 const reveal=createSidebarReveal(doc)
 reveal.setColumn({querySelector:()=>shell});reveal.resize(56)
 const change=(phase,target='280px')=>{shell.className=phase;shell.style.width=target;notify()}
 return {reveal,attrs,change,disconnected:()=>disconnected}
}
test('opening content waits for actual target width, not an elapsed timeout',()=>{
 const f=fixture()
 f.change('native_root')
 assert.equal(f.attrs.get('data-xiaohei-sidebar-reveal'),'waiting')
 for(const w of [56,70,150,240,277])f.reveal.resize(w)
 assert.equal(f.attrs.get('data-xiaohei-sidebar-reveal'),'waiting')
 f.reveal.resize(279)
 assert.equal(f.attrs.get('data-xiaohei-sidebar-reveal'),'ready')
 f.change('native_root native_quietBars')
 assert.equal(f.attrs.get('data-xiaohei-sidebar-reveal'),'ready')
 f.reveal.dispose();assert.equal(f.attrs.size,0);assert.equal(f.disconnected(),true)
})
test('reverse mid-open does not flash waiting text or leak stale reveal state',()=>{
 const f=fixture()
 f.change('native_root');f.reveal.resize(140)
 f.change('native_fading')
 assert.equal(f.attrs.get('data-xiaohei-sidebar-reveal'),'waiting')
 f.change('native_collapsed','');f.reveal.resize(56)
 assert.equal(f.attrs.get('data-xiaohei-sidebar-reveal'),'ready')
 f.change('native_root');f.reveal.resize(200)
 assert.equal(f.attrs.get('data-xiaohei-sidebar-reveal'),'waiting')
 f.reveal.resize(280)
 assert.equal(f.attrs.get('data-xiaohei-sidebar-reveal'),'ready')
 f.reveal.dispose()
})
