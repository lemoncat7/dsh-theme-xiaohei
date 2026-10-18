import test from 'node:test'
import assert from 'node:assert/strict'
import { canAnimate, motionEnabled, REALM_MOTION_EVENT } from '../lib/spirit-realm/motion.js'
import { installSpiritRealm } from '../lib/spirit-realm/runtime.js'
import { XIAOHEI_SCENE_LAYER_ID } from '../lib/scene/ids.js'

test('realm motion requires foreground, focus, preference and accessible motion', () => {
  assert.equal(canAnimate(true, false, false, true), true)
  for (const args of [[false,false,false,true],[true,true,false,true],[true,false,true,true],[true,false,false,false]]) {
    assert.equal(canAnimate(...args), false)
  }
  assert.equal(motionEnabled({localStorage:{getItem:()=> 'off'}}), false)
  assert.equal(motionEnabled({get localStorage(){throw Error('blocked')}}), true)
})

function fixture(noContext=false) {
  let serial=0,now=0,paints=0,observers=0
  const frames=new Map(),listeners=new Map(),attrs=new Set()
  const listen=(key,fn)=>listeners.set(key,fn),unlisten=key=>listeners.delete(key)
  function element(){return{dataset:{},children:[],style:{setProperty(){},removeProperty(){}},
    setAttribute(){},append(...children){this.children.push(...children);for(const c of children)c.parent=this},
    remove(){this.parent.children=this.parent.children.filter(c=>c!==this)},
    getContext:()=>noContext?null:ctx}}
  const ctx={clearRect(){paints++},save(){},restore(){},setTransform(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},arc(){},createLinearGradient:()=>({addColorStop(){}})}
  const scene=Object.assign(element(),{clientWidth:3840,clientHeight:2160})
  const root={dataset:{xiaoheiAppearance:'dark'},toggleAttribute(k,v){if(v)attrs.add(k);else attrs.delete(k)},removeAttribute:k=>attrs.delete(k)}
  const media={matches:false,addEventListener:(k,f)=>listen('media:'+k,f),removeEventListener:k=>unlisten('media:'+k)}
  class Observer{observe(){observers++}disconnect(){observers--}}
  const win={localStorage:{getItem:()=>null},matchMedia:()=>media,performance:{now:()=>now},ResizeObserver:Observer,MutationObserver:Observer,
    requestAnimationFrame(fn){frames.set(++serial,fn);return serial},cancelAnimationFrame:id=>frames.delete(id),
    addEventListener:listen,removeEventListener:unlisten}
  const doc={hidden:false,hasFocus:()=>true,defaultView:win,documentElement:root,createElement:element,
    getElementById:id=>id===XIAOHEI_SCENE_LAYER_ID?scene:null,addEventListener:listen,removeEventListener:unlisten}
  const advance=()=>{now+=80;for(const[id,fn]of [...frames]){frames.delete(id);fn(now)}}
  return{doc,scene,frames,media,attrs,listeners,advance,paints:()=>paints,observers:()=>observers}
}

test('realm caps pixels, suspends on blur/background/reduced motion and cleans up',()=>{
  const f=fixture(),dispose=installSpiritRealm(f.doc),host=f.scene.children[0],canvas=host.children[0]
  assert.ok(canvas.width<=1440 && canvas.height<=1000)
  assert.equal(host.dataset.motion,'running')
  const start=f.paints();f.advance();assert.ok(f.paints()>start)
  f.listeners.get('blur')();assert.equal(f.frames.size,0);assert.equal(host.dataset.motion,'paused')
  const paused=f.paints();f.advance();assert.equal(f.paints(),paused)
  f.listeners.get('focus')();assert.equal(f.frames.size,1)
  f.doc.hidden=true;f.listeners.get('visibilitychange')();assert.equal(f.frames.size,0)
  f.doc.hidden=false;f.listeners.get('visibilitychange')();assert.equal(f.frames.size,1)
  f.media.matches=true;f.listeners.get('media:change')();assert.equal(f.frames.size,0)
  f.media.matches=false;f.listeners.get('media:change')();assert.equal(f.frames.size,1)
  f.listeners.get(REALM_MOTION_EVENT)({detail:false});assert.equal(f.frames.size,0)
  f.listeners.get(REALM_MOTION_EVENT)({detail:true});assert.equal(f.frames.size,1)
  f.listeners.get('pointermove')({clientX:120,clientY:80,pointerType:'mouse'})
  assert.equal(f.frames.size,2)
  dispose();assert.equal(f.frames.size,0);assert.equal(f.listeners.size,0);assert.equal(f.observers(),0)
  assert.equal(f.scene.children.length,0);assert.equal(f.attrs.size,0)
})

test('missing canvas support retains the static illustration without a render loop',()=>{
  const f=fixture(true),dispose=installSpiritRealm(f.doc)
  assert.equal(f.scene.children.length,1);assert.equal(f.frames.size,0)
  dispose();assert.equal(f.listeners.size,0)
})
