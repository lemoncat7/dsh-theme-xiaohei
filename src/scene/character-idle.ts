export type CharacterIdlePose = 'seated' | 'chin' | 'doze'
export const CHARACTER_CHIN_DELAY = 30_000
export const CHARACTER_DOZE_DELAY = 180_000

interface IdleClock {
  now(): number
  setTimeout(callback: () => void, delay: number): number
  clearTimeout(handle: number): void
}

/** One pending deadline, no polling, no model/session state or persisted user data. */
export function createCharacterIdleController(clock: IdleClock, changed: (pose: CharacterIdlePose) => void) {
  let pose: CharacterIdlePose = 'seated'
  let lastActivity = clock.now()
  let timer: number | undefined
  let paused = true
  let disposed = false
  const clear = () => {
    if (timer !== undefined) clock.clearTimeout(timer)
    timer = undefined
  }
  const update = (next: CharacterIdlePose) => {
    if (next !== pose) { pose = next; changed(next) }
  }
  const schedule = () => {
    clear()
    if (paused || disposed || pose === 'doze') return
    const deadline = pose === 'seated' ? CHARACTER_CHIN_DELAY : CHARACTER_DOZE_DELAY
    timer = clock.setTimeout(tick, Math.max(1, lastActivity + deadline - clock.now()))
  }
  function tick() {
    timer = undefined
    if (paused || disposed) return
    const elapsed = clock.now() - lastActivity
    update(elapsed >= CHARACTER_DOZE_DELAY ? 'doze' : elapsed >= CHARACTER_CHIN_DELAY ? 'chin' : 'seated')
    schedule()
  }
  return {
    get pose() { return pose },
    activity() {
      if (paused || disposed) return
      const now = clock.now()
      // Pointer events can fire at 120 Hz. Update a timestamp at most once per
      // second; never reset a timeout on each pointer movement or keystroke.
      if (pose === 'seated' && now - lastActivity < 1000) return
      lastActivity = now
      if (pose !== 'seated') { update('seated'); schedule() }
    },
    setPaused(value: boolean) {
      if (disposed || value === paused) return
      paused = value
      clear()
      lastActivity = clock.now()
      update('seated')
      if (!paused) schedule()
    },
    dispose() { disposed = true; clear() },
  }
}
