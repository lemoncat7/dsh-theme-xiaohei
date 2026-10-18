import test from 'node:test'
import assert from 'node:assert/strict'
import {bindRiftInteractions,RIFT_SELECTORS,RIFT_SIGNAL} from '../lib/rift/interaction.js'
import {RIFT_UI_CSS} from '../lib/rift/ui-styles.js'

function fixture(){
 const events=()=>{const listeners=new Map();return{listeners,addEventListener:(name,fn)=>listeners.set(name,fn),removeEventListener:name=>listeners.delete(name),dispatchEvent(event){listeners.get(event.type)?.(event)}}}
 class Element{
  constructor(){this.attrs=new Map();this.links=new Map();this.props=new Map();this.style={setProperty:(k,v)=>this.props.set(k,v),removeProperty:k=>this.props.delete(k)}}
  closest(s){return this.links.get(s)??null}
  hasAttribute(k){return this.attrs.has(k)}
  getAttribute(k){return this.attrs.get(k)??null}
  setAttribute(k,v){this.attrs.set(k,v)}
  removeAttribute(k){this.attrs.delete(k)}
  toggleAttribute(k,v){if(v)this.attrs.set(k,'');else this.attrs.delete(k)}
  getBoundingClientRect(){return{left:20,top:30,width:240,height:38}}
 }
 const root=new Element(),timers=new Map(),frames=new Map();let id=0,observer,disconnected=false
 const win={...events(),Element,setTimeout(fn){timers.set(++id,fn);return id},clearTimeout:n=>timers.delete(n),requestAnimationFrame(fn){frames.set(++id,fn);return id},cancelAnimationFrame:n=>frames.delete(n),MutationObserver:class{constructor(fn){observer=fn}observe(){}disconnect(){disconnected=true}}}
 const composer=new Element(),editor=new Element(),row=new Element(),tree=new Element()
 row.links.set(RIFT_SELECTORS.row,row);row.links.set(RIFT_SELECTORS.tree,tree)
 editor.links.set(RIFT_SELECTORS.editor,editor);editor.links.set(RIFT_SELECTORS.composer,composer)
 const doc={...events(),defaultView:win,documentElement:root,hidden:false,activeElement:null,querySelector:()=>composer}
 const signals=[];const dispose=bindRiftInteractions(doc,s=>signals.push(s))
 return{doc,win,root,editor,row,signals,timers,frames,dispose,state(s){root.setAttribute('data-xiaohei-state',s);observer()},get disconnected(){return disconnected}}
}
test('React interaction bridge responds to navigation, focus and official state without reading content',()=>{
 const f=fixture()
 f.doc.dispatchEvent({type:'click',target:f.row});assert.equal(f.signals.at(-1).kind,'navigate')
 f.row.setAttribute('aria-expanded','false');f.doc.dispatchEvent({type:'click',target:f.row});assert.equal(f.signals.at(-1).kind,'expand')
 f.doc.activeElement=f.editor;f.doc.dispatchEvent({type:'focusin'});assert.equal(f.signals.at(-1).kind,'focus');assert.ok(f.root.hasAttribute('data-rift-focus'))
 f.state('thinking');assert.equal(f.signals.at(-1).kind,'release');const count=f.signals.length
 f.state('streaming');f.state('tool');assert.equal(f.signals.length,count)
 f.state('complete');assert.equal(f.signals.at(-1).kind,'complete')
 f.dispose();assert.equal(f.doc.listeners.size,0);assert.equal(f.win.listeners.size,0);assert.equal(f.timers.size,0);assert.ok(f.disconnected)
 assert.equal(f.root.hasAttribute('data-rift-signal'),false);assert.equal(f.root.hasAttribute('data-rift-focus'),false)
})
test('Paused and hidden surfaces suppress impulses, and pointer work is coalesced and cleaned',()=>{
 const f=fixture();f.root.setAttribute('data-rift-paused','')
 f.doc.dispatchEvent({type:'click',target:f.row});assert.equal(f.signals.length,0)
 f.root.removeAttribute('data-rift-paused');f.doc.hidden=true;f.doc.dispatchEvent({type:'click',target:f.row});assert.equal(f.signals.length,0)
 f.doc.hidden=false
 for(let i=0;i<10;i++)f.doc.dispatchEvent({type:'pointermove',pointerType:'mouse',target:f.row,clientX:100+i,clientY:45})
 assert.equal(f.frames.size,1);for(const fn of f.frames.values())fn();f.frames.clear()
 assert.equal(f.row.props.get('--rift-pointer-x'),'89px')
 f.win.dispatchEvent({type:'blur'});assert.equal(f.row.props.size,0)
 f.dispose();assert.equal(f.frames.size,0)
})
test('Rift UI handles native rc.2 slots, empty flow nodes and motion fallback explicitly',()=>{
 for(const hook of ['data-row-key','aria-selected','aria-expanded','role=\'textbox\'','data-variant=\'others\'','data-state=\'error\'','data-slot=\'rightbar\'','conversation.chat.node'])assert.ok(RIFT_UI_CSS.includes(hook),hook)
 assert.match(RIFT_UI_CSS,/:empty/);assert.match(RIFT_UI_CSS,/prefers-reduced-motion:reduce/)
 assert.doesNotMatch(RIFT_UI_CSS,/backdrop-filter|cursor:\s*none|pointer-events:\s*auto/)
 assert.equal(RIFT_SIGNAL,'xiaohei/rift-signal')
})
