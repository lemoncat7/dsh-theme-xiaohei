/** Shared source-space wind: bounded, smooth gusts with downstream lag.
 * Included once in the existing scene pass; no timers, textures or draw calls.
 */
const smooth=(a:number,b:number,value:number)=>{const x=Math.max(0,Math.min(1,(value-a)/(b-a)));return x*x*(3-2*x)}
const gust=(time:number,period:number)=>{const phase=Math.max(time,0)%period/period;return smooth(0,.16,phase)*(1-smooth(.23,.88,phase))}
/** Same gust envelope as the shader; the cloth joints add mass/damping. */
export function windPressure(time:number):number {
 return smooth(0,.9,time)*(.08+.92*(.78*gust(time,9.7)+.22*gust(time,15.3)))
}
export const WIND_SHADER=`
float windGust(float t,float period){
 // Smooth onset, a short crest, then a much slower release. Endpoints have
 // zero slope, including the wrap; two periods keep the gusts from marching.
 float phase=mod(max(t,0.),period)/period;
 return smoothstep(0.,.16,phase)*(1.-smoothstep(.23,.88,phase));
}
float windPulse(float t){
 // A prevailing breeze, not a pendulum that reverses the wind every cycle.
 float gust=.78*windGust(t,9.7)+.22*windGust(t,15.3);
 return smoothstep(0.,.9,t)*(.08+.92*gust);
}
float windRegion(vec2 p,vec2 center,vec2 radius){
 return 1.-smoothstep(.25,1.,length((p-center)/radius));
}
vec2 hairWind(vec2 p,float t){
 // Only the upturned cowlick and the two outer fringe tips. The crown,
 // eyebrows, face, ears and neck are outside these fields; roots fade to zero.
 float curl=windRegion(p,vec2(1409.,204.),vec2(36.,46.))*(1.-smoothstep(218.,247.,p.y));
 float left=windRegion(p,vec2(1208.,365.),vec2(39.,82.))*(1.-smoothstep(1220.,1248.,p.x));
 float right=windRegion(p,vec2(1458.,428.),vec2(47.,49.))*smoothstep(1417.,1447.,p.x)*smoothstep(373.,398.,p.y);
 float strength=max(curl,max(left,right));
 float breeze=windPulse(t-(p.y-180.)*.0025);
 // Noticeable at normal viewport scale without moving the anchored face.
 float flutter=sin(t*3.4-p.y*.018)*breeze*.4;
 return strength*vec2(breeze*10.0,breeze*2.8+flutter);
}
`
