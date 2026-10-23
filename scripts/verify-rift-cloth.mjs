import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {CLOTH_SHADER} from '../lib/rift/cloth-shader.js'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT?pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href:'playwright-core')
const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']})
try{
 const page=await browser.newPage()
 for(const mode of ['light','dark']){
  const data=async name=>'data:image/webp;base64,'+(await readFile(`src/assets/rift/${name}.webp`)).toString('base64')
  const result=await page.evaluate(async({scene,atlas,shader})=>{
   const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})
   const canvas=document.createElement('canvas');canvas.width=256;canvas.height=300
   const gl=canvas.getContext('webgl',{antialias:false,preserveDrawingBuffer:true})
   if(!gl)throw Error('WebGL unavailable')
   const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
   const program=gl.createProgram()
   gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'))
   gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`precision highp float;uniform sampler2D scene;uniform float check;${shader}
    void main(){vec2 p=vec2(1120.+gl_FragCoord.x,780.-gl_FragCoord.y),uv=p/vec2(1672.,940.);
     if(check<.5){gl_FragColor=vec4(clothPaint(uv,texture2D(scene,uv).rgb),1.);}
     else {vec2 pivot=p.y<640.?vec2(1242.,534.):vec2(1280.,665.);float angle=p.y<640.?clothAngles.x:clothAngles.y;
      vec2 q=clothSource(p,pivot,angle),dx=clothSource(p+vec2(10.,0.),pivot,angle)-q,dy=clothSource(p+vec2(0.,10.),pivot,angle)-q;
      float bad=abs(length(dx)-10.)>.005||abs(length(dy)-10.)>.005||abs(dot(dx,dy))>.03?1.:0.;gl_FragColor=vec4(bad,0.,0.,1.);}
    }`))
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program))
   gl.useProgram(program)
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
   const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0)
   for(const [unit,name,src]of[[0,'scene',scene],[1,'clothAtlas',atlas]]){
    const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture)
    for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE)
    for(const k of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR)
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,await load(src));gl.uniform1i(gl.getUniformLocation(program,name),unit)
   }
   const draw=(angles,ready=1,check=0)=>{
    gl.uniform2fv(gl.getUniformLocation(program,'clothAngles'),angles)
    gl.uniform1f(gl.getUniformLocation(program,'clothReady'),ready);gl.uniform1f(gl.getUniformLocation(program,'check'),check)
    gl.drawArrays(gl.TRIANGLES,0,6)
    const pixels=new Uint8Array(256*300*4);gl.readPixels(0,0,256,300,gl.RGBA,gl.UNSIGNED_BYTE,pixels);return pixels
   }
   const source=draw([0,0],0),rest=draw([0,0]),rows=[]
   let restChanged=0
   for(let i=0;i<rest.length;i++)if(source[i]!==rest[i])restChanged++
   for(const angles of[[.01,.005],[.065,.0625],[.13,.125]]){
    const frame=draw(angles),isometry=draw(angles,1,1),fallback=draw(angles,0)
    const row={angles,skinChanged:0,torsoChanged:0,cuffChanged:0,hemChanged:0,distorted:0,fallbackChanged:0}
    for(let i=0;i<frame.length;i+=4){
     const x=1120+(i/4)%256,y=779-Math.floor(i/4/256)
     const changed=Math.max(...[0,1,2].map(c=>Math.abs(frame[i+c]-source[i+c])))>1
     if(changed){if(y<535)row.skinChanged++;if(x>=1295)row.torsoChanged++;if(y>550&&y<620)row.cuffChanged++;if(y>650&&y<760)row.hemChanged++}
     if(isometry[i])row.distorted++
     for(let c=0;c<3;c++)if(fallback[i+c]!==source[i+c])row.fallbackChanged++
    }
    rows.push(row)
   }
   gl.getExtension('WEBGL_lose_context')?.loseContext();return {restChanged,rows}
  },{scene:await data(`scene${mode==='light'?'-light':''}-detail`),atlas:await data(`cloth-${mode}`),shader:CLOTH_SHADER})
  assert.equal(result.restChanged,0,'neutral composite exactly equals original artwork')
  for(const row of result.rows){for(const key of['skinChanged','torsoChanged','distorted','fallbackChanged'])assert.equal(row[key],0,`${mode} ${key}`);assert.ok(row.cuffChanged>100);assert.ok(row.hemChanged>100)}
  console.log(JSON.stringify({mode,restChanged:0,rows:result.rows}))
 }
}finally{await browser.close()}
