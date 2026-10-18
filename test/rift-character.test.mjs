import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {CharacterMotion,scenePoint,characterNear,blinkEnvelope} from '../lib/rift/character.js'
import {sceneUv} from '../lib/rift/motion.js'

test('character position follows the actual wallpaper crop',()=>{
 for(const [w,h] of [[1440,1000],[1920,900],[1000,900]]){
  const [sx,sy,ox,oy]=sceneUv(w,h,1672,940)
  const point=scenePoint((1360/1672-ox)/sx*w,(340/940-oy)/sy*h,w,h)
  assert.ok(characterNear(point)>.999)
 }
 assert.equal(characterNear([NaN,0]),0)
 assert.equal(characterNear([0,0]),0)
})
test('blink opens and closes with a short bounded envelope',()=>{
 assert.equal(blinkEnvelope(-1),0);assert.equal(blinkEnvelope(0),0)
 assert.equal(blinkEnvelope(.09),1);assert.ok(blinkEnvelope(.18)>0)
 assert.equal(blinkEnvelope(.24),0)
})
test('proximity has a dwell and cooldown; gaze and tilt stay anatomically small',()=>{
 const motion=new CharacterMotion();motion.pointer([1420,350])
 for(let i=0;i<10;i++)motion.step(.05,false)
 assert.equal(motion.pose.blink,0);assert.equal(motion.pose.ear,0)
 let blinks=0,ear=false
 for(let i=0;i<40;i++){
  motion.step(.05,false);if(motion.pose.blink>.5)blinks++
  ear ||= Math.abs(motion.pose.ear)>.001
  assert.ok(Math.abs(motion.pose.tilt)<=.008);assert.ok(Math.abs(motion.pose.gaze[0])<=2.3);assert.ok(Math.abs(motion.pose.gaze[1])<=1.5)
 }
 assert.ok(blinks>0&&blinks<7);assert.ok(ear)
 motion.leave();for(let i=0;i<100;i++)motion.step(.05,false)
 assert.ok(Math.abs(motion.pose.gaze[0])<.001)
})
test('focus looks toward composer; response nod settles; reset does not resume an old blink',()=>{
 const motion=new CharacterMotion();motion.focus([800,850])
 for(let i=0;i<60;i++)motion.step(.05,true)
 assert.ok(motion.pose.gaze[0]<-2);assert.ok(motion.pose.gaze[1]>1)
 motion.respond();motion.step(.1,true);assert.ok(motion.pose.nod>0)
 for(let i=0;i<20;i++)motion.step(.05,true)
 assert.equal(motion.pose.nod,0)
 motion.reset();assert.deepEqual(motion.pose,{gaze:[0,0],tilt:0,blink:0,ear:0,nod:0})
 motion.step(.1,false);assert.equal(motion.pose.blink,0)
})
test('character atlas stays out of first-paint bundle; no old edge ribbon code is shipped',()=>{
 const server=readFileSync(new URL('../lib/index.js',import.meta.url),'utf8')
 const scene=readFileSync(new URL('../lib/client.decorations.js',import.meta.url),'utf8')
 assert.doesNotMatch(server,/characterAtlas/)
 assert.match(scene,/characterAtlas/)
 assert.doesNotMatch(scene,/float lane=|float band=min\(160|SPIRIT_COUNT|spiritSeeds/)
 const rigFiles=['character-dark.webp','character-light.webp'].map(name=>readFileSync(new URL('../src/assets/rift/'+name,import.meta.url)))
 assert.ok(rigFiles.reduce((sum,b)=>sum+b.length,0)<=110000)
})
