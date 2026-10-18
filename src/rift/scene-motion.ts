/** Source-pixel displacement fields. Broad C1 falloff avoids cut-out seams.
 * Architecture translates as a body inside each plateau; hand/cloth movement
 * fades before the shoulder and head so the character stays connected.
 * No particles, extra textures, timers or additional draw calls.
 */
export const SCENE_MOTION_SHADER=`
float floatRegion(vec2 p,vec2 center,vec2 radius){
 return 1.-smoothstep(.62,1.,length((p-center)/radius));
}
vec2 sceneMotion(vec2 uv,float t){
 vec2 p=uv*vec2(1672.,940.);
 vec2 drift=vec2(0.);
 float farLeft=floatRegion(p,vec2(335.,790.),vec2(370.,330.));
 float farRight=floatRegion(p,vec2(1655.,425.),vec2(120.,220.));
 float nearBase=floatRegion(p,vec2(1550.,870.),vec2(235.,270.));
 drift+=farLeft*vec2(sin(t*.42)*4.5,sin(t*.48)*10.0);
 drift+=farRight*vec2(sin(t*.46)*3.2,sin(t*.40)*8.5);
 drift+=nearBase*vec2(sin(t*.44)*6.0,sin(t*.52)*12.0);
 // Original central slab and its small satellite: separate, slow buoyancy.
 float slab=floatRegion(p,vec2(970.,435.),vec2(111.,140.));
 float satellite=floatRegion(p,vec2(810.,485.),vec2(52.,85.));
 drift+=slab*vec2(sin(t*.57)*4.2,sin(t*.68)*9.0);
 drift+=satellite*vec2(sin(t*.51)*3.0,sin(t*.62)*7.0);
 // Hand translates with the sleeve; motion eases to zero toward the shoulder.
 float hand=floatRegion(p,vec2(1140.,478.),vec2(92.,85.));
 float sleeve=floatRegion(p,vec2(1220.,540.),vec2(85.,95.));
 drift+=hand*vec2(sin(t*.78)*3.0,sin(t*.72)*4.8);
 drift+=sleeve*vec2(sin(t*.78)*2.4,sin(t*.72)*4.0);
 float hem=floatRegion(p,vec2(1265.,696.),vec2(190.,97.));
 drift+=hem*vec2(sin(t*.92+p.y*.012)*8.5,sin(t*.76)*3.8);
 return uv+drift/vec2(1672.,940.);
}
`
