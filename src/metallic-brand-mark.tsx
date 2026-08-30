import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { XIAOHEI_BRAND_AVATAR } from './generated-identity.js'

interface XiaoheiBrandMarkProps {
  size: number
  className?: string | undefined
}

const VERTEX_SHADER = `#version 300 es
precision highp float;
in vec2 a_position;
out vec2 vP;
void main(){vP=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`

/* Adapted from React Bits MetallicPaint. The source avatar is already a
 * transparent tonal map, so the expensive browser-side depth solve is not
 * needed for this compact brand mark. */
const FRAGMENT_SHADER = `#version 300 es
precision highp float;
in vec2 vP;
out vec4 oC;
uniform sampler2D u_tex;
uniform float u_time,u_ratio,u_imgRatio,u_seed,u_scale,u_refract,u_blur,u_liquid;
uniform float u_bright,u_contrast,u_angle,u_fresnel,u_sharp,u_wave,u_noise,u_chroma;
uniform float u_distort,u_contour;
uniform vec3 u_lightColor,u_darkColor,u_tint;

vec3 sC,sM;

vec3 pW(vec3 v){
  vec3 i=floor(v),f=fract(v),s=sign(fract(v*.5)-.5),h=fract(sM*i+i.yzx),c=f*(f-1.);
  return s*c*((h*16.-4.)*c-1.);
}

vec3 aF(vec3 b,vec3 c){return pW(b+c.zxy-pW(b.zxy+c.yzx)+pW(b.yzx+c.xyz));}
vec3 lM(vec3 s,vec3 p){return(p+aF(s,p))*.5;}

vec2 fA(){
  vec2 c=vP-.5;
  c.x*=u_ratio>u_imgRatio?u_ratio/u_imgRatio:1.;
  c.y*=u_ratio>u_imgRatio?1.:u_imgRatio/u_ratio;
  return vec2(c.x+.5,.5-c.y);
}

vec2 rot(vec2 p,float r){float c=cos(r),s=sin(r);return vec2(p.x*c+p.y*s,p.y*c-p.x*s);}

float bM(vec2 c,float t){
  vec2 l=smoothstep(vec2(0.),vec2(t),c),u=smoothstep(vec2(0.),vec2(t),1.-c);
  return l.x*l.y*u.x*u.y;
}

float mG(float hi,float lo,float t,float sh,float cv){
  sh*=(2.-u_sharp);
  float ci=smoothstep(.15,.85,cv),r=lo;
  float e1=.08/u_scale;
  r=mix(r,hi,smoothstep(0.,sh*1.5,t));
  r=mix(r,lo,smoothstep(e1-sh,e1+sh,t));
  float e2=e1+.05/u_scale*(1.-ci*.35);
  r=mix(r,hi,smoothstep(e2-sh,e2+sh,t));
  float e3=e2+.025/u_scale*(1.-ci*.45);
  r=mix(r,lo,smoothstep(e3-sh,e3+sh,t));
  float e4=e1+.1/u_scale;
  r=mix(r,hi,smoothstep(e4-sh,e4+sh,t));
  float rm=1.-e4,gT=clamp((t-e4)/rm,0.,1.);
  r=mix(r,mix(hi,lo,smoothstep(0.,1.,gT)),smoothstep(e4-sh*.5,e4+sh*.5,t));
  return r;
}

void main(){
  sC=fract(vec3(.7548,.5698,.4154)*(u_seed+17.31))+.5;
  sM=fract(sC.zxy-sC.yzx*1.618);
  vec2 sc=vec2(vP.x*u_ratio,1.-vP.y);
  float angleRad=u_angle*3.14159/180.;
  sc=rot(sc-.5,angleRad)+.5;
  sc=clamp(sc,0.,1.);
  float sl=sc.x-sc.y,an=u_time*.001;
  vec2 iC=fA();
  vec4 texSample=texture(u_tex,iC);
  float dp=texSample.r;
  float shapeMask=texSample.a;
  vec3 hi=u_lightColor*u_bright;
  vec3 lo=u_darkColor*(2.-u_bright);
  lo.b+=smoothstep(.6,1.4,sc.x+sc.y)*.08;
  vec2 fC=sc-.5;
  float rd=length(fC+vec2(0.,sl*.15));
  vec2 ag=rot(fC,(.22-sl*.18)*3.14159);
  float cv=1.-pow(rd*1.65,1.15);
  cv*=pow(sc.y,.35);
  float vs=shapeMask;
  vs*=bM(iC,.01);
  float fr=pow(1.-cv,u_fresnel)*.3;
  vs=min(vs+fr*vs,1.);
  float mT=an*.0625;
  vec3 wO=vec3(-1.05,1.35,1.55);
  vec3 wA=aF(vec3(31.,73.,56.),mT+wO)*.22*u_wave;
  vec3 wB=aF(vec3(24.,64.,42.),mT-wO.yzx)*.22*u_wave;
  vec2 nC=sc*45.*u_noise;
  nC+=aF(sC.zxy,an*.17*sC.yzx-sc.yxy*.35).xy*18.*u_wave;
  vec3 tC=vec3(.00041,.00053,.00076)*mT+wB*nC.x+wA*nC.y;
  tC=lM(sC,tC);
  tC=lM(sC+1.618,tC);
  float tb=sin(tC.x*3.14159)*.5+.5;
  tb=tb*2.-1.;
  float noiseVal=pW(vec3(sc*8.+an,an*.5)).x;
  float edgeFactor=smoothstep(0.,.5,dp)*smoothstep(1.,.5,dp);
  float lD=dp+(1.-dp)*u_liquid*tb;
  lD+=noiseVal*u_distort*.15*edgeFactor;
  float rB=clamp(1.-cv,0.,1.);
  float fl=ag.x+sl;
  fl+=noiseVal*sl*u_distort*edgeFactor;
  fl*=mix(1.,1.-dp*.5,u_contour);
  fl-=dp*u_contour*.8;
  float eI=smoothstep(0.,1.,lD)*smoothstep(1.,0.,lD);
  fl-=tb*sl*1.8*eI;
  float cA=cv*clamp(pow(sc.y,.12),.25,1.);
  fl*=.12+(1.05-lD)*cA;
  fl*=smoothstep(1.,.65,lD);
  float vA1=smoothstep(.08,.18,sc.y)*smoothstep(.38,.18,sc.y);
  float vA2=smoothstep(.08,.18,1.-sc.y)*smoothstep(.38,.18,1.-sc.y);
  fl+=vA1*.16+vA2*.025;
  fl*=.45+pow(sc.y,2.)*.55;
  fl*=u_scale;
  fl-=an;
  float rO=rB+cv*tb*.025;
  float vM1=smoothstep(-.12,.18,sc.y)*smoothstep(.48,.08,sc.y);
  float cM1=smoothstep(.35,.55,cv)*smoothstep(.95,.35,cv);
  rO+=vM1*cM1*4.5;
  rO-=sl;
  float bO=rB*1.25;
  float vM2=smoothstep(-.02,.35,sc.y)*smoothstep(.75,.08,sc.y);
  float cM2=smoothstep(.35,.55,cv)*smoothstep(.75,.35,cv);
  bO+=vM2*cM2*.9;
  bO-=lD*.18;
  rO*=u_refract*u_chroma;
  bO*=u_refract*u_chroma;
  float sf=u_blur;
  float rP=fract(fl+rO);
  float rC=mG(hi.r,lo.r,rP,sf+.018+u_refract*cv*.025,cv);
  float gP=fract(fl);
  float gC=mG(hi.g,lo.g,gP,sf+.008/max(.01,1.-sl),cv);
  float bP=fract(fl-bO);
  float bC=mG(hi.b,lo.b,bP,sf+.008,cv);
  vec3 col=vec3(rC,gC,bC);
  col=(col-.5)*u_contrast+.5;
  col=clamp(col,0.,1.);
  col=mix(col,1.-min(vec3(1.),(1.-col)/max(u_tint,vec3(.001))),length(u_tint-1.)*.5);
  col=clamp(col,0.,1.);
  oC=vec4(col*vs,vs);
}`

const UNIFORM_NAMES = [
  'u_tex', 'u_time', 'u_ratio', 'u_imgRatio', 'u_seed', 'u_scale', 'u_refract',
  'u_blur', 'u_liquid', 'u_bright', 'u_contrast', 'u_angle', 'u_fresnel',
  'u_sharp', 'u_wave', 'u_noise', 'u_chroma', 'u_distort', 'u_contour',
  'u_lightColor', 'u_darkColor', 'u_tint',
] as const

type UniformName = typeof UNIFORM_NAMES[number]
type UniformMap = Record<UniformName, WebGLUniformLocation | null>

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | undefined {
  const shader = gl.createShader(type)
  if (shader === null) return undefined
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === true) return shader
  gl.deleteShader(shader)
  return undefined
}

function setRgb(
  gl: WebGL2RenderingContext,
  location: WebGLUniformLocation | null,
  color: readonly [number, number, number],
): void {
  gl.uniform3f(location, color[0], color[1], color[2])
}

/** Official sidebar brand occupant with a compact, lifecycle-safe metallic shader. */
export function XiaoheiMetallicBrandMark({ size, className }: XiaoheiBrandMarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)
  const visualSize = Math.max(24, size + 4)
  const context = size >= 32 ? 'hero' : 'sidebar'

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
      premultipliedAlpha: true,
    })
    if (gl === null) return

    const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (vertex === undefined || fragment === undefined) {
      if (vertex !== undefined) gl.deleteShader(vertex)
      if (fragment !== undefined) gl.deleteShader(fragment)
      return
    }

    const program = gl.createProgram()
    const buffer = gl.createBuffer()
    if (program === null || buffer === null) {
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      return
    }

    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    if (gl.getProgramParameter(program, gl.LINK_STATUS) !== true) {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      return
    }

    const uniforms = Object.fromEntries(
      UNIFORM_NAMES.map(name => [name, gl.getUniformLocation(program, name)]),
    ) as UniformMap
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    const renderSize = Math.max(96, Math.ceil(visualSize * pixelRatio * 2))
    canvas.width = renderSize
    canvas.height = renderSize
    gl.viewport(0, 0, renderSize, renderSize)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    gl.uniform1f(uniforms.u_ratio, 1)
    gl.uniform1f(uniforms.u_imgRatio, 1)
    gl.uniform1f(uniforms.u_seed, 42)
    gl.uniform1f(uniforms.u_scale, 3.2)
    gl.uniform1f(uniforms.u_refract, 0.012)
    gl.uniform1f(uniforms.u_blur, 0.018)
    gl.uniform1f(uniforms.u_liquid, 0.58)
    gl.uniform1f(uniforms.u_bright, 1.35)
    gl.uniform1f(uniforms.u_contrast, 1.08)
    gl.uniform1f(uniforms.u_angle, -12)
    gl.uniform1f(uniforms.u_fresnel, 0.8)
    gl.uniform1f(uniforms.u_sharp, 1.15)
    gl.uniform1f(uniforms.u_wave, 0.65)
    gl.uniform1f(uniforms.u_noise, 0.45)
    gl.uniform1f(uniforms.u_chroma, 0.7)
    gl.uniform1f(uniforms.u_distort, 0.35)
    gl.uniform1f(uniforms.u_contour, 0.38)
    setRgb(gl, uniforms.u_lightColor, [0.96, 0.97, 0.95])
    setRgb(gl, uniforms.u_darkColor, [0.025, 0.04, 0.045])
    setRgb(gl, uniforms.u_tint, [0.84, 0.92, 0.89])

    let disposed = false
    let visible = true
    let animationFrame: number | undefined
    let lastFrame = 0
    let metallicTime = 1450
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const texture = gl.createTexture()
    const image = new Image()

    const draw = (): void => {
      gl.uniform1f(uniforms.u_time, metallicTime)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    const render = (now: number): void => {
      if (disposed) return
      if (visible && document.visibilityState !== 'hidden' && now - lastFrame >= 40) {
        const delta = lastFrame === 0 ? 0 : Math.min(80, now - lastFrame)
        lastFrame = now
        metallicTime += delta * 0.11
        draw()
      }
      animationFrame = window.requestAnimationFrame(render)
    }

    image.onload = () => {
      if (disposed || texture === null) return
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.uniform1i(uniforms.u_tex, 0)
      draw()
      setReady(true)
      if (!reduceMotion.matches) animationFrame = window.requestAnimationFrame(render)
    }
    image.src = XIAOHEI_BRAND_AVATAR

    const visibilityObserver = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(entries => {
          visible = entries.some(entry => entry.isIntersecting)
          if (visible) lastFrame = 0
        })
      : undefined
    visibilityObserver?.observe(canvas)

    return () => {
      disposed = true
      if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame)
      visibilityObserver?.disconnect()
      if (texture !== null) gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    }
  }, [visualSize])

  const geometry = {
    '--xiaohei-brand-mark-size': `${visualSize}px`,
  } as CSSProperties

  return (
    <span
      className={className === undefined ? 'xiaohei-brand-mark' : `${className} xiaohei-brand-mark`}
      data-brand-context={context}
      data-metallic-ready={ready ? 'true' : 'false'}
      style={geometry}
      aria-hidden="true"
    >
      <img className="xiaohei-brand-mark__fallback" src={XIAOHEI_BRAND_AVATAR} alt="" />
      <canvas className="xiaohei-brand-mark__metal" ref={canvasRef} />
    </span>
  )
}

/** Official sidebar brand-name occupant paired with the Xiaohei mark. */
export function XiaoheiBrandName() {
  return <span className="xiaohei-brand-name">罗小黑 · 妖灵会馆</span>
}
