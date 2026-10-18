import { sceneUv } from './motion.js'
import type { SpiritStage } from './stage.js'

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value))
/** Only the visible side bands react; moving over text does not summon a ring. */
export function edgeProximity(x:number,y:number,stage:SpiritStage):number {
  const [left,right,top,bottom]=stage
  if(!Number.isFinite(x+y)||right-left<280||x<left||x>right||y<top||y>bottom)return 0
  const band=Math.min(180,(right-left)*.20)
  return clamp(1-Math.min(x-left,right-x)/band,0,1)
}
/** At most 10 CSS pixels of background travel, even in very long chats. */
export function scrollCamera(top:number,height:number):number {
  if(!Number.isFinite(top)||height<=0)return 0
  return Math.tanh(Math.max(0,top)/1000)*10/Math.max(1,height)
}

/** Passive input only. No scroll mutation, layout measurements, RAF or timers. */
export function installSpiritInput(doc:Document,allowed:()=>boolean,onChange:(scroll:number,gather:number,x:number,y:number,kick:number,moving:boolean,background:boolean)=>void,getStage:()=>SpiritStage=()=>[0,doc.defaultView!.innerWidth,0,doc.defaultView!.innerHeight]):()=>void {
  const win=doc.defaultView;if(!win)return()=>{}
  let scroll=0,gather=0,x=-1000,y=-1000,lastTop=0,lastTarget:Element|null=null
  const publish=(kick=0,moving=false,background=false)=>onChange(scroll,gather,x,y,kick,moving,background)
  const onScroll=(event:Event)=>{
    const el=event.target as Element|null
    if(!allowed()||!el?.matches?.('[data-conversation-scroll]'))return
    const [,sourceHeight]=sceneUv(win.innerWidth,win.innerHeight,1672,940)
    const kick=el===lastTarget?Math.min(1,Math.abs(el.scrollTop-lastTop)/120):.25
    lastTarget=el;lastTop=el.scrollTop
    scroll=scrollCamera(el.scrollTop,win.innerHeight)*sourceHeight;publish(kick)
  }
  const pointer=(event:PointerEvent)=>{
    if(!allowed()||event.pointerType==='touch')return
    x=event.clientX;y=event.clientY;gather=edgeProximity(x,y,getStage())
    const target=event.target as Element|null
    const background=!target?.closest?.('[data-chat-flow-kind],[data-composer-card],button,a,input,textarea,select,[role="dialog"],[role="menu"],[data-slot="sidebar"],[data-slot="rightbar"]')
    publish(0,true,background)
  }
  const clear=()=>{scroll=0;gather=0;x=-1000;y=-1000;lastTarget=null;lastTop=0;publish()}
  const leave=()=>{gather=0;x=-1000;y=-1000;publish()}
  doc.addEventListener('scroll',onScroll,{capture:true,passive:true})
  doc.addEventListener('pointermove',pointer,{passive:true})
  doc.addEventListener('pointerleave',leave)
  win.addEventListener('blur',clear)
  return()=>{
    doc.removeEventListener('scroll',onScroll,true);doc.removeEventListener('pointermove',pointer)
    doc.removeEventListener('pointerleave',leave);win.removeEventListener('blur',clear)
  }
}
