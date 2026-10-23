import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {RIFT_DARK,RIFT_LIGHT,RIFT_COLORS} from '../lib/rift/palette.js'
import {canAnimate,renderSize,coverUv,sceneUv,motionEnabled,activeState,RIFT_MOTION_EVENT} from '../lib/rift/motion.js'
import {injectRiftBoot,RIFT_BOOT_ID,bootPreference} from '../lib/rift/boot.js'
import {RIFT_CSS} from '../lib/rift/styles.js'
import {installRiftScene} from '../lib/rift/runtime.js'
import {RIFT_SCENE_CSS,RIFT_SCENE_SCRIM,RIFT_LIGHT_SCENE_SCRIM} from '../lib/rift/scene-styles.js'
import {RIFT_SCENE_IMAGE,RIFT_LIGHT_SCENE_IMAGE} from '../lib/rift/assets.js'
import {RIFT_DETAIL_IMAGE,RIFT_LIGHT_DETAIL_IMAGE} from '../lib/rift/detail-assets.js'
import {RIFT_FRAGMENT} from '../lib/rift/renderer.js'
import {RIFT_MARK_IMAGE} from '../lib/rift/mark.js'

test('Rift entry contains no previous theme visuals or background rig chunks',()=>{
 const entry=readFileSync(new URL('../lib/client.js',import.meta.url),'utf8')
 const scene=readFileSync(new URL('../lib/client.decorations.js',import.meta.url),'utf8')
 const companion=readFileSync(new URL('../lib/client.companion.js',import.meta.url),'utf8')
 // Restored paired contour shards add <1 KB; keep the eager entry bounded.
 // Paired header/sidebar glass and accessibility fallbacks add ~1.5 KB CSS.
 // Original metallic finish is baked once (~12.4 KB); retain the code-only budget.
 // Picker plus independent quiet chrome and four paired palettes; no new runtime dependency.
 assert.ok(entry.length-RIFT_MARK_IMAGE.length<76000);assert.ok(scene.length<500000)
 assert.ok(companion.length<150000)
 assert.match(entry,/client\.companion\.js/)
 assert.match(companion,/逗逗嘿咻/)
 assert.doesNotMatch(entry+scene,/xiaohei-bloub-float/)
 for(const image of[RIFT_DETAIL_IMAGE,RIFT_LIGHT_DETAIL_IMAGE]){
  assert.ok(scene.includes(image));assert.ok(!entry.includes(image))
  assert.ok(!injectRiftBoot('<head></head>').includes(image),'Detail image must not inflate first paint')
 }
 assert.doesNotMatch(entry+scene,/client\.pose-|client\.rig-|xh-realm__|xiaohei-heixiu|MetallicPaint|sidebar-glass/)
 assert.match(scene,/rift-scene/);assert.match(entry,/界隙/)
})
test('Rift first paint uses static styles and a bounded local preference read, never polling',()=>{
 const html='<html><head></head><body><div id="root"></div></body></html>'
 const output=injectRiftBoot(html)
 assert.ok(output.indexOf(RIFT_BOOT_ID)<output.indexOf('</head>'));assert.equal(injectRiftBoot(output),output)
 assert.equal((output.match(/<script>/g)||[]).length,1)
 assert.doesNotMatch(output,/MutationObserver|setInterval|fetch\(/);assert.match(output,/data:image\/webp;base64/);assert.ok(output.length<250000)
})
test('Rift motion gates foreground, focus, compact view and user preferences',()=>{
 assert.equal(canAnimate(true,false,false,true,false),true)
 for(const args of [[false,false,false,true,false],[true,true,false,true,false],[true,false,true,true,false],[true,false,false,false,false],[true,false,false,true,true]])assert.equal(canAnimate(...args),false)
 assert.equal(motionEnabled({get localStorage(){throw Error('denied')}}),true)
 assert.equal(activeState('streaming'),true);assert.equal(activeState('waiting'),false);assert.equal(activeState('complete'),false)
})
test('first paint respects the official stored preference before plugins load',()=>{
 const official=preference=>`<head></head><body><script>(() => {
 const preference = "${preference}"
 document.documentElement.dataset.dsThemeSource = preference
 document.body.toggleAttribute('data-ds-dark-theme', dark)
 })()</script></body>`
 for(const mode of ['dark','light','system']){
  assert.equal(bootPreference(official(mode)),mode)
  const css=injectRiftBoot(official(mode)).split('</style>')[0]
  if(mode!=='system')assert.doesNotMatch(css,/@media\(prefers-color-scheme/)
  const initial=css.slice(css.indexOf('html{'),css.indexOf('background:'))
  assert.ok(initial.includes(`--rift-boot-image:var(--rift-boot-${mode==='light'?'light':'dark'})`))
 }
 assert.equal(bootPreference('<script>const preference = "dark"</script>'),'system')
 assert.equal(bootPreference('<script src="unrelated.js"></script>'),'system')
})
test('Rift rendering is pixel capped and maps artwork without stretching',()=>{
 for(const [w,h] of [[1440,1000],[3840,2160],[7680,4320],[800,1200]])for(const dpr of[1,1.25,2,3]){const[x,y]=renderSize(w,h,dpr);assert.ok(x<=2560);assert.ok(x*y<=3_000_000);assert.ok(Math.abs(x/y-w/h)<.01)}
 assert.deepEqual(renderSize(1920,1080),[1920,1080])
 assert.deepEqual(renderSize(1440,900,2),[2160,1350])
 assert.deepEqual(renderSize(1440,900,3),renderSize(1440,900,2))
 assert.deepEqual(renderSize(NaN,Infinity,NaN),[1,1])
 assert.deepEqual(renderSize(0,-1),[1,1])
 const[x,y,ox,oy]=coverUv(1440,1000,1672,940)
 assert.ok(x<=1&&y<=1);assert.ok(Math.abs(x+ox-1)<1e-9);assert.ok(Math.abs(y+2*oy-1)<1e-9)
 for(const [w,h] of [[1440,1000],[1920,800],[390,844]]){
  const [sx,sy,left,top]=sceneUv(w,h,1672,940)
  assert.ok(sx<=1&&sy<=1);assert.ok(Math.abs(sx+left-1)<1e-9);assert.ok(Math.abs(sy+2*top-1)<1e-9)
  assert.ok(Math.abs((w/sx)/(h/sy)-1672/940)<1e-9)
 }
})
test('Rift uses separate daylight and night artwork with matching first-paint scrims',()=>{
 const boot=injectRiftBoot('<head></head>')
 assert.ok(boot.includes(RIFT_SCENE_SCRIM));assert.ok(RIFT_SCENE_CSS.includes(RIFT_SCENE_SCRIM))
 assert.ok(boot.includes(RIFT_LIGHT_SCENE_SCRIM));assert.ok(RIFT_SCENE_CSS.includes(RIFT_LIGHT_SCENE_SCRIM))
 assert.notEqual(RIFT_SCENE_IMAGE,RIFT_LIGHT_SCENE_IMAGE)
 assert.ok(boot.includes(RIFT_LIGHT_SCENE_IMAGE));assert.match(boot,/prefers-color-scheme:light/)
 assert.match(boot,/right center\/cover/);assert.match(RIFT_SCENE_CSS,/object-fit:cover; object-position:right center/)
 assert.doesNotMatch(RIFT_SCENE_CSS,/mask-image|#e9e9e6|233 233 230/)
 assert.doesNotMatch(RIFT_FRAGMENT,/uniform vec3 base|light\?/)
 assert.match(RIFT_FRAGMENT,/faceShield/);assert.match(RIFT_FRAGMENT,/characterPaint\(uv/)
 assert.doesNotMatch(RIFT_FRAGMENT,/shardA|shardB|shardC|vec4 fragment/)
 assert.doesNotMatch(RIFT_SCENE_CSS,/243 247 244 \/ 97%/)
 assert.match(RIFT_SCENE_CSS,/background:linear-gradient\(90deg,rgb\(245 250 255 \/ 62%\)/)
 assert.doesNotMatch(RIFT_SCENE_CSS,/13 29 34 \/ 7[26]%/)
 assert.match(RIFT_SCENE_CSS,/conversation\.header'\]\) > header/)
 assert.match(RIFT_SCENE_CSS,/conversation\.composer'\]/)
})
function luminance(hex){const p=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return p[0]*.2126+p[1]*.7152+p[2]*.0722}
function contrast(a,b){const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
test('Rift paired palettes preserve readable text and primary actions',()=>{
 assert.deepEqual(Object.keys(RIFT_DARK),Object.keys(RIFT_LIGHT))
 for(const p of Object.values(RIFT_COLORS)){
  for(const fg of[p.text,p.secondary,p.muted])assert.ok(contrast(fg,p.surface)>=4.5,`${fg} on ${p.surface}`)
  assert.ok(contrast(p.accent,p.onAccent)>=4.5)
 }
})
test('Rift styles retain native footer layout, focus and draft projection',()=>{
 assert.match(RIFT_CSS,/sidebar\.footer\.action/);assert.match(RIFT_CSS,/focus-visible/);assert.match(RIFT_CSS,/data-xiaohei-draft-preview/)
 assert.doesNotMatch(RIFT_CSS,/saturate\(|cursor:\s*none|pointer-events:\s*auto/)
})
test('Rift no-WebGL fallback cancels all observers/listeners on unmount',()=>{
 const attrs=new Map(),children=[],media=[],created=[];let observers=0,frames=0,timers=0,onAttributes
 const events=()=>{const m=new Map();return{addEventListener:(k,v)=>m.set(k,v),removeEventListener:k=>m.delete(k),m}}
 const root={getAttribute:k=>attrs.get(k),toggleAttribute:(k,v)=>v?attrs.set(k,''):attrs.delete(k),removeAttribute:k=>attrs.delete(k)}
 const win={...events(),navigator:{},innerWidth:1440,innerHeight:1000,localStorage:{getItem:()=>null},performance:{now:()=>0},
  matchMedia:()=>{const m={...events(),matches:false};media.push(m);return m},
  MutationObserver:class{constructor(callback){onAttributes=callback}observe(){observers++}disconnect(){observers--}},
  requestAnimationFrame(){frames++;return frames},cancelAnimationFrame(){},setTimeout(){timers++;return timers},clearTimeout(){}}
 function element(){return{...events(),dataset:{},setAttribute(){},append(){},getContext:()=>null,complete:true,naturalWidth:1672,naturalHeight:940,remove(){const i=children.indexOf(this);if(i>=0)children.splice(i,1)}}}
 const doc={...events(),defaultView:win,documentElement:root,hidden:false,hasFocus:()=>true,createElement:()=>{const el=element();created.push(el);return el},body:{prepend:el=>children.push(el)}}
 const dispose=installRiftScene(doc);assert.equal(children.length,1);assert.equal(children[0].dataset.renderer,'static');assert.equal(frames,0);assert.equal(timers,0)
 assert.equal(attrs.has('data-rift-paused'),false,'WebGL fallback must retain lightweight UI interaction')
 assert.equal(created[1].src,RIFT_DETAIL_IMAGE)
 attrs.set('data-xiaohei-appearance','light');onAttributes();assert.equal(created[1].src,RIFT_LIGHT_DETAIL_IMAGE)
 assert.equal(children[0].dataset.appearance,'light');assert.equal(children.length,1)
 attrs.set('data-xiaohei-appearance','dark');onAttributes();assert.equal(created[1].src,RIFT_DETAIL_IMAGE)
 created[1].complete=false;onAttributes();assert.equal(children[0].dataset.artwork,'loading')
 created[1].complete=true;created[1].naturalWidth=0;onAttributes();assert.equal(children[0].dataset.artwork,'loading')
 created[1].naturalWidth=1672;onAttributes();assert.equal(children[0].dataset.artwork,'ready')
 win.m.get(RIFT_MOTION_EVENT)({detail:false});assert.equal(children[0].dataset.motion,'paused')
 assert.equal(attrs.has('data-rift-paused'),true,'explicit pause still disables feedback')
 dispose();assert.equal(children.length,0);assert.equal(observers,0);assert.equal(win.m.size,0);assert.equal(doc.m.size,0);for(const m of media)assert.equal(m.m.size,0)
})
test('scene sampling retains high precision when available with a WebGL 1 fallback',()=>{
 assert.match(RIFT_FRAGMENT,/#ifdef GL_FRAGMENT_PRECISION_HIGH\s+precision highp float;\s+#else\s+precision mediump float;/)
 assert.match(RIFT_SCENE_CSS,/data-artwork='loading'\] \{ visibility:hidden/)
})
