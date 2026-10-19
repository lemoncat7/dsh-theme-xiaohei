import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
import {SCENE_MOTION_SHADER} from '../lib/rift/scene-motion.js'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT
 ? pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href : 'playwright-core')
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']})
try{
 const page=await browser.newPage()
 const result=await page.evaluate(shader=>{
  const canvas=document.createElement('canvas');canvas.width=1672;canvas.height=940
  const gl=canvas.getContext('webgl',{antialias:false,preserveDrawingBuffer:true})
  if(!gl)throw Error('WebGL unavailable')
  const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
  const program=gl.createProgram()
  gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'))
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`precision highp float;uniform float time;${shader}\nvoid main(){vec2 uv=vec2(gl_FragCoord.x,940.-gl_FragCoord.y)/vec2(1672.,940.);vec2 delta=abs(sceneMotion(uv,time)-uv)*vec2(1672.,940.);gl_FragColor=vec4(delta/16.,0.,1.);}`))
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program))
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
  const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0)
  const points={thumb:[1138,434],fingers:[1082,480],palm:[1140,478],forearm:[1215,510],otherArm:[1475,674],chest:[1330,580],waist:[1300,670],pelvis:[1350,740],leftLeg:[1230,800],rightLeg:[1410,810],attachment:[1212,707],cuff:[1210,585],hem:[1170,714],building:[1550,870]}
  // Sample a torso/waist grid, not just one anchor that could conceal twisting.
  for(let x=1250;x<=1410;x+=20)for(let y=540;y<=680;y+=20)points[`body-${x}-${y}`]=[x,y]
  const rows=[]
  for(const t of [0,1,3,7,12]){
   gl.uniform1f(gl.getUniformLocation(program,'time'),t);gl.drawArrays(gl.TRIANGLES,0,6)
   const row={time:t}
   for(const[name,[x,y]]of Object.entries(points)){const pixel=new Uint8Array(4);gl.readPixels(x,939-y,1,1,gl.RGBA,gl.UNSIGNED_BYTE,pixel);row[name]=pixel[0]+pixel[1]}
   rows.push(row)
  }
  gl.getExtension('WEBGL_lose_context')?.loseContext();return rows
 },SCENE_MOTION_SHADER)
 for(const row of result)for(const name of Object.keys(row).filter(name=>!['time','cuff','hem','building'].includes(name)))assert.equal(row[name],0,`${name} moved at t=${row.time}`)
 for(const name of ['cuff','hem','building'])assert.ok(result.some(row=>row[name]>5),`${name} should still move`)
 console.log('PASS: actual WebGL shader pins torso/waist grid, pelvis, legs, arms and cloth attachment; only free cuff/hem tips and buildings move')
}finally{await browser.close()}
