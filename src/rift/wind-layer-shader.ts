import { WIND_PARTS } from './wind-layer-geometry.js'
import { ACTIVE_WIND_INDICES } from './wind-layer-config.js'
const point=(p:readonly number[])=>`vec2(${p[0]}.,${p[1]}.)`
/** Root-pinned cutouts: tips rotate, attachment zones stay on the original art.
 * Independent cleanup removes the entire old antialiased silhouette.
 */
export const WIND_LAYER_SHADER=`
uniform sampler2D windLayerAtlas;
uniform float windLayersReady;
uniform vec4 windAngles;
uniform float hemAngle;
vec4 windLayerSample(vec2 p,vec2 origin,float row,float column){
 vec2 local=(p-origin)/vec2(320.,256.);
 float valid=step(0.,local.x)*step(0.,local.y)*step(local.x,1.)*step(local.y,1.);
 vec2 bounded=clamp(local,vec2(.0015625,.001953125),vec2(.9984375,.998046875));
 vec4 value=texture2D(windLayerAtlas,vec2((bounded.x+column)/2.,(bounded.y+row)/5.));
 value.a*=valid;return value;
}
vec2 windLayerSource(vec2 p,vec2 pivot,float angle){
 vec2 d=p-pivot;float c=cos(angle),s=sin(angle);
 return vec2(c*d.x+s*d.y,-s*d.x+c*d.y)+pivot;
}
float windJointWeight(vec2 p,float row){
 if(row<.5)return 1.-smoothstep(195.,237.,p.y);
 if(row<1.5)return smoothstep(307.,359.,p.y)*(1.-smoothstep(1212.,1238.,p.x));
 if(row<2.5)return smoothstep(400.,444.,p.y)*smoothstep(0.,26.,p.x-(1490.-(p.y-400.)*2.));
 if(row<3.5)return (1.-smoothstep(1230.,1308.,p.x))*(1.-smoothstep(1180.,1230.,p.x)*(1.-smoothstep(442.,470.,p.y)));
 return 1.-smoothstep(1160.,1230.,p.x);
}
vec2 windPinnedSource(vec2 p,vec2 pivot,float angle,float row){
 // Invert the source-space joint, rather than rotating the attachment seam.
 vec2 q=p;
 for(int i=0;i<3;i++)q=windLayerSource(p,pivot,angle*windJointWeight(q,row));
 return q;
}
vec3 windLayerPart(vec2 p,vec3 background,vec2 origin,float row,vec2 pivot,float angle){
 if(abs(angle)<.00001)return background;
 vec2 local=p-origin;
 if(local.x< -24.||local.x>344.||local.y< -24.||local.y>280.||windJointWeight(p,row)<.00001)return background;
 vec2 q=windPinnedSource(p,pivot,angle,row);
 if(distance(p,q)<.00001)return background;
 vec4 old=windLayerSample(p,origin,row,0.),moved=windLayerSample(q,origin,row,1.);
 float cleanup=old.a*smoothstep(0.,1.25,distance(p,q));
 if(max(cleanup,moved.a)<.001)return background;
 vec3 ink=texture2D(scene,q/vec2(1672.,940.)).rgb;
 vec3 cleared=mix(background,old.rgb,cleanup);
 return mix(cleared,ink,moved.a);
}
vec3 windLayersPaint(vec2 uv,vec3 background){
 if(windLayersReady<.5)return background;
 vec2 p=uv*vec2(1672.,940.);
 if(p.x<1020.||p.x>1540.||p.y<145.||p.y>790.)return background;
 ${ACTIVE_WIND_INDICES.map(index=>{const part=WIND_PARTS[index];return `background=windLayerPart(p,background,${point(part.origin)},${index}.,${point(part.pivot)},windAngles.${'xyzw'[index]});`}).join('\n ')}
 return background;
}
`
