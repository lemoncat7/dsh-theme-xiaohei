import test from 'node:test'
import assert from 'node:assert/strict'
import {blinkClosure,attentionBlink} from '../lib/scene/character-expression.js'

test('blink closes faster than it opens without opacity ghosting or endpoint jumps',()=>{
  for (const t of [-1,0,1,2]) assert.equal(blinkClosure(t),0)
  assert.equal(blinkClosure(.3),1)
  assert.equal(blinkClosure(.4),1)
  for(let t=0;t<1;t+=.001){
    assert.ok(blinkClosure(t)>=0 && blinkClosure(t)<=1)
    assert.ok(Math.abs(blinkClosure(t+.001)-blinkClosure(t))<.006)
  }
  assert.equal(attentionBlink(0),0)
  assert.equal(attentionBlink(1),0)
  assert.ok(attentionBlink(.175)>.99)
})
