import { sceneUv } from './motion.js'

export type Point=[number,number]
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))
/** Source pixels, matching cover/right/center at every viewport aspect ratio. */
export function scenePoint(x:number,y:number,width:number,height:number):Point {
 const [sx,sy,ox,oy]=sceneUv(Math.max(1,width),Math.max(1,height),1672,940)
 return[(x/Math.max(1,width)*sx+ox)*1672,(y/Math.max(1,height)*sy+oy)*940]
}
export function characterNear(point:Point):number {
 if(!point.every(Number.isFinite))return 0
 return clamp(1-Math.hypot((point[0]-1360)/250,(point[1]-340)/230),0,1)
}
export function blinkEnvelope(elapsed:number):number {
 if(elapsed<0||elapsed>=.24)return 0
 if(elapsed<.075)return Math.sin(elapsed/.075*Math.PI*.5)
 if(elapsed<.11)return 1
 return Math.cos((elapsed-.11)/.13*Math.PI*.5)
}
/** Small independent character controller; no DOM, network, timers or per-frame allocation. */
export class CharacterMotion {
 readonly pose={gaze:[0,0] as Point,tilt:0,blink:0,ear:0,nod:0}
 private point:Point=[1360,390]
 private attention:Point=[1200,650]
 private near=0
 private dwell=0
 private clock=0
 private nextBlink=4.2
 private blinkStart=-10
 private earStart=-10
 private nodStart=-10
 private cooldown=0
 private sequence=0
 pointer(point:Point):void{this.point=point;this.near=characterNear(point)}
 leave():void{this.near=0;this.dwell=0}
 focus(point:Point):void{this.attention=point}
 respond():void{if(this.clock-this.nodStart>1.2)this.nodStart=this.clock}
 reset():void{
  this.leave();this.pose.gaze[0]=0;this.pose.gaze[1]=0
  this.pose.tilt=0;this.pose.blink=0;this.pose.ear=0;this.pose.nod=0
  this.blinkStart=-10;this.earStart=-10;this.nodStart=-10;this.nextBlink=this.clock+4.2
 }
 step(delta:number,focused:boolean):void{
  const dt=clamp(Number.isFinite(delta)?delta:0,0,.1);this.clock+=dt;this.cooldown=Math.max(0,this.cooldown-dt)
  this.dwell=this.near>.2?this.dwell+dt:0
  if(this.dwell>.65&&this.cooldown===0){
   this.blinkStart=this.clock;this.earStart=this.clock+.12;this.cooldown=5;this.dwell=0;this.nextBlink=this.clock+5
  }
  if(this.clock>=this.nextBlink){this.blinkStart=this.clock;this.nextBlink=this.clock+4.6+(++this.sequence%4)*.63}
  const target=focused?this.attention:this.point,weight=focused?1:this.near
  const tx=clamp((target[0]-1320)/200,-1,1)*2.3*weight,ty=clamp((target[1]-390)/200,-1,1)*1.5*weight
  const ease=1-Math.exp(-dt*5)
  this.pose.gaze[0]+=(tx-this.pose.gaze[0])*ease;this.pose.gaze[1]+=(ty-this.pose.gaze[1])*ease
  this.pose.tilt+=(clamp((target[0]-1360)/450,-1,1)*.008*weight-this.pose.tilt)*ease
  this.pose.blink=blinkEnvelope(this.clock-this.blinkStart)
  const ear=this.clock-this.earStart,nod=this.clock-this.nodStart
  this.pose.ear=ear>=0&&ear<.9?Math.sin(ear/.9*Math.PI*2)*Math.exp(-ear*3)*.035:0
  this.pose.nod=nod>=0&&nod<.65?Math.sin(nod/.65*Math.PI)*2.4:0
 }
}
