/** Source-pixel displacement fields. Broad C1 falloff avoids cut-out seams.
 * Architecture translates as a body inside each plateau. Clothing and the
 * torso, waist, legs and exposed arms/hands are pinned against all
 * displacement fields, including nearby floating architecture.
 * No particles, extra textures, timers or additional draw calls.
 */
import { WIND_SHADER } from './wind.js'
export const SCENE_MOTION_SHADER=`
${WIND_SHADER}
float floatRegion(vec2 p,vec2 center,vec2 radius){
 return 1.-smoothstep(.62,1.,length((p-center)/radius));
}
float armPin(vec2 p,vec2 a,vec2 b,float radius){
 vec2 ab=b-a;
 float along=clamp(dot(p-a,ab)/dot(ab,ab),0.,1.);
 return 1.-smoothstep(radius,radius+14.,length(p-a-ab*along));
}
vec2 sceneMotion(vec2 uv,float t){
 vec2 p=uv*vec2(1672.,940.);
 vec2 drift=vec2(0.);
 float farLeft=floatRegion(p,vec2(335.,790.),vec2(370.,330.));
 float farRight=floatRegion(p,vec2(1655.,425.),vec2(120.,220.));
 drift+=farLeft*vec2(sin(t*.42)*4.5,sin(t*.48)*10.0);
 drift+=farRight*vec2(sin(t*.46)*3.2,sin(t*.40)*8.5);
 // The foreground building at bottom right stays registered to the wallpaper.
 // Also block overlap from the distant right-hand architecture's field.
 drift*=1.-smoothstep(570.,650.,p.y)*smoothstep(1430.,1490.,p.x);
 // Original central slab and its small satellite: separate, slow buoyancy.
 float slab=floatRegion(p,vec2(970.,435.),vec2(111.,140.));
 float satellite=floatRegion(p,vec2(810.,485.),vec2(52.,85.));
 drift+=slab*vec2(sin(t*.57)*4.2,sin(t*.68)*9.0);
 drift+=satellite*vec2(sin(t*.51)*3.0,sin(t*.62)*7.0);
 // Do not stretch inked fabric inside ellipses: it bends outlines and folds
 // like rubber. Proper fabric motion needs an independently rigged layer.
 // Pin the whole shirt, cuff and loose hem, including scenery overlap.
 float shirt=armPin(p,vec2(1240.,555.),vec2(1360.,690.),145.);
 float hemPin=armPin(p,vec2(1170.,714.),vec2(1340.,690.),42.);
 // Pin the shirt's body and both trouser legs as well as the hands. Scenery
 // fields overlap the silhouette: narrowing the cloth field alone is not enough.
 float torso=armPin(p,vec2(1325.,520.),vec2(1355.,710.),106.);
 float legs=max(armPin(p,vec2(1282.,750.),vec2(1205.,930.),92.),armPin(p,vec2(1375.,760.),vec2(1405.,935.),85.));
 float body=max(torso,legs);
 float arms=max(armPin(p,vec2(1118.,480.),vec2(1220.,508.),54.),armPin(p,vec2(1448.,632.),vec2(1490.,708.),32.));
 drift*=1.-max(max(arms,body),max(shirt,hemPin));
 return uv+drift/vec2(1672.,940.);
}
`
