import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {ClothMotion} from '../lib/rift/cloth-motion.js'
import {windPressure} from '../lib/rift/wind.js'
import {CLOTH_SHADER} from '../lib/rift/cloth-shader.js'
import {CLOTH_DARK,CLOTH_LIGHT} from '../lib/rift/cloth-assets.js'

test('wind pressure is directional, continuous and has calm intervals',()=>{
 assert.equal(windPressure(0),0);assert.equal(windPressure(-2),0)
 let calm=0
 for(let i=0;i<1200;i++){
  const p=windPressure(i/20);assert.ok(p>=0&&p<=1)
  if(p<.2)calm++
  if(i)assert.ok(Math.abs(p-windPressure((i-1)/20))<.06)
 }
 assert.ok(calm>80)
 for(const boundary of[9.7,15.3,19.4,30.6])assert.ok(Math.abs(windPressure(boundary-1e-5)-windPressure(boundary+1e-5))<.0001)
})
test('cloth joints have inertia, bounded angles and stationary repeated frames',()=>{
 const motion=new ClothMotion(),angles=motion.angles
 let previous=[0,0],different=false
 for(let frame=0;frame<=3600;frame++){
  motion.advance(frame/60)
  assert.equal(motion.angles,angles,'reuse one uniform buffer')
  for(const[j,a]of [...angles].entries()){
   assert.ok(a>=-.0001&&a<.135)
   assert.ok(Math.abs(a-previous[j])<.003,'no snapped fabric')
  }
  if(frame===60)assert.ok(angles[0]<.13*windPressure(1-.3),'cuff lags force onset')
  different ||= Math.abs(angles[0]/.13-angles[1]/.125)>.1
  previous=[...angles]
 }
 assert.ok(different,'cuff and hem do not march together')
 motion.advance(60);assert.deepEqual([...angles],previous)
 motion.advance(NaN);motion.advance(-1);assert.deepEqual([...angles],previous)
 motion.advance(0);assert.deepEqual([...angles],[0,0])
 motion.advance(100000);assert.ok([...angles].every(Number.isFinite),'bounded seek/recreation')
})
test('cloth is stable at idle and active render rates',()=>{
 const run=fps=>{const m=new ClothMotion();for(let i=0;i<=6*fps;i++)m.advance(i/fps);return [...m.angles,m.armAngle]}
 const idle=run(18),active=run(24),reference=run(60)
 for(let i=0;i<3;i++){assert.ok(Math.abs(idle[i]-reference[i])<.0003);assert.ok(Math.abs(active[i]-reference[i])<.0003)}
})
test('arm follows fabric gently and shares pause/reset behaviour',()=>{
 const m=new ClothMotion();let previous=0,maximum=0,peakCuff=0,peakHem=0
 for(let frame=0;frame<=3600;frame++){
  m.advance(frame/60)
  assert.ok(m.armAngle>=0&&m.armAngle<=.0181)
  assert.ok(Math.abs(m.armAngle-previous)<.0004)
  maximum=Math.max(maximum,m.armAngle);previous=m.armAngle
  peakCuff=Math.max(peakCuff,m.angles[0]);peakHem=Math.max(peakHem,m.angles[1])
 }
 assert.ok(maximum>.015,'gentle but visible arm movement')
 assert.ok(peakCuff>.12&&peakHem>.115,'fabric travels visibly farther than previous rig')
 m.advance(60);assert.equal(m.armAngle,previous)
 m.advance(NaN);assert.equal(m.armAngle,previous)
 m.advance(0);assert.equal(m.armAngle,0)
})
test('old arm/source displacement is superseded by independent generated layers',()=>{
 const renderer=readFileSync(new URL('../src/rift/renderer.ts',import.meta.url),'utf8')
 assert.doesNotMatch(renderer,/armSource\(|hairWind\(|clothPaint\(/)
 assert.match(renderer,/windLayersPaint\(uv,color\)/)
})
test('cloth layers preserve original ink and do not introduce source displacement fields',()=>{
 assert.match(CLOTH_SHADER,/cos\(angle\)\*relative.x\+sin\(angle\)\*relative.y/)
 assert.match(CLOTH_SHADER,/texture2D\(scene,q\/vec2\(1672\.,940\.\)\)/)
 assert.match(CLOTH_SHADER,/background\*\(1\.-max\(old.a,moved.a\)\)/)
 assert.doesNotMatch(CLOTH_SHADER,/sceneMotion|hairWind|windRegion|p\+=|scale\(/)
 assert.match(CLOTH_SHADER,/if\(clothReady<.5\)return background/)
})
test('legacy cloth atlas is no longer bundled with the deployed artwork',()=>{
 const files=['dark','light'].map(mode=>readFileSync(new URL(`../src/assets/rift/cloth-${mode}.webp`,import.meta.url)))
 assert.ok(files.reduce((n,b)=>n+b.length,0)<32000)
 const entry=readFileSync(new URL('../lib/client.js',import.meta.url),'utf8')
 const server=readFileSync(new URL('../lib/index.js',import.meta.url),'utf8')
 const decor=readFileSync(new URL('../lib/client.decorations.js',import.meta.url),'utf8')
 for(const asset of[CLOTH_LIGHT,CLOTH_DARK]){assert.ok(!decor.includes(asset));assert.ok(!entry.includes(asset));assert.ok(!server.includes(asset))}
 const runtime=readFileSync(new URL('../src/rift/runtime.ts',import.meta.url),'utf8')
 assert.match(runtime,/layersFailed\?undefined:layers/)
 assert.match(runtime,/layers.removeEventListener\('error',layersError\)/)
})
