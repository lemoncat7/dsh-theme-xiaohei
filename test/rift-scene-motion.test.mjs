import test from 'node:test'
import assert from 'node:assert/strict'
import {CHARACTER_SHADER} from '../lib/rift/character-shader.js'
import {SCENE_MOTION_SHADER} from '../lib/rift/scene-motion.js'
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
 for(const region of ['farLeft','farRight','nearBase','slab','satellite','hand','sleeve','hem'])assert.match(SCENE_MOTION_SHADER,new RegExp('float '+region+'='))
 assert.match(SCENE_MOTION_SHADER,/return uv\+drift\/vec2\(1672\.,940\.\)/)
 assert.doesNotMatch(SCENE_MOTION_SHADER,/fract\(|mod\(|texture2D|sampler2D/)
})
const luminance=rgb=>rgb.map(n=>{const v=n/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0)
test('daylight gradient left edge retains AA contrast even over black art',()=>{
 const bg=luminance([249,252,249].map(v=>v*.62))
 for(const text of [[36,40,50],[36,52,46]])assert.ok((bg+.05)/(luminance(text)+.05)>=4.5)
 assert.match(RIFT_SCENE_CSS,/--rift-muted:#24342e/)
 assert.match(RIFT_SCENE_CSS,/249 252 249 \/ 62%/)
 assert.doesNotMatch(RIFT_SCENE_CSS,/backdrop-filter/)
})
test('daylight bubbles fade the paint, not the text, with an increased-contrast fallback',()=>{
 for(const gradient of [RIFT_LIGHT_BUBBLE,RIFT_LIGHT_USER_BUBBLE]){
  assert.match(gradient,/^linear-gradient\(90deg/)
  assert.match(gradient,/\/ 0%\) 100%\)$/)
 }
 assert.match(RIFT_SCENE_CSS,/prefers-contrast:more/)
 assert.match(RIFT_SCENE_CSS,/249 252 249 \/ 94%/)
 assert.match(RIFT_SCENE_CSS,/paint-order:stroke fill/)
 assert.doesNotMatch(RIFT_SCENE_CSS,/mask-image/)
})
test('float and sway are visibly stronger without changing the eye rig',()=>{
 assert.match(SCENE_MOTION_SHADER,/sin\(t\*\.52\)\*12\.0/)
 assert.match(SCENE_MOTION_SHADER,/sin\(t\*\.72\)\*4\.8/)
 assert.match(SCENE_MOTION_SHADER,/sin\(t\*\.92\+p.y\*\.012\)\*8\.5/)
 assert.match(CHARACTER_SHADER,/gaze\*\.65\*aperture/)
})
