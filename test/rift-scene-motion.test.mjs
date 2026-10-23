import test from 'node:test'
import assert from 'node:assert/strict'
import {CHARACTER_SHADER} from '../lib/rift/character-shader.js'
import {SCENE_MOTION_SHADER} from '../lib/rift/scene-motion.js'
import {WIND_SHADER} from '../lib/rift/wind.js'
import {RIFT_FRAGMENT} from '../lib/rift/renderer.js'
import {RIFT_SCENE_CSS,RIFT_LIGHT_BUBBLE,RIFT_LIGHT_USER_BUBBLE} from '../lib/rift/scene-styles.js'

test('eye tracking samples the original face continuously, never an extracted iris',()=>{
 assert.doesNotMatch(CHARACTER_SHADER,/vec4 iris|iris\.rgb|p-gaze,3/)
 assert.match(CHARACTER_SHADER,/eyePoint=p-gaze\*\.65\*aperture\*\(1\.-pose.y\)/)
 assert.match(CHARACTER_SHADER,/open.rgb=texture2D\(scene/)
 assert.match(CHARACTER_SHADER,/smoothstep\(\.05,\.9,characterLayer\(p,3\.\).a\)/)
 assert.match(CHARACTER_SHADER,/\(bounded.y\+row\)\/4\./)
})
test('scenery motion is continuous, source-scaled and confined to existing art',()=>{
 assert.match(SCENE_MOTION_SHADER,/1\.-smoothstep\(\.62,1\./)
 for(const region of ['farLeft','farRight','slab','satellite','shirt','hemPin'])assert.match(SCENE_MOTION_SHADER,new RegExp('float '+region+'='))
 assert.doesNotMatch(SCENE_MOTION_SHADER,/nearBase/)
 assert.match(SCENE_MOTION_SHADER,/570\.,650\.,p.y/)
 assert.match(SCENE_MOTION_SHADER,/return uv\+drift\/vec2\(1672\.,940\.\)/)
 assert.doesNotMatch(SCENE_MOTION_SHADER,/texture2D|sampler2D/)
})
const luminance=rgb=>rgb.map(n=>{const v=n/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)
test('daylight gradient left edge retains AA contrast even over black art',()=>{
 const bg=luminance([245,250,255].map(v=>v*.62))
 for(const text of [[36,40,50],[36,50,71]])assert.ok((bg+.05)/(luminance(text)+.05)>=4.5)
 assert.match(RIFT_SCENE_CSS,/--rift-muted:#243247/)
 assert.match(RIFT_SCENE_CSS,/245 250 255 \/ 62%/)
 assert.doesNotMatch(RIFT_SCENE_CSS,/backdrop-filter/)
})
test('daylight bubbles fade the paint, not the text, with an increased-contrast fallback',()=>{
 for(const gradient of [RIFT_LIGHT_BUBBLE,RIFT_LIGHT_USER_BUBBLE]){
  assert.match(gradient,/^linear-gradient\(90deg/)
  assert.match(gradient,/\/ 0%\) 100%\)$/)
 }
 assert.match(RIFT_SCENE_CSS,/prefers-contrast:more/)
 assert.match(RIFT_SCENE_CSS,/245 250 255 \/ 94%/)
 assert.match(RIFT_SCENE_CSS,/paint-order:stroke fill/)
 assert.doesNotMatch(RIFT_SCENE_CSS,/mask-image/)
})
test('fabric retains original outlines, including loose tips and scenery overlap',()=>{
 assert.doesNotMatch(SCENE_MOTION_SHADER,/sin\(t\*\.52\)\*12\.0/)
 assert.doesNotMatch(SCENE_MOTION_SHADER,/float hand=|drift\+=hand/)
 assert.match(SCENE_MOTION_SHADER,/drift\*=1\.-max\(max\(arms,body\),max\(shirt,hemPin\)\)/)
 assert.doesNotMatch(SCENE_MOTION_SHADER,/cuffWind|hemWind|drift\+=sleeve|drift\+=hem/)
 assert.doesNotMatch(SCENE_MOTION_SHADER,/vec2\(190\.,97\.\)/)
 assert.match(CHARACTER_SHADER,/gaze\*\.65\*aperture/)
})
test('generated layers replace the legacy hair warp without moving the body',()=>{
 assert.match(WIND_SHADER,/smoothstep\(0\.,\.16,phase\)\*\(1\.-smoothstep\(\.23,\.88,phase\)\)/)
 assert.doesNotMatch(CHARACTER_SHADER,/p\+=hairWind/)
 assert.match(RIFT_FRAGMENT,/sceneMotion\(uv,time\)/)
 assert.match(RIFT_FRAGMENT,/characterPaint\(uv,color/)
 assert.match(RIFT_FRAGMENT,/windLayersPaint\(uv,color\)/)
 assert.doesNotMatch(RIFT_FRAGMENT.slice(RIFT_FRAGMENT.indexOf('void main()')),/hairWind|armSource|windUv/)
 assert.match(CHARACTER_SHADER,/max\(oldMask-open.a,0\.\)/)
 assert.match(WIND_SHADER,/vec2\(breeze\*10\.0,breeze\*2\.8\+flutter\)/)
 assert.equal(RIFT_FRAGMENT.split('float windPulse(').length,2)
 assert.ok(RIFT_FRAGMENT.indexOf('vec2 hairWind(')<RIFT_FRAGMENT.indexOf('vec3 characterPaint('))
 assert.doesNotMatch(WIND_SHADER,/sampler2D|texture2D/)
})
test('conversation header paints a translucent paired palette on the real native element',()=>{
 assert.match(RIFT_SCENE_CSS,/data-chain-overlay-fallback='conversation.header'/)
 assert.match(RIFT_SCENE_CSS,/> header \{\n background:var\(--rift-header\) !important/)
 assert.match(RIFT_SCENE_CSS,/rgb\(233 244 255 \/ 80%\)/)
 assert.match(RIFT_SCENE_CSS,/rgb\(22 34 51 \/ 68%\)/)
 assert.doesNotMatch(RIFT_SCENE_CSS,/header \{ background:var\(--rift-panel\)/)
})
