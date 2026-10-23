import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
import {ARM_SHADER} from '../lib/rift/arm-shader.js'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT?pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href:'playwright-core')
const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']})
try{
 const page=await browser.newPage()
 const result=await page.evaluate(shader=>{
  const canvas=document.createElement('canvas');canvas.width=1672;canvas.height=940
  const gl=canvas.getContext('webgl',{antialias:false,preserveDrawingBuffer:true})
  if(!gl)throw Error('WebGL unavailable')
  const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
  const program=gl.createProgram()
  gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'))
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`precision highp float;${shader}
   vec2 source(vec2 p){return armSource(p/vec2(1672.,940.))*vec2(1672.,940.);}
   void main(){vec2 p=vec2(gl_FragCoord.x,940.-gl_FragCoord.y),q=source(p);
    vec2 dx=source(p+vec2(1.,0.))-q,dy=source(p+vec2(0.,1.))-q;
    float det=dx.x*dy.y-dx.y*dy.x;
    float folded=det<.8||det>1.2?1.:0.;
    float distorted=abs(length(dx)-1.)>.002||abs(length(dy)-1.)>.002||abs(dot(dx,dy))>.002?1.:0.;
    gl_FragColor=vec4(folded,min(length(q-p)/8.,1.),distorted,1.);
   }`))
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program))
  gl.useProgram(program)
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
  const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0)
  const rows=[]
  for(const angle of[0,.0045,.009,.018]){
   gl.uniform1f(gl.getUniformLocation(program,'armAngle'),angle);gl.drawArrays(gl.TRIANGLES,0,6)
   const pixels=new Uint8Array(1672*940*4);gl.readPixels(0,0,1672,940,gl.RGBA,gl.UNSIGNED_BYTE,pixels)
   const at=(x,y)=>pixels.slice(((939-y)*1672+x)*4,((939-y)*1672+x)*4+4)
   let folded=0,pinnedMoved=0;const examples=[]
   for(let i=0;i<pixels.length;i+=4)if(pixels[i]){folded++;if(examples.length<5)examples.push([(i/4)%1672,939-Math.floor(i/4/1672)])}
   for(let x=1255;x<1445;x+=10)for(let y=350;y<450;y+=10)if(at(x,y)[1])pinnedMoved++
   for(let x=1300;x<1450;x+=10)for(let y=500;y<780;y+=10)if(at(x,y)[1])pinnedMoved++
   const hand=[[1138,434],[1082,480],[1140,478],[1215,510]].map(([x,y])=>Array.from(at(x,y)))
   rows.push({angle,folded,pinnedMoved,hand,examples})
  }
  gl.getExtension('WEBGL_lose_context')?.loseContext();return rows
 },ARM_SHADER)
 for(const row of result){
  assert.equal(row.folded,0,'no folded/inverted or stretched transition pixels')
  assert.equal(row.pinnedMoved,0,'face and torso remain stationary')
  for(const hand of row.hand){assert.equal(hand[2],0,'fingers/palm/forearm remain rigid');if(row.angle===.018)assert.ok(hand[1]>35,'arm moves visibly at crest')}
 }
 console.log(JSON.stringify({armShader:true,rows:result}))
}finally{await browser.close()}
