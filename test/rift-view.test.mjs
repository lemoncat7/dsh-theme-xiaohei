import test from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import {readView,setView,validView,bindRiftPresentation,RIFT_VIEW_KEY,RIFT_VIEW_BOOT} from '../lib/rift/view.js'

function fixture(initial='full',restricted=false){
 const values=new Map([[RIFT_VIEW_KEY,initial]]),attrs=new Map()
 const win=new EventTarget()
 win.localStorage={getItem:key=>{if(restricted)throw Error('denied');return values.get(key)??null},setItem:(key,value)=>{if(restricted)throw Error('denied');values.set(key,value)}}
 const doc={defaultView:win,documentElement:{getAttribute:key=>attrs.get(key)??null,setAttribute:(key,value)=>attrs.set(key,value)}}
 win.document=doc
 return {win,doc,values,attrs,storage(key){const e=new Event('storage');e.key=key;win.dispatchEvent(e)}}
}
test('view preference is bounded and safe with blocked browser storage',()=>{
 assert.equal(validView('bad'),'full');assert.equal(readView(fixture('solid').win),'solid')
 const f=fixture('full',true);assert.equal(readView(f.win),'full')
 let mounted=0,removed=0
 const stop=bindRiftPresentation(f.doc,()=>{mounted++;return()=>removed++})
 setView(f.win,'solid');assert.equal(removed,1);assert.equal(f.attrs.get('data-rift-view'),'solid')
 setView(f.win,'full');assert.equal(mounted,2);stop();assert.equal(removed,2)
})
test('quiet mode never mounts decorations; switches dispose exactly once and retain motion settings',()=>{
 const f=fixture('gradient');f.values.set('dsh-theme-xiaohei/rift-motion','off')
 let mounted=0,removed=0
 const stop=bindRiftPresentation(f.doc,()=>{mounted++;return()=>removed++})
 assert.equal(mounted,0)
 setView(f.win,'full');setView(f.win,'full');assert.equal(mounted,1)
 setView(f.win,'solid');setView(f.win,'gradient');assert.equal(removed,1)
 setView(f.win,'full');assert.equal(mounted,2)
 assert.equal(f.values.get('dsh-theme-xiaohei/rift-motion'),'off')
 stop();assert.equal(removed,2);setView(f.win,'solid');setView(f.win,'full');assert.equal(mounted,2)
})
test('cross-tab changes and cleared storage update the view without writing preferences back',()=>{
 const f=fixture('solid');let mounted=0,removed=0
 const stop=bindRiftPresentation(f.doc,()=>{mounted++;return()=>removed++})
 f.values.set(RIFT_VIEW_KEY,'full');f.storage(RIFT_VIEW_KEY);assert.equal(mounted,1)
 f.values.set(RIFT_VIEW_KEY,'gradient');f.storage('other');assert.equal(removed,0)
 f.storage(RIFT_VIEW_KEY);assert.equal(removed,1)
 f.values.clear();f.storage(null);assert.equal(mounted,2);assert.equal(f.values.size,0);stop()
})
test('first-paint bootstrap reads only whitelisted local preference and tolerates denial',()=>{
 for(const input of ['full','gradient','solid','<script>bad</script>']){
  const f=fixture(input)
  vm.runInNewContext(RIFT_VIEW_BOOT,{document:f.doc,localStorage:f.win.localStorage})
  assert.equal(f.attrs.get('data-rift-view'),validView(input))
 }
 const f=fixture('solid',true)
 assert.doesNotThrow(()=>vm.runInNewContext(RIFT_VIEW_BOOT,{document:f.doc,localStorage:f.win.localStorage}))
})
