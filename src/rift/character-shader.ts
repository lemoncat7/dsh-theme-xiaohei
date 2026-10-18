/** Atlas layers retain the original artwork; exposed edges have a repaired backplate. */
export const CHARACTER_SHADER=`
uniform sampler2D characterAtlas;
uniform vec2 gaze;
uniform vec4 pose; // tilt, blink, ear twitch, nod
vec4 characterLayer(vec2 p,float row){
 vec2 local=p/vec2(430.,350.);
 float valid=step(0.,local.x)*step(0.,local.y)*step(local.x,1.)*step(local.y,1.);
 vec2 bounded=clamp(local,vec2(.0012,.0015),vec2(.9988,.9985));
 vec4 color=texture2D(characterAtlas,vec2(bounded.x,(bounded.y+row)/4.));
 color.a*=valid;return color;
}
vec3 characterPaint(vec2 source,vec3 background,float parallax){
 vec2 raw=source*vec2(1672.,940.)-vec2(1150.,160.);
 if(raw.x<0.||raw.x>430.||raw.y<0.||raw.y>350.)return background;
 // A detached head with small motion around the neck, not whole-wallpaper warping.
 vec2 p=raw-vec2(205.,303.);
 float angle=-pose.x;
 p=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*p;
 p+=vec2(205.,303.-pose.w-parallax);
 // Pivot each ear near its attachment. Hair and face stay in their own shape.
 float leftEar=(1.-smoothstep(60.,120.,p.x))*(1.-smoothstep(70.,116.,p.y));
 float rightEar=smoothstep(300.,340.,p.x)*(1.-smoothstep(160.,208.,p.y));
 vec2 pivot=mix(vec2(60.,108.),vec2(327.,184.),step(215.,p.x));
 float earAngle=pose.z*(leftEar-rightEar);
 vec2 ep=p-pivot;
 p=mat2(cos(earAngle),-sin(earAngle),sin(earAngle),cos(earAngle))*ep+pivot;
 vec4 open=characterLayer(p,1.);
 // A continuous source-image warp, pinned at the eyelids. No detached iris
 // patch, invented eye white, or independently compressed face pixels.
 float aperture=smoothstep(.05,.9,characterLayer(p,3.).a);
 vec2 eyePoint=p-gaze*.65*aperture*(1.-pose.y);
 open.rgb=texture2D(scene,(eyePoint+vec2(1150.,160.))/vec2(1672.,940.)).rgb;
 vec4 closed=characterLayer(p,2.);
 vec3 head=mix(open.rgb,closed.rgb,pose.y*closed.a);
 vec3 base=characterLayer(raw,0.).rgb;
 // Outside the original head, keep the exact scene (including its restrained light).
 float oldMask=characterLayer(raw,1.).a;
 base=mix(background,base,oldMask);
 return mix(base,head,open.a);
}`
