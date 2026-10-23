// Pixel regression: the complete head must equal the continuously warped
// artwork at neutral pose. This catches stationary hair fringes/backplate halos.
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {SCENE_MOTION_SHADER} from '../lib/rift/scene-motion.js'
import {CHARACTER_SHADER} from '../lib/rift/character-shader.js'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT?pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href:'playwright-core')
const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']})
try{
 const page=await browser.newPage()
 for(const mode of ['light','dark']){
  const data=async name=>'data:image/webp;base64,'+(await readFile(`src/assets/rift/${name}.webp`)).toString('base64')
  const result=await page.evaluate(async({scene,atlas,shader})=>{
   const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})
   const canvas=document.createElement('canvas');canvas.width=430;canvas.height=600
   const gl=canvas.getContext('webgl',{antialias:false,preserveDrawingBuffer:true})
   if(!gl)throw Error('WebGL unavailable')
   const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
   const program=gl.createProgram()
   gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'))
   gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`precision highp float;uniform sampler2D scene;uniform float time;uniform float check;${shader}
    vec2 warped(vec2 p){vec2 q=p+hairWind(p,time);return sceneMotion(q/vec2(1672.,940.),time)*vec2(1672.,940.);}
    void main(){vec2 p=vec2(1140.+gl_FragCoord.x,760.-gl_FragCoord.y);
     vec2 uv=(p+hairWind(p,time))/vec2(1672.,940.);
     vec3 expected=texture2D(scene,uv).rgb;
     vec3 actual=characterPaint(uv,expected,0.);
     if(check<.5){gl_FragColor=vec4(abs(actual-expected)*255.,1.);}
     else if(check<1.5){vec2 dx=(warped(p+vec2(.5,0.))-warped(p-vec2(.5,0.)));vec2 dy=(warped(p+vec2(0.,.5))-warped(p-vec2(0.,.5)));float det=dx.x*dy.y-dx.y*dy.x;
      // Only the hair/cuff/hem fields changed here, not existing floating
      // architecture at the bottom-right of this rectangular crop.
      bool cloth=p.x<1240.&&p.y>540.&&p.y<747.;
      float affected=cloth||length(hairWind(p,time))>.001?1.:0.;
      gl_FragColor=vec4(step(det,.05)*affected,0.,0.,1.);}
     else {gl_FragColor=vec4(windPulse(time),0.,0.,1.);}
    }`))
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program))
   gl.useProgram(program)
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
   const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0)
   for(const [unit,name,src]of[[0,'scene',scene],[1,'characterAtlas',atlas]]){
    const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture)
    for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE)
    for(const k of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,await load(src));gl.uniform1i(gl.getUniformLocation(program,name),unit)
   }
   const pixels=new Uint8Array(430*600*4),rows=[]
   for(const time of[0,1,2.5,4,7,9.7,12,17,23]){
    gl.uniform1f(gl.getUniformLocation(program,'time'),time)
    const row={time,maxEdgeError:0,foldedPixels:0,foldExamples:[]}
    for(const check of[0,1]){
     gl.uniform1f(gl.getUniformLocation(program,'check'),check);gl.drawArrays(gl.TRIANGLES,0,6);gl.readPixels(0,0,430,600,gl.RGBA,gl.UNSIGNED_BYTE,pixels)
     for(let i=0;i<pixels.length;i+=4){if(check===0)row.maxEdgeError=Math.max(row.maxEdgeError,pixels[i],pixels[i+1],pixels[i+2]);else if(pixels[i]>0){row.foldedPixels++;if(row.foldExamples.length<3)row.foldExamples.push([1140+(i/4)%430,759-Math.floor(i/4/430)])}}
    }
    rows.push(row)
   }
   // Small render target, same actual shader: never reverses and never jumps
   // at the gust wrap. A 60-second sequence includes both incommensurate periods.
   const pulse=[];gl.viewport(0,0,1,1);gl.uniform1f(gl.getUniformLocation(program,'check'),2)
   for(let i=0;i<=600;i++){
    gl.uniform1f(gl.getUniformLocation(program,'time'),i/10);gl.drawArrays(gl.TRIANGLES,0,6);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixels.subarray(0,4));pulse.push(pixels[0]/255)
   }
   gl.getExtension('WEBGL_lose_context')?.loseContext();return {rows,pulse}
  },{scene:await data(`scene${mode==='light'?'-light':''}-detail`),atlas:await data(`character-${mode}`),shader:SCENE_MOTION_SHADER+CHARACTER_SHADER})
  // Error is amplified 255x before readback: 16 means < 0.063 of ONE
  // 8-bit color level, allowing UV round-trip precision, not visible fringes.
  for(const row of result.rows){assert.ok(row.maxEdgeError<=16,`${mode}: residual hair/backplate at t=${row.time}: ${row.maxEdgeError}`);assert.equal(row.foldedPixels,0,`${mode}: deformation folds at t=${row.time}: ${JSON.stringify(row.foldExamples)}`)}
  assert.ok(Math.max(...result.pulse)>.85)
  assert.ok(result.pulse.every((v,i)=>v>=0&&v<=1&&(!i||Math.abs(v-result.pulse[i-1])<.12)))
  assert.ok(result.pulse.filter(v=>v<.2).length>40,'wind has quiet intervals')
  console.log(JSON.stringify({mode,pixelComparisons:result.rows.length,maxEdgeError:Math.max(...result.rows.map(r=>r.maxEdgeError)),foldedPixels:0,continuousGustSeconds:60}))
 }
}finally{await browser.close()}
