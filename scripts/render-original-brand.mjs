// Bake the OLD theme's actual fixed-time MetallicPaint result, not a redesigned logo.
// Run explicitly when the original shader/source changes; normal builds use the checked-in image.
import {readFile,writeFile,mkdir} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {pathToFileURL} from 'node:url'
const source=await readFile('src/metallic-brand-mark.tsx','utf8')
const texture=await readFile('src/assets/identity/xiaohei-brand-head-v2.webp')
const vertex=source.match(/const VERTEX_SHADER = `([\s\S]*?)`/)?.[1]
const fragment=source.match(/const FRAGMENT_SHADER = `([\s\S]*?)`/)?.[1]
const scalars=Object.fromEntries([...source.matchAll(/gl\.uniform1f\(uniforms\.(\w+), ([\d.\-]+)\)/g)].map(m=>[m[1],Number(m[2])]))
scalars.u_time=Number(source.match(/const metallicTime = (\d+)/)?.[1])
const colors=Object.fromEntries([...source.matchAll(/setRgb\(gl, uniforms\.(\w+), \[([^\]]+)\]\)/g)].map(m=>[m[1],m[2].split(',').map(Number)]))
assert.ok(vertex&&fragment&&Number.isFinite(scalars.u_time)&&Object.keys(scalars).length===18)
assert.equal(Object.keys(colors).length,3)
const {chromium}=await import(pathToFileURL(process.env.XIAOHEI_PLAYWRIGHT).href)
const browser=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader']})
try{
 const page=await browser.newPage({viewport:{width:680,height:320}})
 const result=await page.evaluate(async({vertex,fragment,scalars,colors,texture})=>{
  const size=256,c=document.createElement('canvas');c.width=c.height=size
  const gl=c.getContext('webgl2',{alpha:true,antialias:false,premultipliedAlpha:true})
  if(!gl)throw Error('WebGL2 required for offline original-material bake')
  const compile=(type,code)=>{const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));return shader}
  const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(p)
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p))
  gl.useProgram(p);gl.viewport(0,0,size,size)
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW)
  const a=gl.getAttribLocation(p,'a_position');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0)
  for(const [k,v]of Object.entries(scalars))gl.uniform1f(gl.getUniformLocation(p,k),v)
  for(const [k,v]of Object.entries(colors))gl.uniform3f(gl.getUniformLocation(p,k),...v)
  const image=new Image();image.src=texture;await image.decode()
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,gl.createTexture())
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image)
  gl.uniform1i(gl.getUniformLocation(p,'u_tex'),0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4)
  // Exact ready-state layer opacities from the original sidebar stylesheet.
  const composite=document.createElement('canvas');composite.width=composite.height=size
  const ctx=composite.getContext('2d');ctx.globalAlpha=.28;ctx.drawImage(image,0,0,size,size);ctx.globalAlpha=.92;ctx.drawImage(c,0,0)
  const result=composite.toDataURL('image/webp',.97)
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  return result
 },{vertex,fragment,scalars,colors,texture:'data:image/webp;base64,'+texture.toString('base64')})
 assert.ok(result.startsWith('data:image/webp;base64,'))
 const output=Buffer.from(result.split(',')[1],'base64');assert.ok(output.length<20_000)
 await writeFile('src/assets/identity/xiaohei-brand-metallic.webp',output)
 const sha256=data=>createHash('sha256').update(data).digest('hex')
 await writeFile('src/assets/identity/xiaohei-brand-metallic.json',JSON.stringify({sourceSha256:sha256(source),textureSha256:sha256(texture),outputSha256:sha256(output),size:256,time:scalars.u_time,composite:[.28,.92]},null,2)+'\n')
 await mkdir('/tmp/rift-metal-review',{recursive:true})
 await page.setContent(`<body style="margin:0;display:flex;font:14px system-ui">${['#e9eff7','#172333'].map(bg=>`<section style="background:${bg};padding:24px;display:flex;align-items:center;gap:20px"><img width="38" height="38" src="${result}"><img width="60" height="60" src="${result}"><img width="160" height="160" src="${result}"></section>`).join('')}</body>`)
 await page.screenshot({path:'/tmp/rift-metal-review/original-material.png'})
 console.log(`Baked original material: 256px, ${output.length} bytes; original shader, time and compositing preserved`)
}finally{await browser.close()}
