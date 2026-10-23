import { RIFT_DETAIL_IMAGE, RIFT_LIGHT_DETAIL_IMAGE } from './detail-assets.js'
import { activeState, canAnimate, motionEnabled, RIFT_MOTION_EVENT, RIFT_MOTION_KEY } from './motion.js'
import { createRiftRenderer, type RiftRenderer, type RiftEffects } from './renderer.js'
import { RIFT_SIGNAL } from './interaction.js'
import { installSpiritInput } from './spirit-input.js'
import { watchSpiritStage } from './stage.js'
import type { SpiritStage } from './stage.js'
import { CHARACTER_DARK, CHARACTER_LIGHT } from './character-assets.js'
import { WIND_LAYERS_DARK, WIND_LAYERS_LIGHT } from './wind-layer-assets.js'
import { CharacterMotion, characterNear, scenePoint } from './character.js'
import { PointerDust } from './dust.js'

/** Decor-only renderer, with bounded frame rate and fully cancellable lifecycle. */
export function installRiftScene(doc:Document):()=>void {
  const win=doc.defaultView;if(!win)return()=>{}
  const root=doc.documentElement,host=doc.createElement('div'),image=doc.createElement('img'),canvas=doc.createElement('canvas')
  host.className='rift-scene';host.setAttribute('aria-hidden','true');host.dataset.renderer='static';host.dataset.artwork='loading'
  image.alt='';image.decoding='async';image.width=1672;image.height=940
  const atlas=doc.createElement('img');atlas.decoding='async';atlas.alt=''
  const layers=doc.createElement('img');layers.decoding='async';layers.alt=''
  let layersFailed=false
  const signature=doc.createElement('div');signature.className='rift-signature'
  const title=doc.createElement('strong');title.textContent='界 隙';const subtitle=doc.createElement('span');subtitle.textContent='XIAOHEI / BETWEEN WORLDS'
  signature.append(title,subtitle);host.append(image,canvas,signature);doc.body.prepend(host)
  const reduced=win.matchMedia('(prefers-reduced-motion: reduce)'),compact=win.matchMedia('(max-width: 760px)'),forced=win.matchMedia('(forced-colors: active)')
  let enabled=motionEnabled(win),focused=doc.hasFocus(),disposed=false,lost=false
  let timer=0,frame=0,time=0,previous=0,pulse=0,energy=0,renderer:RiftRenderer|undefined
  let scroll=0,gather=0,targetScroll=0,targetGather=0
  let bounds:SpiritStage=[0,win.innerWidth,0,win.innerHeight]
  const character=new CharacterMotion(),dust=new PointerDust()
  const effects:RiftEffects={character:character.pose,dust}
  let state=root.getAttribute('data-xiaohei-state')||'idle'
  let appearance=root.getAttribute('data-xiaohei-appearance')==='light'?'light':'dark'
  const saveData=(win.navigator as Navigator&{connection?:{saveData?:boolean}}).connection?.saveData===true
  const allowed=()=>!disposed&&!lost&&!forced.matches&&!saveData&&canAnimate(enabled,reduced.matches,doc.hidden,focused,compact.matches)
  const stop=()=>{win.clearTimeout(timer);win.cancelAnimationFrame(frame);timer=0;frame=0}
  const paint=()=>renderer?.paint(time,energy,pulse,scroll,gather,effects)
  const stage=watchSpiritStage(doc,next=>{bounds=next})
  const disposeInput=installSpiritInput(doc,()=>allowed()&&!!renderer,(nextScroll,nextGather,x,y,_kick,moving,background)=>{
    targetScroll=nextScroll;targetGather=nextGather
    if(x<-900){character.leave();return}
    if(moving){
      const point=scenePoint(x,y,win.innerWidth,win.innerHeight);character.pointer(point)
      if(background&&(nextGather>0||characterNear(point)>.15))dust.emit(x,y,time)
    }
  },()=>bounds)
  function resize():void{renderer?.resize(win!.innerWidth,win!.innerHeight);stage.refresh();paint()}
  function tick(now:number):void{
    frame=0;if(!allowed()||!renderer)return
    const delta=Math.min((now-previous)/1000,.15);previous=now;time+=delta
    const targetEnergy=activeState(state) ? 1 : root.hasAttribute('data-rift-focus') ? .35 : 0
    const ease=1-Math.exp(-delta*7)
    scroll+=(targetScroll-scroll)*ease;gather+=(targetGather-gather)*ease
    character.step(delta,root.hasAttribute('data-rift-focus'))
    energy+=(targetEnergy-energy)*Math.min(1,delta*3);pulse=Math.max(0,pulse-delta*.7);paint()
    timer=win!.setTimeout(()=>{timer=0;frame=win!.requestAnimationFrame(tick)},activeState(state)||pulse>0||gather>.02||dust.active(time)||character.pose.blink>0||character.pose.ear!==0||Math.abs(scroll-targetScroll)>.00001?1000/24:1000/18)
  }
  function ensureRenderer():void{
    if(renderer||lost||!image.complete||image.naturalWidth===0||!allowed())return
    const source=appearance==='light'?CHARACTER_LIGHT:CHARACTER_DARK
    if(atlas.src!==source){atlas.src=source;return}
    if(!atlas.complete||!atlas.naturalWidth)return
    if(!layersFailed){
      const layerSource=appearance==='light'?WIND_LAYERS_LIGHT:WIND_LAYERS_DARK
      if(layers.src!==layerSource){layers.src=layerSource;return}
      if(!layers.complete||!layers.naturalWidth)return
    }
    renderer=createRiftRenderer(canvas,image,appearance==='light',atlas,layersFailed?undefined:layers);dust.dirty=true
    if(renderer){pulse=.8;renderer.resize(win!.innerWidth,win!.innerHeight);host.dataset.renderer='webgl'}else{lost=true;host.dataset.renderer='static'}
  }
  function sync():void{
    // Keep the first-paint wallpaper visible while the detail image decodes.
    // Failed detail decoding also leaves that complete static fallback intact.
    host.dataset.artwork=image.complete&&image.naturalWidth>0?'ready':'loading'
    stop();ensureRenderer();stage.refresh();const running=allowed()&&!!renderer
    if(!running){character.reset();dust.clear()}
    host.dataset.motion=running?'running':'paused'
    // Lightweight UI feedback must not depend on WebGL success or atlas loading.
    root.toggleAttribute('data-rift-paused',!enabled||reduced.matches||doc.hidden||!focused||forced.matches)
    paint();previous=win!.performance.now();if(running)frame=win!.requestAnimationFrame(tick)
  }
  const attributes=new win.MutationObserver(()=>{
    const nextAppearance=root.getAttribute('data-xiaohei-appearance')==='light'?'light':'dark'
    if(nextAppearance!==appearance){
      appearance=nextAppearance;stop();renderer?.dispose();renderer=undefined
      layersFailed=false
      lost=false;host.dataset.renderer='static';host.dataset.appearance=appearance
      character.reset();dust.clear()
      image.src=appearance==='light'?RIFT_LIGHT_DETAIL_IMAGE:RIFT_DETAIL_IMAGE
    }
    const next=root.getAttribute('data-xiaohei-state')||'idle'
    if(next!==state){if(allowed()&&((!activeState(state)&&activeState(next))||next==='complete'))pulse=1;state=next}sync()
  })
  attributes.observe(root,{attributes:true,attributeFilter:['data-xiaohei-state','data-xiaohei-appearance']})
  const rest=()=>{pulse=0;targetGather=0;gather=0;character.reset();dust.clear()}
  const focus=()=>{focused=true;sync()},blur=()=>{focused=false;rest();sync()}
  const visibility=()=>{focused=doc.hasFocus();if(doc.hidden)rest();sync()}
  const resume=()=>{focused=doc.hasFocus();sync()}
  const motion=(event:Event)=>{enabled=(event as CustomEvent<boolean>).detail!==false;if(!enabled)rest();sync()}
  const storage=(event:StorageEvent)=>{if(event.key===RIFT_MOTION_KEY||event.key===null){enabled=motionEnabled(win!);sync()}}
  const signal=(event:Event)=>{
    const detail=(event as CustomEvent<{kind?:string;x?:number;y?:number;width?:number;height?:number}>).detail,kind=detail?.kind
    if(kind==='navigate'){targetScroll=0;character.reset();dust.clear()}
    if(allowed()&&kind==='focus'&&Number.isFinite(detail.x)&&Number.isFinite(detail.y))character.focus(scenePoint(detail.x!+(detail.width??0)/2,detail.y!+(detail.height??0)/2,win.innerWidth,win.innerHeight))
    if(allowed()&&kind==='release')character.respond()
    if(allowed()&&(kind==='release'||kind==='navigate'||kind==='complete')){pulse=Math.max(pulse,.45);sync()}
  }
  const contextLost=(event:Event)=>{event.preventDefault();lost=true;renderer?.dispose();renderer=undefined;host.dataset.renderer='static';sync()}
  const restored=()=>{lost=false;sync()}
  image.addEventListener('load',sync)
  atlas.addEventListener('load',sync)
  layers.addEventListener('load',sync)
  const layersError=()=>{layersFailed=true;sync()};layers.addEventListener('error',layersError)
  const atlasError=()=>{lost=true;host.dataset.renderer='static';sync()};atlas.addEventListener('error',atlasError)
  canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',restored)
  win.addEventListener('focus',focus);win.addEventListener('blur',blur);win.addEventListener('resize',resize)
  win.addEventListener('pageshow',resume)
  win.addEventListener(RIFT_MOTION_EVENT,motion);win.addEventListener('storage',storage);doc.addEventListener('visibilitychange',visibility)
  win.addEventListener(RIFT_SIGNAL,signal)
  for(const media of[reduced,compact,forced])media.addEventListener('change',sync)
  host.dataset.appearance=appearance;image.src=appearance==='light'?RIFT_LIGHT_DETAIL_IMAGE:RIFT_DETAIL_IMAGE;sync()
  return()=>{
    disposed=true;stop();disposeInput();stage.dispose();attributes.disconnect();renderer?.dispose();image.removeEventListener('load',sync)
    atlas.removeEventListener('load',sync);atlas.removeEventListener('error',atlasError)
    layers.removeEventListener('load',sync);layers.removeEventListener('error',layersError)
    canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',restored)
    win.removeEventListener('focus',focus);win.removeEventListener('blur',blur);win.removeEventListener('resize',resize)
    win.removeEventListener('pageshow',resume)
    win.removeEventListener(RIFT_MOTION_EVENT,motion);win.removeEventListener('storage',storage);doc.removeEventListener('visibilitychange',visibility)
    win.removeEventListener(RIFT_SIGNAL,signal)
    for(const media of[reduced,compact,forced])media.removeEventListener('change',sync)
    host.remove();root.removeAttribute('data-rift-paused')
  }
}
