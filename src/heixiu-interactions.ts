export const XIAOHEI_HEIXIU_GREETING_EVENT = 'dsh-theme-xiaohei:heixiu-greeting'

export interface XiaoheiHeixiuGreetingDetail {
  target: { x: number; y: number }
}

const HEIXIU_SELECTOR = '.xiaohei-scene__heixiu'
const HEIXIU_ENTER_RADIUS_PX = 120
const HEIXIU_EXIT_RADIUS_PX = 154
const HEIXIU_ATTENTION_OFFSET_PX = 3.2
const GREETING_DURATION_MS = 800
const INITIAL_GREETING_DELAY_MS = 3600
const GREETING_MIN_DELAY_MS = 12_000
const GREETING_DELAY_RANGE_MS = 6000

interface Point {
  x: number
  y: number
}

interface HeixiuCandidate {
  element: HTMLElement
  center: Point
  distance: number
}

/** Install delegated pointer attention and occasional synchronized greetings. */
export function installXiaoheiHeixiuInteractions(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc?.body === undefined || doc.defaultView === null) return () => {}

  const win = doc.defaultView
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)')
  const coarsePointer = win.matchMedia('(hover: none) and (pointer: coarse)')
  let disposed = false
  let active: HTMLElement | undefined
  let pointer: Point | undefined
  let frameId = 0
  let greetingTimer = 0
  let greetingCleanupTimer = 0

  const behaviorDisabled = (): boolean => reducedMotion.matches || coarsePointer.matches
  const isIdle = (): boolean => (
    doc.documentElement.getAttribute('data-xiaohei-state') ?? 'idle'
  ) === 'idle' && doc.visibilityState !== 'hidden'

  const clearAttention = (): void => {
    if (active === undefined) return
    active.removeAttribute('data-xiaohei-heixiu-attention')
    active.style.removeProperty('--xiaohei-heixiu-attention-x')
    active.style.removeProperty('--xiaohei-heixiu-attention-y')
    active = undefined
  }

  const candidateForPointer = (point: Point): HeixiuCandidate | undefined => {
    let nearest: HeixiuCandidate | undefined
    for (const element of doc.querySelectorAll<HTMLElement>(HEIXIU_SELECTOR)) {
      const rect = element.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) continue
      const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      const distance = Math.hypot(point.x - center.x, point.y - center.y)
      if (nearest === undefined || distance < nearest.distance) nearest = { element, center, distance }
    }
    return nearest
  }

  const dispatchGreeting = (target: Point): void => {
    const EventConstructor = win.CustomEvent
    doc.dispatchEvent(new EventConstructor<XiaoheiHeixiuGreetingDetail>(XIAOHEI_HEIXIU_GREETING_EVENT, {
      detail: { target },
    }))
  }

  const playGreeting = (heixiu: HTMLElement, target: Point): void => {
    if (disposed || behaviorDisabled() || !isIdle()) return
    win.clearTimeout(greetingCleanupTimer)
    heixiu.removeAttribute('data-xiaohei-heixiu-greeting')
    void heixiu.offsetWidth
    heixiu.setAttribute('data-xiaohei-heixiu-greeting', 'true')
    dispatchGreeting(target)
    greetingCleanupTimer = win.setTimeout(() => {
      greetingCleanupTimer = 0
      heixiu.removeAttribute('data-xiaohei-heixiu-greeting')
    }, GREETING_DURATION_MS)
  }

  const greetFromMascotCompanion = (): void => {
    if (disposed || behaviorDisabled() || !isIdle()) return
    const heixiu = doc.querySelector<HTMLElement>('.xiaohei-scene__heixiu--mascot')
    if (heixiu === null) return
    const rect = heixiu.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    playGreeting(heixiu, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }

  const scheduleGreeting = (initial = false): void => {
    win.clearTimeout(greetingTimer)
    if (disposed) return
    const delay = initial
      ? INITIAL_GREETING_DELAY_MS
      : GREETING_MIN_DELAY_MS + Math.round(Math.random() * GREETING_DELAY_RANGE_MS)
    greetingTimer = win.setTimeout(() => {
      greetingTimer = 0
      greetFromMascotCompanion()
      scheduleGreeting()
    }, delay)
  }

  const applyPointerAttention = (): void => {
    frameId = 0
    if (pointer === undefined || behaviorDisabled() || !isIdle()) {
      clearAttention()
      return
    }

    const candidate = candidateForPointer(pointer)
    const radius = candidate?.element === active ? HEIXIU_EXIT_RADIUS_PX : HEIXIU_ENTER_RADIUS_PX
    if (candidate === undefined || candidate.distance > radius) {
      clearAttention()
      return
    }

    if (active !== candidate.element) {
      clearAttention()
      active = candidate.element
      active.setAttribute('data-xiaohei-heixiu-attention', 'true')
    }

    const distance = Math.max(1, candidate.distance)
    const x = (pointer.x - candidate.center.x) / distance * HEIXIU_ATTENTION_OFFSET_PX
    const y = (pointer.y - candidate.center.y) / distance * HEIXIU_ATTENTION_OFFSET_PX
    candidate.element.style.setProperty('--xiaohei-heixiu-attention-x', `${x.toFixed(2)}px`)
    candidate.element.style.setProperty('--xiaohei-heixiu-attention-y', `${y.toFixed(2)}px`)
  }

  const wake = (): void => {
    if (disposed || frameId !== 0) return
    frameId = win.requestAnimationFrame(applyPointerAttention)
  }

  const onPointerMove = (event: PointerEvent): void => {
    pointer = event.pointerType === 'touch' ? undefined : { x: event.clientX, y: event.clientY }
    wake()
  }

  const clearPointer = (): void => {
    pointer = undefined
    wake()
  }

  const onStateOrPreferenceChange = (): void => {
    clearAttention()
    scheduleGreeting()
    wake()
  }

  const stateObserver = new win.MutationObserver(onStateOrPreferenceChange)
  stateObserver.observe(doc.documentElement, {
    attributes: true,
    attributeFilter: ['data-xiaohei-state'],
  })
  doc.addEventListener('pointermove', onPointerMove, { passive: true })
  doc.addEventListener('pointerleave', clearPointer)
  doc.addEventListener('visibilitychange', onStateOrPreferenceChange)
  win.addEventListener('blur', clearPointer)
  reducedMotion.addEventListener('change', onStateOrPreferenceChange)
  coarsePointer.addEventListener('change', onStateOrPreferenceChange)
  scheduleGreeting(true)

  return () => {
    disposed = true
    if (frameId !== 0) win.cancelAnimationFrame(frameId)
    win.clearTimeout(greetingTimer)
    win.clearTimeout(greetingCleanupTimer)
    stateObserver.disconnect()
    doc.removeEventListener('pointermove', onPointerMove)
    doc.removeEventListener('pointerleave', clearPointer)
    doc.removeEventListener('visibilitychange', onStateOrPreferenceChange)
    win.removeEventListener('blur', clearPointer)
    reducedMotion.removeEventListener('change', onStateOrPreferenceChange)
    coarsePointer.removeEventListener('change', onStateOrPreferenceChange)
    clearAttention()
    for (const heixiu of doc.querySelectorAll<HTMLElement>(HEIXIU_SELECTOR)) {
      heixiu.removeAttribute('data-xiaohei-heixiu-greeting')
    }
  }
}
