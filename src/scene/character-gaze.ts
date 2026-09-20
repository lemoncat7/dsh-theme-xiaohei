import {clampGaze} from './character-eye-rig.js'
import type {Point} from './character-motion-types.js'

interface GazeClock {
  requestAnimationFrame(callback:(time:number)=>void):number
  cancelAnimationFrame(handle:number):void
  performance:{now():number}
}
/** Event-driven damping. At rest there are no queued frames or polling. */
export function createCharacterGaze(clock:GazeClock,changed:(point:Point)=>void){
  let value:Point=[0,0],target:Point=[0,0],frame:number|undefined,last=0,disposed=false
  function step(now:number){
    frame=undefined
    if(disposed)return
    const dt=Math.min(64,Math.max(0,now-last));last=now
    const amount=1-Math.exp(-dt/95)
    value=[value[0]+(target[0]-value[0])*amount,value[1]+(target[1]-value[1])*amount]
    const settled=Math.hypot(value[0]-target[0],value[1]-target[1])<.001
    if(settled)value=target
    changed(value)
    if(!settled)frame=clock.requestAnimationFrame(step)
  }
  function stop(){if(frame!==undefined)clock.cancelAnimationFrame(frame);frame=undefined}
  return {
    target(x:number,y:number){
      if(disposed)return
      target=clampGaze(x,y)
      if(frame===undefined && Math.hypot(value[0]-target[0],value[1]-target[1])>=.001){last=clock.performance.now();frame=clock.requestAnimationFrame(step)}
    },
    reset(){stop();target=value=[0,0];changed(value)},
    dispose(){disposed=true;stop()},
  }
}
