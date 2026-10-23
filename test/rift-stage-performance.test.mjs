import test from 'node:test'
import assert from 'node:assert/strict'
import {watchSpiritStage} from '../lib/rift/stage.js'

test('stage refresh and observer notifications emit only changed bounds',()=>{
 let notify,disconnected=0
 let rect={left:100,right:900,top:40,bottom:700}
 const target={getBoundingClientRect:()=>rect}
 const win={innerWidth:1000,innerHeight:800,ResizeObserver:class {
  constructor(callback){notify=callback}
  observe(){} disconnect(){disconnected++}
 }}
 const changes=[]
 const stage=watchSpiritStage({defaultView:win,querySelector:()=>target},value=>changes.push(value))
 for(let i=0;i<20;i++){stage.refresh();notify()}
 assert.deepEqual(changes,[[100,900,40,700]])
 rect={...rect,left:200};notify()
 assert.deepEqual(changes.at(-1),[200,900,40,700])
 assert.equal(changes.length,2)
 stage.dispose();rect={...rect,left:300};notify();stage.refresh()
 assert.equal(changes.length,2);assert.ok(disconnected>0)
})
