import { CHARACTER_MOTION } from '../generated-character-motion.js'
import { createCharacterMotionClock } from './character-motion-clock.js'
import { createRigRenderer } from './character-rig-renderer.js'
import type { CharacterRig } from './character-motion-types.js'
import { EYE_RIGS } from './character-eye-rig.js'
import { createCharacterGaze } from './character-gaze.js'
import type { Point } from './character-motion-types.js'

/** Owns loading and lifecycle only. Rig math and painting stay independent. */
export function createCharacterMotion(doc: Document) {
  const win=doc.defaultView!, reduced=win.matchMedia('(prefers-reduced-motion: reduce)')
  const images=new Map<string, HTMLImageElement | null>(), loading=new Map<string, Promise<void>>()
  let disposed=false, part: HTMLElement | undefined, rig: CharacterRig | undefined
  let canvas: HTMLCanvasElement | undefined, render: ReturnType<typeof createRigRenderer> | undefined
  let pose='', appearance='', revision=0, nearby=false, lastPointer=0
  let attentionTimer: number | undefined, lastAttention=-Infinity
  let gazePoint: Point=[0,0], activeAction: string | undefined, activeProgress=0
  let bounds: DOMRect | undefined
  const paint=()=>{ if(render && part){render(activeAction,activeProgress,gazePoint);part.dataset.motion=activeAction ?? 'rig-rest'} }
  const gaze=createCharacterGaze(win,point=>{gazePoint=point;paint()})
  const cancelAttention=()=>{ if (attentionTimer!==undefined) win.clearTimeout(attentionTimer); attentionTimer=undefined }
  function decode(src: string): Promise<void> {
    if (loading.has(src)) return loading.get(src)!
    if (images.has(src)) return Promise.resolve()
    const image=new win.Image();image.src=src
    const pending=image.decode().then(()=>{ if (!disposed) images.set(src,image) },()=>{})
      .finally(()=>loading.delete(src))
    loading.set(src,pending);return pending
  }
  const clock=createCharacterMotionClock(win,(action,progress)=>{
    if (!canvas || !part || !render) return
    // Keep the same layered rest drawing after an action: no plate swap/pop.
    activeAction=action;activeProgress=progress;paint()
  })
  function update() {
    if (disposed) return
    const mode=doc.documentElement.dataset.xiaoheiAppearance==='light'?'light':'dark'
    const moving=doc.documentElement.hasAttribute('data-xiaohei-sidebar-resizing')
    const next=!doc.hidden && !reduced.matches && !moving && part ? CHARACTER_MOTION[pose]?.[mode] : undefined
    if (next===rig && appearance===mode) return
    cancelAttention();render=undefined;clock.setClips(undefined);gaze.reset();bounds=undefined
    activeAction=undefined;activeProgress=0
    const current=++revision
    canvas?.remove();canvas=undefined
    if (part) part.dataset.motion='rest'
    rig=next;appearance=mode;nearby=false
    if (!next || !part) return
    const currentPart=part
    void Promise.all(Object.values(next.layers).map(layer=>decode(layer.src))).then(()=>{
      if (disposed || current!==revision || Object.values(next.layers).some(layer=>!images.get(layer.src))) return
      canvas=doc.createElement('canvas');canvas.className='xiaohei-character-motion'
      canvas.width=next.size[0];canvas.height=next.size[1]
      const ctx=canvas.getContext('2d')
      if (!ctx) { canvas=undefined;return }
      currentPart.append(canvas);render=createRigRenderer(ctx,next,images,EYE_RIGS[pose])
      clock.setClips({
        blink:{duration:280},
        ...Object.fromEntries(next.ears.map((_,i)=>['ear'+i,{duration:1050}])),
        ...(next.layers.tail ? {tail:{duration:2400}} : {}),
        attention:{duration:2400},
      })
    })
  }
  const pointer=(event: PointerEvent)=>{
    if (!part || !render || event.pointerType!=='mouse') return
    const now=win.performance.now()
    if (!bounds || now-lastPointer>=100) {bounds=part.getBoundingClientRect();lastPointer=now}
    const rect=bounds, eyes=EYE_RIGS[pose]
    if(rig && eyes?.length){
      const scale=Math.min(rect.width/rig.size[0],rect.height/rig.size[1])
      const eyeX=eyes.reduce((sum,eye)=>sum+eye.iris[0],0)/eyes.length/2
      const eyeY=eyes.reduce((sum,eye)=>sum+eye.iris[1],0)/eyes.length/2
      const cx=rect.left+eyeX*scale
      const cy=rect.top+(rect.height-rig.size[1]*scale)/2+eyeY*scale
      gaze.target((event.clientX-cx)/Math.max(220,win.innerWidth*.32),(event.clientY-cy)/Math.max(180,win.innerHeight*.32))
    }
    const near=event.clientX>=rect.left-70 && event.clientX<=rect.right+70
      && event.clientY>=rect.top-50 && event.clientY<=rect.bottom+50
    if (!near) cancelAttention()
    if (near && !nearby && now-lastAttention>6000) {
      const current=revision
      // A passing pointer should not trigger a performance. Brief dwell gives
      // an intentional approach one quiet, coordinated response.
      attentionTimer=win.setTimeout(()=>{
        attentionTimer=undefined
        if (!disposed && nearby && current===revision) { lastAttention=win.performance.now();clock.attention() }
      },180)
    }
    nearby=near
  }
  reduced.addEventListener('change',update)
  const neutral=()=>{gaze.target(0,0);nearby=false;cancelAttention()}
  const leave=(event:PointerEvent)=>{if(!event.relatedTarget)neutral()}
  const resize=()=>{bounds=undefined}
  doc.addEventListener('pointerout',leave)
  win.addEventListener('blur',neutral)
  win.addEventListener('resize',resize)
  doc.addEventListener('visibilitychange',update)
  doc.addEventListener('pointermove',pointer,{passive:true})
  const observer=new win.MutationObserver(update)
  observer.observe(doc.documentElement,{attributes:true,attributeFilter:['data-xiaohei-appearance','data-xiaohei-sidebar-resizing']})
  return {
    setPose(nextPart: HTMLElement | undefined,nextPose: string) {
      if (nextPart!==part || pose!==nextPose) {
        cancelAttention();revision++;render=undefined;clock.setClips(undefined);gaze.reset();bounds=undefined;canvas?.remove();canvas=undefined;rig=undefined
        if (part) part.dataset.motion='rest'
      }
      part=nextPart;pose=nextPose;update()
    },
    dispose() {
      disposed=true;cancelAttention();revision++;clock.dispose();gaze.dispose();canvas?.remove();render=undefined;images.clear();loading.clear()
      if (part) part.dataset.motion='rest'
      reduced.removeEventListener('change',update);observer.disconnect()
      doc.removeEventListener('visibilitychange',update);doc.removeEventListener('pointermove',pointer)
      doc.removeEventListener('pointerout',leave);win.removeEventListener('blur',neutral);win.removeEventListener('resize',resize)
    },
  }
}
