import { windPressure } from './wind.js'

const JOINTS=[
 {amplitude:.13,lag:.3,omega:5.5,damping:.92},
 {amplitude:.125,lag:.55,omega:3.8,damping:.86},
 // The supporting arm moves much less and responds more slowly than fabric.
 {amplitude:.018,lag:.8,omega:2.8,damping:1},
] as const

/** Damped rotational joints on the scene's existing clock. No DOM,
 * timers, frame allocations, random resets or independent animation loops. */
export class ClothMotion {
 private readonly values=new Float32Array(3)
 readonly angles=this.values.subarray(0,2)
 get armAngle():number { return this.values[2]! }
 private readonly velocity=new Float64Array(3)
 private time=0

 advance(time:number):void {
  if(!Number.isFinite(time)||time<0)return
  const elapsed=time-this.time
  if(elapsed===0)return
  if(elapsed<0||elapsed>1){
   // Renderer recreation/seeking must not integrate minutes of old wind.
   for(let joint=0;joint<JOINTS.length;joint++){
    const {amplitude,lag}=JOINTS[joint]!
    this.values[joint]=amplitude*windPressure(time-lag)
   }
   this.velocity.fill(0);this.time=time;return
  }
  const steps=Math.ceil(elapsed*120),dt=elapsed/steps
  for(let step=0;step<steps;step++){
   this.time+=dt
   for(let joint=0;joint<JOINTS.length;joint++){
    const {omega,damping,amplitude,lag}=JOINTS[joint]!
    const target=amplitude*windPressure(this.time-lag)
    const angle=this.values[joint]!,velocity=this.velocity[joint]!
    const nextVelocity=velocity+(omega*omega*(target-angle)-2*damping*omega*velocity)*dt
    this.velocity[joint]=nextVelocity
    this.values[joint]=angle+nextVelocity*dt
   }
  }
  this.time=time
 }
}
