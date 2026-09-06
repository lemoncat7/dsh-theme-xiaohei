interface Clock {
  setTimeout(callback: () => void, delay: number): number
  clearTimeout(handle: number): void
  performance: { now(): number }
}
export interface CharacterMotionClip { duration: number }
/** One deadline; elapsed-time continuous sampling, capped at 30 fps. */
export function createCharacterMotionClock(clock: Clock, changed: (action: string | undefined, progress: number) => void, random = Math.random) {
  let timer: number | undefined, disposed = false, turn = 0, active = ''
  let clips: Readonly<Record<string, CharacterMotionClip>> | undefined
  const clear = () => { if (timer !== undefined) clock.clearTimeout(timer); timer = undefined }
  function rest() {
    active = ''; changed(undefined, 0)
    if (clips && !disposed) timer = clock.setTimeout(start, 2800 + random() * 2800)
  }
  function play(action: string) {
    const clip=clips?.[action]
    if (!clip || disposed) return
    clear(); active=action
    const started=clock.performance.now()
    const step = () => {
      timer=undefined
      if (!clips || disposed) return
      const t=Math.min(1,(clock.performance.now()-started)/clip.duration)
      changed(active,t)
      if (t>=1) { rest(); return }
      timer=clock.setTimeout(step,1000/30)
    }
    step()
  }
  function start() {
    timer=undefined
    if (!clips || disposed) return
    const gestures=Object.keys(clips).filter(name=>name!=='blink' && name!=='attention')
    play((turn++ % 2 === 0 && clips.blink) || !gestures.length ? 'blink' : gestures[Math.floor(random()*gestures.length)]!)
  }
  return {
    setClips(next: typeof clips) {
      if (disposed || next === clips) return
      clear(); clips=next; active=''; changed(undefined,0)
      if (clips) timer=clock.setTimeout(start,1200+random()*800)
    },
    attention() { if (!active) play('attention') },
    dispose() { disposed=true; clear(); clips=undefined; changed(undefined,0) },
  }
}
