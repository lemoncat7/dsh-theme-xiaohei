import test from 'node:test'
import assert from 'node:assert/strict'
import {edgeProximity,scrollCamera,installSpiritInput} from '../lib/rift/spirit-input.js'
import {stageBounds,watchSpiritStage} from '../lib/rift/stage.js'
import {PointerDust,DUST_COUNT} from '../lib/rift/dust.js'

test('edge interactions track conversation bounds and leave text untouched',()=>{
 for(const [left,right] of [[300,1440],[0,1920],[300,1000]]){
  const stage=[left,right,60,840]
  assert.ok(edgeProximity(left+10,300,stage)>.9)
  assert.ok(edgeProximity(right-10,300,stage)>.9)
  assert.equal(edgeProximity((left+right)/2,300,stage),0)
  assert.equal(edgeProximity(left-1,300,stage),0)
  assert.equal(edgeProximity(left,20,stage),0)
 }
 assert.equal(edgeProximity(NaN,0,[0,1440,0,1000]),0)
 assert.equal(edgeProximity(10,100,[0,200,0,1000]),0)
})
test('scroll camera is monotonic and bounded to ten CSS pixels',()=>{
 assert.equal(scrollCamera(0,1000),0);assert.equal(scrollCamera(-1,1000),0)
 assert.equal(scrollCamera(NaN,1000),0)
 assert.ok(scrollCamera(500,1000)<scrollCamera(1500,1000))
 assert.ok(scrollCamera(1e8,1000)*1000<=10)
})
test('dust is bounded, motion-triggered and fully disappears after 1.1 seconds',()=>{
 const dust=new PointerDust(),buffer=dust.data
 assert.equal(DUST_COUNT,24);assert.equal(buffer.length,144);assert.equal(dust.active(0),false)
 dust.emit(50,100,0);assert.equal(dust.active(.5),true)
 const unchanged=buffer.slice();dust.emit(50,100,.5);assert.deepEqual(buffer,unchanged)
 assert.equal(dust.active(1.2),false)
 for(let i=1;i<1000;i++)dust.emit(i*10,100,i*.05)
 assert.equal(dust.data,buffer);assert.ok([...buffer].every(Number.isFinite))
 dust.clear();assert.equal(dust.active(50),false);assert.equal(dust.active(0),false)
})
test('input ignores nested scroll and touch; removes every listener',()=>{
 const events=()=>{const m=new Map();return{m,addEventListener:(k,v)=>m.set(k,v),removeEventListener:k=>m.delete(k)}}
 const win={...events(),innerWidth:1440,innerHeight:1000},doc={...events(),defaultView:win}
 let allowed=true;const changes=[]
 const dispose=installSpiritInput(doc,()=>allowed,(...args)=>changes.push(args))
 doc.m.get('scroll')({target:{matches:()=>false,scrollTop:2000}});assert.equal(changes.length,0)
 doc.m.get('scroll')({target:{matches:()=>true,scrollTop:2000}});assert.ok(changes[0][0]>0)
 doc.m.get('pointermove')({pointerType:'touch'});assert.equal(changes.length,1)
 doc.m.get('pointermove')({pointerType:'mouse',clientX:10,clientY:100,target:{closest:()=>({})}})
 assert.equal(changes.at(-1)[5],true);assert.equal(changes.at(-1)[6],false)
 doc.m.get('pointermove')({pointerType:'mouse',clientX:20,clientY:100,target:{closest:()=>null}})
 assert.equal(changes.at(-1)[6],true)
 allowed=false;doc.m.get('scroll')({target:{matches:()=>true,scrollTop:1000}});assert.equal(changes.length,3)
 win.m.get('blur')();assert.deepEqual(changes.at(-1).slice(0,2),[0,0])
 dispose();assert.equal(doc.m.size,0);assert.equal(win.m.size,0)
})
test('stage observes only the scrollport; retarget and dispose release observers',()=>{
 let callback,observed=null,reads=0
 const a={getBoundingClientRect:()=>{reads++;return{left:300,right:1440,top:60,bottom:840}}}
 const b={getBoundingClientRect:()=>({left:0,right:1200,top:60,bottom:840})}
 let target=a;const values=[]
 const doc={querySelector:()=>target,defaultView:{innerWidth:1440,innerHeight:1000,ResizeObserver:class{constructor(fn){callback=fn}observe(el){observed=el}disconnect(){observed=null}}}}
 const watcher=watchSpiritStage(doc,v=>values.push(v))
 assert.deepEqual(values.at(-1),[300,1440,60,840]);assert.equal(observed,a);assert.equal(reads,1)
 target=b;watcher.refresh();assert.equal(observed,b);assert.deepEqual(values.at(-1),[0,1200,60,840])
 watcher.dispose();assert.equal(observed,null);const count=values.length;callback();assert.equal(values.length,count)
 assert.deepEqual(stageBounds(1440,1000,{left:-10,right:1900,top:-10,bottom:1200}),[0,1440,0,1000])
})
test('light reading surfaces retain AA dark-text contrast even over black artwork',()=>{
 const lum=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0)
 const background=[249,252,249].map(v=>v*.76)
 for(const text of [[36,40,50],[60,78,80]])assert.ok((lum(background)+.05)/(lum(text)+.05)>=4.5)
})
