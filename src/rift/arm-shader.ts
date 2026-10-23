/** Small shoulder-led motion of the outstretched arm. The hand, fingers and
 * forearm share one rigid rotation. Falloff is outside the silhouette and at
 * the upper sleeve attachment, never independently at the wrist/fingers.
 * Remap the original scene AND cloth together: no static arm left beneath.
 */
export const ARM_SHADER=`
uniform float armAngle;
float armCoverage(vec2 p,vec2 a,vec2 b,float radius){
 vec2 ab=b-a;
 float t=clamp(dot(p-a,ab)/dot(ab,ab),0.,1.);
 return 1.-smoothstep(radius,radius+24.,length(p-a-t*ab));
}
vec2 armSource(vec2 uv){
 vec2 p=uv*vec2(1672.,940.);
 if(abs(armAngle)<.000001||p.x<1030.||p.x>=1300.||p.y<380.||p.y>650.)return uv;
 float hand=armCoverage(p,vec2(1134.,472.),vec2(1214.,508.),70.);
 float sleeve=armCoverage(p,vec2(1214.,500.),vec2(1213.,557.),65.);
 float top=410.+max(p.x-1160.,0.)*.5;
 // Only introduce the head guard near the shoulder, not across the open
 // sky above the hand (a short fade there would compress the background).
 float headGuard=mix(1.,smoothstep(top,top+20.,p.y),smoothstep(1160.,1220.,p.x));
 float weight=max(hand,sleeve)*headGuard*(1.-smoothstep(1245.,1300.,p.x));
 vec2 pivot=vec2(1290.,477.),d=p-pivot;
 float c=cos(armAngle),s=sin(armAngle);
 vec2 source=vec2(c*d.x+s*d.y,-s*d.x+c*d.y)+pivot;
 return mix(p,source,weight)/vec2(1672.,940.);
}
`
