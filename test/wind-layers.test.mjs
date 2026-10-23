import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {WindLayerMotion} from '../lib/rift/wind-layer-motion.js'
import {WIND_PARTS} from '../lib/rift/wind-layer-geometry.js'
import {WIND_LAYER_SHADER} from '../lib/rift/wind-layer-shader.js'
import {WIND_LAYERS_DARK,WIND_LAYERS_LIGHT} from '../lib/rift/wind-layer-assets.js'
const read=name=>readFileSync(new URL(`../${name}`,import.meta.url),'utf8')

test('only the ahoge advances; hair, arm and clothing slots stay zero',()=>{
 const m=new WindLayerMotion(),buffer=m.angles,first=m.firstFour
 const peaks=new Float32Array(5);let previous=[0,0,0,0,0]
 for(let i=0;i<=3600;i++){
  m.advance(i/60);assert.equal(m.angles,buffer);assert.equal(m.firstFour,first)
  for(let j=0;j<5;j++){
   const a=m.angles[j],bound=Math.abs(WIND_PARTS[j].angle)
   assert.ok(Number.isFinite(a)&&Math.abs(a)<=bound*1.01)
   assert.ok(Math.abs(a-previous[j])<.003)
   peaks[j]=Math.max(peaks[j],Math.abs(a))
  }
  previous=[...m.angles]
 }
 assert.ok(peaks[0]>Math.abs(WIND_PARTS[0].angle)*.8)
 assert.deepEqual([...peaks.slice(1)],[0,0,0,0])
 for(const t of[60,NaN,-1,Infinity]){m.advance(t);assert.deepEqual([...m.angles],previous)}
 m.advance(0);assert.ok([...m.angles].every(a=>a===0))
 m.advance(1e6);assert.ok([...m.angles].every(Number.isFinite))
 assert.deepEqual([...m.angles.slice(1)],[0,0,0,0])
})
test('independent layers stay stable at idle/active renderer frame rates',()=>{
 const run=fps=>{const m=new WindLayerMotion();for(let i=0;i<=6*fps;i++)m.advance(i/fps);return m.angles}
 const reference=run(60)
 for(const fps of[18,24]){const actual=run(fps);for(let j=0;j<5;j++)assert.ok(Math.abs(actual[j]-reference[j])<.0003)}
})
test('shader pins roots and uses independent old-silhouette cleanup',()=>{
 assert.match(WIND_LAYER_SHADER,/vec2\(c\*d.x\+s\*d.y,-s\*d.x\+c\*d.y\)\+pivot/)
 assert.match(WIND_LAYER_SHADER,/windJointWeight\(q,row\)/)
 assert.match(WIND_LAYER_SHADER,/windLayerSample\(q,origin,row,1\.\)/)
 assert.match(WIND_LAYER_SHADER,/float cleanup=old.a\*smoothstep/)
 assert.match(WIND_LAYER_SHADER,/mix\(background,old.rgb,cleanup\)/)
 assert.match(WIND_LAYER_SHADER,/texture2D\(scene,q\/vec2\(1672\.,940\.\)\)/)
 assert.match(WIND_LAYER_SHADER,/if\(windLayersReady<.5\)return background/)
 assert.doesNotMatch(WIND_LAYER_SHADER,/hairWind|armSource|windRegion|sceneMotion|p\+=/)
 const renderer=read('src/rift/renderer.ts')
 assert.match(renderer,/naturalWidth===640&&layers.naturalHeight===1280/)
 assert.doesNotMatch(renderer,/cloth-motion|arm-shader|cloth-shader/)
 const paint=WIND_LAYER_SHADER.slice(WIND_LAYER_SHADER.indexOf('vec3 windLayersPaint'))
 assert.equal((paint.match(/background=windLayerPart/g)||[]).length,1)
 assert.doesNotMatch(paint,/windAngles\.[yzw]|hemAngle/)
})
test('paired generated layers are deferred, compact and absent from first paint',()=>{
 const bytes=['light','dark'].reduce((n,mode)=>n+readFileSync(new URL(`../src/assets/rift/wind-layers-${mode}.webp`,import.meta.url)).length,0)
 assert.ok(bytes<40000)
 const entry=read('lib/client.js'),server=read('lib/index.js'),decor=read('lib/client.decorations.js')
 for(const asset of[WIND_LAYERS_DARK,WIND_LAYERS_LIGHT]){
  assert.ok(decor.includes(asset));assert.ok(!entry.includes(asset));assert.ok(!server.includes(asset))
 }
 assert.ok(Buffer.byteLength(decor)<500000)
 const runtime=read('src/rift/runtime.ts')
 assert.match(runtime,/layersFailed\?undefined:layers/)
 assert.match(runtime,/layers.removeEventListener\('error',layersError\)/)
})
