import test from 'node:test'
import assert from 'node:assert/strict'
import {bindVertex,skinVertex,solveBones,rigAngles,TAIL_JOINTS} from '../lib/scene/character-rig.js'

test('inverse bind/forward transforms reproduce original vertices exactly at rest',()=>{
 const joints=solveBones(TAIL_JOINTS,[])
 for(let x=275;x<350;x+=5)for(let y=325;y<477;y+=5){
   const v=skinVertex(bindVertex(x,y),joints)
   assert.ok(Math.hypot(v[0]-x,v[1]-y)<1e-10)
 }
})
test('joint hierarchy preserves lengths and root while propagating parent rotation',()=>{
 const angles=rigAngles(.3,TAIL_JOINTS.length,true),joints=solveBones(TAIL_JOINTS,angles)
 assert.equal(joints[0].x,TAIL_JOINTS[0][0]);assert.equal(joints[0].y,TAIL_JOINTS[0][1])
 for(let i=1;i<joints.length;i++){
  const a=joints[i-1],b=joints[i],r=TAIL_JOINTS[i-1],s=TAIL_JOINTS[i]
  assert.ok(Math.abs(Math.hypot(b.x-a.x,b.y-a.y)-Math.hypot(s[0]-r[0],s[1]-r[1]))<1e-10)
 }
})
test('motion samples continuous time, has follow-through, settles exactly',()=>{
 const angles=rigAngles(.413,7,true),next=rigAngles(.4131,7,true)
 assert.notDeepEqual(angles,next,'not a frame lookup')
 assert.notEqual(angles[1],angles[6])
 assert.ok(angles.every((a,i)=>Math.abs(a-next[i])<.001))
 for(const t of [0,1])assert.ok(rigAngles(t,7,true).every(a=>Math.abs(a)<1e-10))
})
