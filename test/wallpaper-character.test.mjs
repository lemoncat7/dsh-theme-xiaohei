import test from 'node:test'
import assert from 'node:assert/strict'
import { installXiaoheiWallpaperCharacter, XIAOHEI_WALLPAPER_CHARACTER_ID } from '../lib/scene/wallpaper-character.js'
import { XIAOHEI_SCENE_LAYER_ID } from '../lib/scene/styles.js'

function fixture({failDecode=false}={}) {
  const elements=new Map(), frames=new Map(), timers=new Map(), events=new Map()
  let now=0, serial=0, reads=0, decodes=0, mutation, observer
  function element() {
    return { dataset:{}, style:{}, children:[], parentElement:null,
      setAttribute(){},
      append(child){this.children.push(child);child.parentElement=this;elements.set(child.id,child)},
      querySelector(selector){return this.children.find(c=>'.'+c.className===selector)??null},
      remove(){elements.delete(this.id);this.parentElement=null},
    }
  }
  const scene=element(); elements.set(XIAOHEI_SCENE_LAYER_ID,scene)
  const box=(left,top,right,bottom)=>({getBoundingClientRect(){reads++;return{left,top,right,bottom,width:right-left,height:bottom-top}}})
  const sidebar={...box(0,0,280,900),querySelectorAll:()=>[]}
  const scroll=box(280,78,1920,900),flow=box(632,0,1552,20000),composer=box(616,770,1568,868)
  const listen=(type,fn)=>events.set(type,fn),unlisten=type=>events.delete(type)
  const doc={body:{},hidden:false,
    createElement:element,getElementById:id=>elements.get(id),
    querySelector:selector=>selector.includes('sidebar')?sidebar:selector.includes('conversation-scroll')?scroll:selector.includes('chat-flow')?flow:composer,
    addEventListener:listen,removeEventListener:unlisten,
    defaultView:{innerWidth:1920,innerHeight:900,performance:{now:()=>now},
      Image:class {decode(){decodes++;return failDecode?Promise.reject(new Error('decode failed')):Promise.resolve()}},
      MutationObserver:class {constructor(fn){mutation=fn}observe(){}disconnect(){}},
      ResizeObserver:class {constructor(fn){observer=fn}observe(){}disconnect(){}},
      requestAnimationFrame(fn){frames.set(++serial,fn);return serial},cancelAnimationFrame:id=>frames.delete(id),
      setTimeout(fn,delay){timers.set(++serial,{fn,due:now+delay});return serial},clearTimeout:id=>timers.delete(id),
      addEventListener:listen,removeEventListener:unlisten,
    },
  }
  async function flush(){for(let i=0;i<8;i++){await Promise.resolve();for(const[id,fn]of [...frames]){frames.delete(id);fn()}}}
  async function advance(ms){now+=ms;for(const[id,t]of [...timers])if(t.due<=now){timers.delete(id);t.fn()}await flush()}
  return{doc,events,frames,timers,flush,advance,mutate:()=>mutation(),resize:()=>observer([]),
    host:()=>elements.get(XIAOHEI_WALLPAPER_CHARACTER_ID),reads:()=>reads,decodes:()=>decodes}
}

test('complete poses preload lazily, align seated states and clean up all listeners/timers',async()=>{
  const f=fixture(),dispose=installXiaoheiWallpaperCharacter(f.doc)
  await f.flush()
  assert.equal(f.host().dataset.pose,'seated');assert.equal(f.decodes(),2)
  const initialReads=f.reads(),bounds={...f.host().querySelector('.xiaohei-wallpaper-character__seated').style}
  for(let i=0;i<30;i++){f.mutate();await f.flush()}
  assert.equal(f.reads(),initialReads)
  await f.advance(30_000)
  assert.equal(f.host().dataset.pose,'chin');assert.equal(f.decodes(),4)
  assert.deepEqual(f.host().querySelector('.xiaohei-wallpaper-character__chin').style,bounds)
  await f.advance(150_000)
  assert.equal(f.host().dataset.pose,'doze');assert.equal(f.decodes(),6)
  assert.deepEqual(f.host().querySelector('.xiaohei-wallpaper-character__doze').style,bounds)
  assert.equal(f.reads(),initialReads,'idle must not force layout reads')
  assert.equal(f.timers.size,0)
  f.events.get('pointerdown')();await f.flush()
  assert.equal(f.host().dataset.pose,'seated');assert.equal(f.decodes(),6)
  f.doc.hidden=true;f.events.get('visibilitychange')();await f.flush()
  assert.equal(f.host().dataset.pose,'hidden');assert.equal(f.timers.size,0)
  await f.advance(600_000)
  f.doc.hidden=false;f.events.get('visibilitychange')();await f.flush()
  assert.equal(f.host().dataset.pose,'seated')
  f.resize();dispose();await f.flush()
  assert.equal(f.events.size,0);assert.equal(f.timers.size,0);assert.equal(f.frames.size,0)
  assert.equal(f.host(),undefined)
})
test('a broken image cannot start a decode retry/render loop',async()=>{
  const f=fixture({failDecode:true}),dispose=installXiaoheiWallpaperCharacter(f.doc)
  await f.flush()
  for(let i=0;i<30;i++){f.mutate();await f.flush()}
  assert.equal(f.decodes(),2)
  assert.equal(f.host().dataset.pose,'hidden')
  dispose();await f.flush()
  assert.equal(f.frames.size,0);assert.equal(f.timers.size,0)
})
test('disposing before image decode completes never recreates a host or scheduled frame',async()=>{
  const f=fixture(),dispose=installXiaoheiWallpaperCharacter(f.doc)
  for(const[id,fn]of [...f.frames]){f.frames.delete(id);fn()}
  dispose();await f.flush()
  assert.equal(f.host(),undefined);assert.equal(f.frames.size,0);assert.equal(f.timers.size,0)
})
