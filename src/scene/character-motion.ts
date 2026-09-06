import { CHARACTER_MOTION } from '../generated-character-motion.js'
import { createCharacterMotionClock } from './character-motion-clock.js'
import { createRigRenderer } from './character-rig-renderer.js'
import type { CharacterRig } from './character-motion-types.js'

/** Owns loading and lifecycle only. Rig math and painting stay independent. */
export function createCharacterMotion(doc: Document) {
  const win=doc.defaultView!, reduced=win.matchMedia('(prefers-reduced-motion: reduce)')
  const images=new Map<string, HTMLImageElement | null>(), loading=new Map<string, Promise<void>>()
  let disposed=false, part: HTMLElement | undefined, rig: CharacterRig | undefined
  let canvas: HTMLCanvasElement | undefined, render: ReturnType<typeof createRigRenderer> | undefined
  let pose='', appearance='', revision=0, nearby=false, lastPointer=0
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
    render(action,progress);part.dataset.motion=action ?? 'rig-rest'
  })
  function update() {
    if (disposed) return
    const mode=doc.documentElement.dataset.xiaoheiAppearance==='light'?'light':'dark'
    const next=!doc.hidden && !reduced.matches && part ? CHARACTER_MOTION[pose]?.[mode] : undefined
    if (next===rig && appearance===mode) return
    clock.setClips(undefined);render=undefined
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
      currentPart.append(canvas);render=createRigRenderer(ctx,next,images)
      clock.setClips({
        blink:{duration:330},
        ...Object.fromEntries(next.ears.map((_,i)=>['ear'+i,{duration:1050}])),
        ...(next.layers.tail ? {tail:{duration:2400}} : {}),
        attention:{duration:2400},
      })
    })
  }
  const pointer=(event: PointerEvent)=>{
    if (!part || !render || event.pointerType!=='mouse') return
    const now=win.performance.now()
    if (now-lastPointer<100) return
    lastPointer=now
    const rect=part.getBoundingClientRect()
    const near=event.clientX>=rect.left-70 && event.clientX<=rect.right+70
      && event.clientY>=rect.top-50 && event.clientY<=rect.bottom+50
    if (near && !nearby) clock.attention()
    nearby=near
  }
  reduced.addEventListener('change',update)
  doc.addEventListener('visibilitychange',update)
  doc.addEventListener('pointermove',pointer,{passive:true})
  const observer=new win.MutationObserver(update)
  observer.observe(doc.documentElement,{attributes:true,attributeFilter:['data-xiaohei-appearance']})
  return {
    setPose(nextPart: HTMLElement | undefined,nextPose: string) {
      if (nextPart!==part || pose!==nextPose) {
        revision++;clock.setClips(undefined);render=undefined;canvas?.remove();canvas=undefined;rig=undefined
        if (part) part.dataset.motion='rest'
      }
      part=nextPart;pose=nextPose;update()
    },
    dispose() {
      disposed=true;revision++;clock.dispose();canvas?.remove();render=undefined;images.clear();loading.clear()
      if (part) part.dataset.motion='rest'
      reduced.removeEventListener('change',update);observer.disconnect()
      doc.removeEventListener('visibilitychange',update);doc.removeEventListener('pointermove',pointer)
    },
  }
}
