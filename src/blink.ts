import { XIAOHEI_BLINK_CSS } from './chrome/blink.js'
import { XIAOHEI_HEIXIU_GREETING_EVENT } from './heixiu-interactions.js'

export const XIAOHEI_BLINK_STYLE_ID = 'dsh-theme-xiaohei/blink-style'

const INITIAL_BLINK_DELAY_MS = 4780
const IDLE_BLINK_INTERVAL_MS = 5065
const IDLE_BLINK_CLOSED_MS = 135

interface BlinkStep {
  at: number
  closed: boolean
}

const HEIXIU_GREETING_BLINK_STEPS: readonly BlinkStep[] = [
  { at: 78, closed: true },
  { at: 224, closed: false },
  { at: 348, closed: true },
  { at: 447, closed: false },
]

/** Own every blink from one DOM state so pupils and the closed frame change atomically. */
export function installXiaoheiBlink(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc?.body === undefined || doc.defaultView === null) return () => {}

  const win = doc.defaultView
  doc.getElementById(XIAOHEI_BLINK_STYLE_ID)?.remove()
  const style = doc.createElement('style')
  style.id = XIAOHEI_BLINK_STYLE_ID
  style.textContent = XIAOHEI_BLINK_CSS
  doc.head.append(style)

  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)')
  const timers = new Set<number>()
  let disposed = false
  let mascot: HTMLElement | undefined

  const isIdle = (): boolean => (
    doc.documentElement.getAttribute('data-xiaohei-state') ?? 'idle'
  ) === 'idle' && doc.visibilityState !== 'hidden' && !reducedMotion.matches

  const setClosed = (closed: boolean): void => {
    if (closed) mascot?.setAttribute('data-xiaohei-blink', 'closed')
    else mascot?.removeAttribute('data-xiaohei-blink')
  }

  const clearTimers = (): void => {
    for (const timer of timers) win.clearTimeout(timer)
    timers.clear()
  }

  const queue = (delay: number, callback: () => void): void => {
    const timer = win.setTimeout(() => {
      timers.delete(timer)
      if (!disposed) callback()
    }, delay)
    timers.add(timer)
  }

  const scheduleIdleBlink = (initial = false): void => {
    if (!isIdle() || mascot === undefined) return
    queue(initial ? INITIAL_BLINK_DELAY_MS : IDLE_BLINK_INTERVAL_MS, () => {
      if (!isIdle()) return
      setClosed(true)
      queue(IDLE_BLINK_CLOSED_MS, () => {
        setClosed(false)
        scheduleIdleBlink()
      })
    })
  }

  const restartIdleBlink = (initial = false): void => {
    clearTimers()
    setClosed(false)
    scheduleIdleBlink(initial)
  }

  const attach = (): void => {
    const nextMascot = doc.querySelector<HTMLElement>('.xiaohei-scene__mascot') ?? undefined
    if (nextMascot === mascot) return
    mascot?.removeAttribute('data-xiaohei-blink')
    mascot = nextMascot
    restartIdleBlink(true)
  }

  const onHeixiuGreeting = (): void => {
    if (!isIdle() || mascot === undefined) return
    clearTimers()
    setClosed(false)
    for (const step of HEIXIU_GREETING_BLINK_STEPS) {
      queue(step.at, () => setClosed(step.closed))
    }
    queue(520, () => {
      setClosed(false)
      scheduleIdleBlink()
    })
  }

  const onEnvironmentChange = (): void => restartIdleBlink()
  const mountObserver = new win.MutationObserver(attach)
  mountObserver.observe(doc.body, { childList: true, subtree: true })
  const stateObserver = new win.MutationObserver(onEnvironmentChange)
  stateObserver.observe(doc.documentElement, {
    attributes: true,
    attributeFilter: ['data-xiaohei-state'],
  })
  doc.addEventListener('visibilitychange', onEnvironmentChange)
  doc.addEventListener(XIAOHEI_HEIXIU_GREETING_EVENT, onHeixiuGreeting)
  reducedMotion.addEventListener('change', onEnvironmentChange)
  attach()

  return () => {
    disposed = true
    clearTimers()
    mountObserver.disconnect()
    stateObserver.disconnect()
    doc.removeEventListener('visibilitychange', onEnvironmentChange)
    doc.removeEventListener(XIAOHEI_HEIXIU_GREETING_EVENT, onHeixiuGreeting)
    reducedMotion.removeEventListener('change', onEnvironmentChange)
    mascot?.removeAttribute('data-xiaohei-blink')
    style.remove()
  }
}
