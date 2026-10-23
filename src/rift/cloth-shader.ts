/** Independently traced cloth cutouts. Rotation preserves stroke widths and
 * fold geometry; the source artwork, arm and torso are never rubber-warped.
 */
export const CLOTH_SHADER=`
uniform sampler2D clothAtlas;
uniform float clothReady;
uniform vec2 clothAngles;
vec4 clothLayer(vec2 p,vec2 origin,float row){
 vec2 local=(p-origin)/vec2(256.,160.);
 float valid=step(0.,local.x)*step(0.,local.y)*step(local.x,1.)*step(local.y,1.);
 vec2 bounded=clamp(local,vec2(.00195,.003125),vec2(.99805,.996875));
 vec4 value=texture2D(clothAtlas,vec2(bounded.x,(bounded.y+row)/2.));
 value.a*=valid;return value;
}
vec2 clothSource(vec2 p,vec2 pivot,float angle){
 vec2 relative=p-pivot;
 // Inverse of a rigid forward rotation: no ellipse displacement or scaling.
 return vec2(cos(angle)*relative.x+sin(angle)*relative.y,
             -sin(angle)*relative.x+cos(angle)*relative.y)+pivot;
}
vec3 clothPart(vec2 p,vec3 background,vec2 origin,float row,vec2 pivot,float angle,float free){
 if(free<=0.||abs(angle)<.00001)return background;
 vec2 q=clothSource(p,pivot,angle);
 vec4 old=clothLayer(p,origin,row),moved=clothLayer(q,origin,row);
 if(max(old.a,moved.a)<.001)return background;
 vec3 ink=texture2D(scene,q/vec2(1672.,940.)).rgb;
 // Coverage replacement, NOT two alpha-over passes: at angle=0 this is
 // exactly the original artwork, including all antialiased outline pixels.
 vec3 result=background*(1.-max(old.a,moved.a))+ink*moved.a+old.rgb*max(old.a-moved.a,0.);
 return mix(background,result,free);
}
vec3 clothPaint(vec2 uv,vec3 background){
 if(clothReady<.5)return background;
 vec2 p=uv*vec2(1672.,940.);
 if(p.x<1110.||p.x>1376.||p.y<480.||p.y>780.)return background;
 // The upper arm and upper sleeve cover the attachment. The fade is inside
 // unoutlined dark fabric, never across the visible cuff contour or skin.
 float cuffFree=smoothstep(535.,550.,p.y)*(1.-smoothstep(1260.,1290.,p.x));
 background=clothPart(p,background,vec2(1120.,480.),0.,vec2(1242.,534.),clothAngles.x,cuffFree);
 // Root lies inside the natural diagonal fold. The loose corner swings as
 // one intact flap and passes over the stationary trousers, not through them.
 float hemFree=1.-smoothstep(1250.,1295.,p.x);
 return clothPart(p,background,vec2(1110.,620.),1.,vec2(1280.,665.),clothAngles.y,hemFree);
}
`
