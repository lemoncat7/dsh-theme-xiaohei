interface Clock {
  setTimeout(callback: () => void, delay: number): number
  clearTimeout(handle: number): void
  performance: { now(): number }
}
export interface CharacterMotionClip { duration: number }
/** One deadline; 60 fps only during a short gesture, no idle frame loop. */
export function createCharacterMotionClock(clock: Clock, changed: (action: string | undefined, progress: number) => void, random = Math.random) {
  let timer: number | undefined, disposed = false, active = ''
  let clips: Readonly<Record<string, CharacterMotionClip>> | undefined
  let blinksSinceEar=0, nextEar=0
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
      timer=clock.setTimeout(step,1000/60)
    }
    step()
  }
  function start() {
    timer=undefined
    if (!clips || disposed) return
    const gestures=Object.keys(clips).filter(name=>name!=='blink' && name!=='attention')
    const ears=gestures.filter(name=>name.startsWith('ear'))
    // Random selection alone can starve ear motion indefinitely. Keep a quiet,
    // bounded cadence, alternating ears instead of twitching both in lockstep.
    const action=ears.length && blinksSinceEar>=2 ? ears[nextEar++%ears.length]!
      : (random()<.72 && clips.blink) || !gestures.length ? 'blink'
      : gestures[Math.floor(random()*gestures.length)]!
    if(action.startsWith('ear'))blinksSinceEar=0
    else blinksSinceEar++
    play(action)
  }
  return {
    setClips(next: typeof clips) {
      if (disposed || next === clips) return
      clear(); clips=next; active=''; blinksSinceEar=0;nextEar=0;changed(undefined,0)
      if (clips) timer=clock.setTimeout(start,1200+random()*800)
    },
    attention() { if (!active) play('attention') },
    dispose() { disposed=true; clear(); clips=undefined; changed(undefined,0) },
  }
}
