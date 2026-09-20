import test from 'node:test'
import assert from 'node:assert/strict'
import {createCharacterGaze} from '../lib/scene/character-gaze.js'
import {clampGaze,EYE_RIGS,eyelidControls} from '../lib/scene/character-eye-rig.js'
import {lidY} from '../lib/scene/character-eye-material.js'

test('closed lashes follow the tilted eye and meet below the original centre',()=>{
 for(const eyes of Object.values(EYE_RIGS))for(const eye of eyes){
  const closed=eyelidControls(eye,1)
  assert.ok(closed.left[1]>eye.left[1])
  assert.ok(Math.abs((closed.right[1]-closed.left[1])-(eye.right[1]-eye.left[1]))<1e-8)
  for(let t=0;t<=1;t+=.05){
   const lids=eyelidControls(eye,t),shape={...eye,left:lids.left,right:lids.right}
   for(let x=eye.left[0];x<eye.right[0];x++){
    assert.ok(lidY(shape,lids.upper,x)<=lidY(shape,lids.lower,x)+.01,'lids cannot cross')
   }
  }
 }
})

test('gaze stays radially bounded and rejects invalid coordinates',()=>{
  assert.deepEqual(clampGaze(NaN,1),[0,0])
  assert.deepEqual(clampGaze(0,0),[0,0])
  assert.ok(Math.abs(Math.hypot(...clampGaze(10,-10))-1)<1e-10)
})
test('eyelids meet continuously for every pose',()=>{
  for(const eyes of Object.values(EYE_RIGS))for(const eye of eyes){
    assert.deepEqual(eyelidControls(eye,0),{upper:eye.upper,lower:eye.lower,left:eye.left,right:eye.right})
    const shut=eyelidControls(eye,1)
    assert.deepEqual(shut.upper,shut.lower)
  }
})
test('gaze eases, reverses without jumping, sleeps and disposes',()=>{
  let time=0,id=0,point=[0,0];const frames=new Map()
  const clock={performance:{now:()=>time},requestAnimationFrame:cb=>{frames.set(++id,cb);return id},cancelAnimationFrame:id=>frames.delete(id)}
  const gaze=createCharacterGaze(clock,p=>point=p)
  const tick=()=>{time+=16;const jobs=[...frames.values()];frames.clear();jobs.forEach(cb=>cb(time))}
  gaze.target(1,0);tick()
  assert.ok(point[0]>0 && point[0]<.2)
  const before=point[0];gaze.target(-1,0)
  assert.equal(point[0],before);tick();assert.ok(point[0]<before)
  for(let i=0;i<100;i++)tick()
  assert.deepEqual(point,[-1,0]);assert.equal(frames.size,0)
  gaze.target(1,1);gaze.reset();assert.deepEqual(point,[0,0]);assert.equal(frames.size,0)
  gaze.target(1,0);gaze.dispose();assert.equal(frames.size,0)
  gaze.target(-1,0);assert.equal(frames.size,0)
})
