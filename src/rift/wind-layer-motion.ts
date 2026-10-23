import { windPressure } from './wind.js'
import { WIND_PARTS } from './wind-layer-geometry.js'
import { ACTIVE_WIND_INDICES } from './wind-layer-config.js'

/** Only enabled joints advance; inactive layer slots stay exactly zero. */
export class WindLayerMotion {
 readonly angles=new Float32Array(5)
 readonly firstFour=this.angles.subarray(0,4)
 private readonly velocity=new Float64Array(5)
 private time=0
 advance(time:number):void {
  if(!Number.isFinite(time)||time<0||time===this.time)return
  const elapsed=time-this.time
  if(elapsed<0||elapsed>1){
   for(const j of ACTIVE_WIND_INDICES){const p=WIND_PARTS[j]!;this.angles[j]=p.angle*windPressure(time-p.lag)}
   this.velocity.fill(0);this.time=time;return
  }
  const steps=Math.ceil(elapsed*120),dt=elapsed/steps
  for(let step=0;step<steps;step++){
   this.time+=dt
   for(const j of ACTIVE_WIND_INDICES){
    const p=WIND_PARTS[j]!,omega=5.2,damping=.9
    const target=p.angle*windPressure(this.time-p.lag)
    const velocity=this.velocity[j]!+(omega*omega*(target-this.angles[j]!)-2*damping*omega*this.velocity[j]!)*dt
    this.velocity[j]=velocity;this.angles[j]=this.angles[j]!+velocity*dt
   }
  }
  this.time=time
 }
}
