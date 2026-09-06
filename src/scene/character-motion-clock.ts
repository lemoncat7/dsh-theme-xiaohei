interface Clock {
  setTimeout(callback: () => void, delay: number): number
  clearTimeout(handle: number): void
}
export interface CharacterMotionClip { frames: number; interval: number }

/** One deadline, bounded frame sequences, no RAF or catch-up after suspension. */
export function createCharacterMotionClock(clock: Clock, changed: (action: string | undefined, frame: number) => void, random = Math.random) {
  let timer: number | undefined, disposed = false, turn = 0, active = ''
  let clips: Readonly<Record<string, CharacterMotionClip>> | undefined
  const clear = () => { if (timer !== undefined) clock.clearTimeout(timer); timer = undefined }
  function rest() {
    active = ''; changed(undefined, 0)
    if (clips && !disposed) timer = clock.setTimeout(start, 2800 + random() * 2800)
  }
  function start() {
    timer = undefined
    if (!clips || disposed) return
    const gestures = Object.keys(clips).filter(name => name !== 'blink')
    active = (turn++ % 2 === 0 && clips.blink) || !gestures.length ? 'blink' : gestures[Math.floor(random() * gestures.length)]!
    const clip = clips[active]
    if (!clip) { rest(); return }
    let frame = 0
    const step = () => {
      timer = undefined
      if (!clips || disposed) return
      if (frame >= clip.frames) { rest(); return }
      changed(active, frame++)
      timer = clock.setTimeout(step, clip.interval)
    }
    step()
  }
  return {
    setClips(next: typeof clips) {
      if (disposed || next === clips) return
      clear(); clips = next; active = ''; changed(undefined, 0)
      if (clips) timer = clock.setTimeout(start, 1200 + random() * 800)
    },
    dispose() { disposed = true; clear(); clips = undefined; changed(undefined, 0) },
  }
}
