import { sceneUv, renderSize } from './motion.js'
import { DUST_COUNT, DUST_VERTEX, DUST_FRAGMENT, type PointerDust } from './dust.js'
import { CHARACTER_SHADER } from './character-shader.js'
import { SCENE_MOTION_SHADER } from './scene-motion.js'
import { WIND_LAYER_SHADER } from './wind-layer-shader.js'
import { WindLayerMotion } from './wind-layer-motion.js'
import type { CharacterMotion } from './character.js'
const VERTEX = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`
/** One artwork/character pass and optional short-lived dust, sharing one context. */
export const RIFT_FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform sampler2D scene;
uniform vec2 resolution;
uniform vec4 cover;
uniform float time;
uniform float energy;
uniform float pulse;
uniform float scroll;
uniform float gather;
uniform float daylight;
${SCENE_MOTION_SHADER}
${CHARACTER_SHADER}
${WIND_LAYER_SHADER}
float area(vec2 p,vec2 center,vec2 radius){return 1.-smoothstep(.3,1.,length((p-center)/radius));}
void main(){
  vec2 uv=vec2(gl_FragCoord.x/resolution.x,1.-gl_FragCoord.y/resolution.y)*cover.xy+cover.zw;
  uv.y+=scroll;
  // Scenery may float; the character stays in original source coordinates.
  // Hair and fabric are independent alpha layers, never UV displacement.
  vec2 sampleUV=sceneMotion(uv,time);
  vec3 color=texture2D(scene,clamp(sampleUV,0.,1.)).rgb;
  float signedLine=uv.x-(.862-.435*uv.y);
  float line=abs(signedLine);
  float fissure=exp(-line*line*5200.);
  float wave=pow(.5+.5*sin(uv.y*16.-time*(.85+energy*1.0)),6.);
  float halo=exp(-line*line*320.);
  // Two intermittent silver-green currents beside the original bright rift.
  float ribbon=exp(-pow((signedLine-.015*sin(uv.y*12.-time*.42)) * 145.,2.));
  float sweep=exp(-pow((uv.y-(1.-pulse)*1.4)*11.,2.))*pulse;
  float glow=fissure*(.035+wave*(.28+energy*.23)+sweep*.60)+halo*(.025+energy*.035+sweep*.08)+ribbon*wave*.16;
  float faceShield=1.-area(uv,vec2(.815,.39),vec2(.13,.19));
  color+=vec3(.45,.72,1.)*glow*faceShield*mix(1.,.23,daylight);
  color=characterPaint(uv,color,0.);
  color=windLayersPaint(uv,color);
  gl_FragColor=vec4(color,1.);
}`
export interface RiftEffects { character:CharacterMotion['pose']; dust:PointerDust }
export interface RiftRenderer { resize(width:number,height:number):void; paint(time:number,energy:number,pulse:number,scroll?:number,gather?:number,effects?:RiftEffects):void; dispose():void }
export function createRiftRenderer(canvas:HTMLCanvasElement,image:HTMLImageElement,light=false,atlas?:HTMLImageElement,layers?:HTMLImageElement):RiftRenderer|undefined {
  if(!atlas?.naturalWidth)return undefined
  const gl=canvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:false})
  if (!gl) return undefined
  const shaders:WebGLShader[]=[]
  let program:WebGLProgram|null=null,buffer:WebGLBuffer|null=null,texture:WebGLTexture|null=null,rigTexture:WebGLTexture|null=null
  let spiritProgram:WebGLProgram|null=null,spiritBuffer:WebGLBuffer|null=null,layerTexture:WebGLTexture|null=null
  const release=()=>{for(const t of[texture,rigTexture,layerTexture])if(t)gl.deleteTexture(t);for(const b of[buffer,spiritBuffer])if(b)gl.deleteBuffer(b);for(const p of[program,spiritProgram])if(p)gl.deleteProgram(p);for(const shader of shaders)gl.deleteShader(shader)}
  try {
    const compile=(type:number,source:string)=>{const shader=gl.createShader(type);if(!shader)throw Error('Shader unavailable');shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader compilation failed');return shader}
    program=gl.createProgram();if(!program)throw Error('Program unavailable')
    gl.attachShader(program,compile(gl.VERTEX_SHADER,VERTEX));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,RIFT_FRAGMENT));gl.linkProgram(program)
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader link failed')
    gl.useProgram(program)
    buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0)
    texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);gl.uniform1i(gl.getUniformLocation(program,'scene'),0)
    rigTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,rigTexture)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,atlas);gl.uniform1i(gl.getUniformLocation(program,'characterAtlas'),1)
    if(layers?.naturalWidth===640&&layers.naturalHeight===1280){
      layerTexture=gl.createTexture();gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,layerTexture)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,layers)
      gl.uniform1i(gl.getUniformLocation(program,'windLayerAtlas'),2);gl.uniform1f(gl.getUniformLocation(program,'windLayersReady'),1)
    }
    const uniforms=Object.fromEntries(['resolution','cover','time','energy','pulse','scroll','gather','pose','gaze','windAngles','hemAngle'].map(key=>[key,gl.getUniformLocation(program!,key)]))
    const layerMotion=new WindLayerMotion()
    gl.uniform1f(gl.getUniformLocation(program,'daylight'),light?1:0)
    spiritProgram=gl.createProgram();if(!spiritProgram)throw Error('Spirit program unavailable')
    gl.attachShader(spiritProgram,compile(gl.VERTEX_SHADER,DUST_VERTEX));gl.attachShader(spiritProgram,compile(gl.FRAGMENT_SHADER,DUST_FRAGMENT));gl.linkProgram(spiritProgram)
    if(!gl.getProgramParameter(spiritProgram,gl.LINK_STATUS))throw Error('Spirit shader link failed')
    const spiritUniforms=Object.fromEntries(['viewport','time','scale'].map(key=>[key,gl.getUniformLocation(spiritProgram!,key)]))
    gl.useProgram(spiritProgram);gl.uniform1f(gl.getUniformLocation(spiritProgram,'daylight'),light?1:0)
    const seed=gl.getAttribLocation(spiritProgram,'birth'),drift=gl.getAttribLocation(spiritProgram,'drift')
    spiritBuffer=gl.createBuffer();if(!spiritBuffer)throw Error('Spirit buffer unavailable')
    gl.bindBuffer(gl.ARRAY_BUFFER,spiritBuffer);gl.bufferData(gl.ARRAY_BUFFER,DUST_COUNT*6*4,gl.DYNAMIC_DRAW)
    let disposed=false
    return {
      resize(width,height){
        if(disposed)return;const[w,h]=renderSize(width,height,canvas.ownerDocument.defaultView?.devicePixelRatio)
        // Reassigning even identical dimensions clears/reallocates the drawing buffer.
        if(canvas.width!==w)canvas.width=w
        if(canvas.height!==h)canvas.height=h
        gl.viewport(0,0,w,h)
        const cover=sceneUv(width,height,image.naturalWidth,image.naturalHeight)
        gl.useProgram(program);gl.uniform2f(uniforms.resolution!,w,h);gl.uniform4fv(uniforms.cover!,cover)
        gl.useProgram(spiritProgram);gl.uniform2f(spiritUniforms.viewport!,width,height);gl.uniform1f(spiritUniforms.scale!,w/Math.max(1,width))
      },
      paint(time,energy,pulse,scroll=0,gather=0,effects){
        if(disposed||gl.isContextLost())return
        gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0)
        // Keep eye/ear reactions, but do not move the skull under separately
        // hinged locks; shoulder/waist also remain fixed in the source art.
        if(effects){const p=effects.character;gl.uniform4f(uniforms.pose!,0,p.blink,p.ear,0);gl.uniform2fv(uniforms.gaze!,p.gaze)}
        if(layerTexture){layerMotion.advance(time);gl.uniform4fv(uniforms.windAngles!,layerMotion.firstFour);gl.uniform1f(uniforms.hemAngle!,layerMotion.angles[4]!)}
        gl.uniform1f(uniforms.time!,time);gl.uniform1f(uniforms.energy!,energy);gl.uniform1f(uniforms.pulse!,pulse);gl.uniform1f(uniforms.scroll!,scroll);gl.uniform1f(uniforms.gather!,gather);gl.drawArrays(gl.TRIANGLES,0,6)
        gl.disableVertexAttribArray(position)
        if(effects?.dust.active(time)){
          gl.useProgram(spiritProgram);gl.bindBuffer(gl.ARRAY_BUFFER,spiritBuffer)
          if(effects.dust.dirty){gl.bufferSubData(gl.ARRAY_BUFFER,0,effects.dust.data);effects.dust.dirty=false}
          gl.enableVertexAttribArray(seed);gl.vertexAttribPointer(seed,3,gl.FLOAT,false,24,0)
          gl.enableVertexAttribArray(drift);gl.vertexAttribPointer(drift,3,gl.FLOAT,false,24,12)
          gl.uniform1f(spiritUniforms.time!,time)
          gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.POINTS,0,DUST_COUNT);gl.disable(gl.BLEND);gl.disableVertexAttribArray(seed);gl.disableVertexAttribArray(drift)
        }
      },
      dispose(){if(!disposed){disposed=true;release()}},
    }
  }catch{release();return undefined}
}
