import test from 'node:test'
import assert from 'node:assert/strict'
import { createCharacterMotionClock } from '../lib/scene/character-motion-clock.js'

function fixture() {
  let now=0,id=0
  const timers=new Map(),frames=[]
  const clock={performance:{now:()=>now},setTimeout(fn,delay){timers.set(++id,{fn,at:now+delay});return id},clearTimeout(id){timers.delete(id)}}
  const motion=createCharacterMotionClock(clock,(action,frame)=>frames.push({action,frame,at:now}),()=>0)
  const advance=ms=>{const end=now+ms;while(timers.size){const [id,t]=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(t.at>end)break;now=t.at;timers.delete(id);t.fn();assert.ok(timers.size<=1)}now=end}
  return{motion,timers,frames,advance}
}
const clips={blink:{duration:330},ear0:{duration:1050},tail:{duration:2400},attention:{duration:2400}}

test('short eye and gesture sequences alternate, separated by real idle time',()=>{
  const f=fixture();f.motion.setClips(clips)
  f.advance(1199);assert.equal(f.frames.filter(x=>x.action).length,0)
  f.advance(400);const active=f.frames.filter(x=>x.action)
  assert.equal(active[0].frame,0);assert.equal(active.at(-1).frame,1)
  assert.ok(active.length<=12)
  for(let i=1;i<active.length;i++)assert.ok(active[i].at-active[i-1].at>=1000/30-.001)
  const count=f.frames.length;f.advance(2000);assert.equal(f.frames.length,count,'no periodic redraw between gestures')
  f.advance(1700);assert.ok(f.frames.some(x=>x.action==='ear0'))
  f.motion.dispose();assert.equal(f.timers.size,0)
})
test('pointer attention does not restart active gestures or keep an idle renderer awake',()=>{
 const f=fixture();f.motion.setClips(clips);f.motion.attention()
 f.advance(300);const count=f.frames.length
 f.motion.attention();assert.equal(f.frames.length,count)
 f.advance(2200);assert.equal(f.frames.at(-1).action,undefined)
 const resting=f.frames.length;f.advance(1000);assert.equal(f.frames.length,resting)
 f.motion.dispose()
})
test('background/reduced-motion pause cancels frames and resumes without catch-up',()=>{
  const f=fixture();f.motion.setClips(clips);f.advance(1260)
  f.motion.setClips(undefined);const count=f.frames.length
  f.advance(900000);assert.equal(f.frames.length,count);assert.equal(f.timers.size,0)
  f.motion.setClips(clips);f.advance(1000);assert.equal(f.frames.at(-1).action,undefined)
  f.motion.dispose();f.advance(10000);assert.equal(f.timers.size,0)
})
test('repeated host reconciliation does not restart a running animation',()=>{
  const f=fixture();f.motion.setClips(clips);f.advance(1255)
  const count=f.frames.length
  for(let i=0;i<100;i++)f.motion.setClips(clips)
  assert.equal(f.frames.length,count);assert.equal(f.timers.size,1)
  f.motion.dispose();f.motion.setClips(clips);assert.equal(f.timers.size,0)
})
