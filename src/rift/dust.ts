/** Short-lived pointer dust only. No idle emission, fixed memory and bounded lifetime. */
export const DUST_COUNT=24
export class PointerDust {
 readonly data=new Float32Array(DUST_COUNT*6)
 dirty=true
 private cursor=0
 private lastX=-1000
 private lastY=-1000
 private lastTime=-10
 constructor(){this.clear()}
 clear():void{this.data.fill(0);for(let i=0;i<DUST_COUNT;i++)this.data[i*6+2]=-10;this.dirty=true;this.lastTime=-10;this.lastX=-1000;this.lastY=-1000}
 emit(x:number,y:number,time:number):void{
  if(!Number.isFinite(x+y+time)||time-this.lastTime<.035||Math.hypot(x-this.lastX,y-this.lastY)<9)return
  const dx=this.lastX<-900?0:x-this.lastX,dy=this.lastY<-900?0:y-this.lastY
  for(let j=0;j<2;j++){
   const i=this.cursor++%DUST_COUNT,o=i*6,angle=i*2.39996
   this.data[o]=x+Math.cos(angle)*5;this.data[o+1]=y+Math.sin(angle)*5;this.data[o+2]=time
   this.data[o+3]=Math.cos(angle)*13-Math.max(-20,Math.min(20,dx*.15))
   this.data[o+4]=Math.sin(angle)*10-Math.max(-20,Math.min(20,dy*.15))
   this.data[o+5]=2.5+(i%3)*1.2
  }
  this.lastX=x;this.lastY=y;this.lastTime=time;this.dirty=true
 }
 active(time:number):boolean{return time-this.lastTime<1.1&&this.lastTime>=0}
}
export const DUST_VERTEX=`
precision mediump float;
attribute vec3 birth;
attribute vec3 drift;
uniform vec2 viewport;
uniform float time;
uniform float scale;
varying float alpha;
void main(){
 float age=time-birth.z;
 float alive=step(0.,age)*(1.-step(1.1,age));
 vec2 pos=birth.xy+drift.xy*clamp(age,0.,1.1);
 gl_Position=vec4(pos.x/viewport.x*2.-1.,1.-pos.y/viewport.y*2.,0.,1.);
 if(alive<.5)gl_Position=vec4(2.,2.,0.,1.);
 gl_PointSize=max(1.,(drift.z+clamp(age,0.,1.1)*2.)*scale)*alive+(1.-alive);
 alpha=alive*(1.-smoothstep(.08,1.1,age))*.6;
}`
export const DUST_FRAGMENT=`
precision mediump float;
uniform float daylight;
varying float alpha;
void main(){
 float d=length(gl_PointCoord-.5)*2.;
 float light=exp(-d*d*4.)*(1.-smoothstep(.6,1.,d));
 gl_FragColor=vec4(mix(vec3(.65,.82,1.),vec3(.19,.36,.58),daylight),light*alpha);
}`
