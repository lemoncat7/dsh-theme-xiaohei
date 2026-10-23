import assert from 'node:assert/strict'
import {readFile,mkdir} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {WIND_LAYER_SHADER} from '../lib/rift/wind-layer-shader.js'
import {WindLayerMotion} from '../lib/rift/wind-layer-motion.js'
const {chromium}=await import(process.env.XIAOHEI_PLAYWRIGHT?pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href:'playwright-core')
const out='output/wind-layers-v1/review';await mkdir(out,{recursive:true})
const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']})
try{
 const page=await browser.newPage({viewport:{width:1672,height:940},deviceScaleFactor:1})
 for(const mode of ['light','dark']){
  const data=async name=>'data:image/webp;base64,'+(await readFile(`src/assets/rift/${name}.webp`)).toString('base64')
  await page.setContent('<style>body{margin:0}canvas{display:block}</style><canvas width="1672" height="940"></canvas>')
  await page.evaluate(async({scene,atlas,shader})=>{
   window.originalPixels=null
   const load=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})
   const gl=document.querySelector('canvas').getContext('webgl',{antialias:false,preserveDrawingBuffer:true})
   if(!gl)throw Error('WebGL unavailable')
   const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
   const program=gl.createProgram()
   gl.attachShader(program,compile(gl.VERTEX_SHADER,'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'))
   gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`precision highp float;uniform sampler2D scene;${shader}
    void main(){vec2 uv=vec2(gl_FragCoord.x,940.-gl_FragCoord.y)/vec2(1672.,940.);gl_FragColor=vec4(windLayersPaint(uv,texture2D(scene,uv).rgb),1.);}`))
   gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program))
   gl.useProgram(program)
   const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW)
   const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0)
   let atlasPixels
   for(const [unit,name,src]of[[0,'scene',scene],[1,'windLayerAtlas',atlas]]){
    const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture)
    for(const k of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,k,gl.CLAMP_TO_EDGE)
    for(const k of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,k,gl.LINEAR)
    const im=await load(src)
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.uniform1i(gl.getUniformLocation(program,name),unit)
    if(unit===1){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);atlasPixels=ctx.getImageData(0,0,c.width,c.height).data}
   }
   window.drawLayers=(angles,ready=1)=>{
    gl.uniform4fv(gl.getUniformLocation(program,'windAngles'),angles.slice(0,4));gl.uniform1f(gl.getUniformLocation(program,'hemAngle'),angles[4]);gl.uniform1f(gl.getUniformLocation(program,'windLayersReady'),ready)
    gl.drawArrays(gl.TRIANGLES,0,6)
    const pixels=new Uint8Array(1672*940*4);gl.readPixels(0,0,1672,940,gl.RGBA,gl.UNSIGNED_BYTE,pixels)
    if(!window.originalPixels)window.originalPixels=pixels
    const original=window.originalPixels
    let pinnedChanged=0,rootChanged=0,staticChanged=0,changed=0;const examples=[]
    for(let y=0;y<940;y++)for(let x=0;x<1672;x++){
     const i=((939-y)*1672+x)*4
     if(Math.max(...[0,1,2].map(c=>Math.abs(pixels[i+c]-original[i+c])))>1){
      changed++
      if(x<1320||x>1460||y<155||y>248)staticChanged++
      if((x>=1398&&x<=1420&&y>=239&&y<=245)||(x>=1200&&x<=1225&&y>=295&&y<=305)||(x>=1440&&x<=1490&&y>=391&&y<=399))rootChanged++
      if((x>=1255&&x<=1400&&y>=350&&y<=440)||(x>=1320&&x<=1410&&y>=530&&y<=660)||x<1020){pinnedChanged++;if(examples.length<5)examples.push([x,y])}
     }
    }
    // At full arm travel, original finger ink must be replaced by the repair
    // plate, not left behind as a translucent duplicate at the old position.
    let vacatedHand=0,ghostPixels=0
    if(Math.abs(angles[3])>=.021&&ready){
     for(let y=426;y<531;y++)for(let x=1066;x<1173;x++){
      const px=x+.5,py=y+.5,dX=px-1284,dY=py-475,a=angles[3]
      const qx=Math.cos(a)*dX+Math.sin(a)*dY+1284,qy=-Math.sin(a)*dX+Math.cos(a)*dY+475
      const oi=((y-400+3*256)*640+x-1030)*4
      if(atlasPixels[oi+3]<255)continue
      let moved=0
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
       const mx=Math.floor(qx)-1030+dx,my=Math.floor(qy)-400+dy
       if(mx>=0&&mx<320&&my>=0&&my<256)moved=Math.max(moved,atlasPixels[((my+3*256)*640+320+mx)*4+3])
      }
      if(moved>0)continue
      const pi=((939-y)*1672+x)*4
      if(Math.max(...[0,1,2].map(c=>Math.abs(original[pi+c]-atlasPixels[oi+c])))<12)continue
      vacatedHand++
      if(Math.max(...[0,1,2].map(c=>Math.abs(pixels[pi+c]-atlasPixels[oi+c])))>3)ghostPixels++
     }
    }
    return {pinnedChanged,rootChanged,staticChanged,changed,examples,vacatedHand,ghostPixels}
   }
  },{scene:await data(`scene${mode==='light'?'-light':''}-detail`),atlas:await data(`wind-layers-${mode}`),shader:WIND_LAYER_SHADER})
  assert.equal((await page.evaluate(()=>window.drawLayers([0,0,0,0,0],0))).changed,0)
  assert.equal((await page.evaluate(()=>window.drawLayers([0,0,0,0,0]))).changed,0,'rest frame preserves exact source')
  const motion=new WindLayerMotion(),rows=[]
  for(let frame=0;frame<=216;frame++){
   motion.advance(frame/24)
   if(frame%12===0){
    const row=await page.evaluate(a=>window.drawLayers(a),[...motion.angles]);rows.push(row)
    await page.screenshot({path:`${out}/${mode}-${frame}.png`,clip:{x:1030,y:155,width:530,height:635}})
    assert.equal(row.pinnedChanged,0,`${mode} face/torso changes at ${frame}: ${JSON.stringify(row.examples)}`)
    assert.equal(row.rootChanged,0,`${mode} hair roots drift at ${frame}`)
    assert.equal(row.staticChanged,0,`${mode} only ahoge may move`)
   }
  }
  assert.ok(rows.some(row=>row.changed>50),'ahoge actually moves')
  for(const direction of [-1,1]){
   const row=await page.evaluate(a=>window.drawLayers(a),[.12,.07,-.085,.022,.105].map(a=>a*direction))
   assert.equal(row.rootChanged,0,'all hair attachments stay fixed at both extremes')
   assert.equal(row.pinnedChanged,0,'face/torso unchanged at both extremes')
   assert.equal(row.staticChanged,0,'disabled layers stay unchanged even with nonzero uniforms')
   await page.screenshot({path:`${out}/${mode}-extreme-${direction}.png`,clip:{x:1030,y:155,width:530,height:635}})
  }
  assert.equal((await page.evaluate(()=>window.drawLayers([.12,-.07,-.085,.022,.105],0))).changed,0,'missing atlas gives unchanged wallpaper')
  console.log(JSON.stringify({mode,frames:rows.length,pinnedChanged:0,maxChanged:Math.max(...rows.map(r=>r.changed))}))
 }
}finally{await browser.close()}
