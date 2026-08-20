import {
  XIAOHEI_IDLE_EAR_LEFT,
  XIAOHEI_IDLE_EAR_RIGHT,
  XIAOHEI_IDLE_TAIL,
} from './generated-keyart.js'
import { XIAOHEI_REACTION_CSS } from './chrome/reactions.js'
import {
  XIAOHEI_HEIXIU_GREETING_EVENT,
  type XiaoheiHeixiuGreetingDetail,
} from './heixiu-interactions.js'
import {
  XIAOHEI_PORTAL_PROXIMITY_EVENT,
  type XiaoheiPortalProximityDetail,
} from './portal.js'

export const XIAOHEI_REACTION_STYLE_ID = 'dsh-theme-xiaohei/reaction-style'

const EAR_DELAY_MS = 190
const HEIXIU_EAR_DELAY_MS = 180
const HEIXIU_INTERACTION_DURATION_MS = 800
const EAR_DURATION_MS = 560
const TAIL_SLOW_DURATION_MS = 1280
const TAIL_COMPLETE_DURATION_MS = 700
const IDLE_TAIL_MIN_DELAY_MS = 12_000
const IDLE_TAIL_DELAY_RANGE_MS = 12_000
const LEFT_EAR_CENTER_X = 84 / 256
const LEFT_EAR_CENTER_Y = 62 / 256
const RIGHT_EAR_CENTER_X = 166 / 256
const RIGHT_EAR_CENTER_Y = 82 / 256
const EAR_POINTER_ENTER_RADIUS_X = 34 / 256
const EAR_POINTER_ENTER_RADIUS_Y = 42 / 256
const EAR_POINTER_EXIT_RADIUS_X = 40 / 256
const EAR_POINTER_EXIT_RADIUS_Y = 48 / 256

export type EarReaction = 'ear-left' | 'ear-right'
type XiaoheiReaction = EarReaction | 'tail-slow' | 'tail-complete'

interface Point {
  x: number
  y: number
}

interface MascotBounds {
  left: number
  top: number
  width: number
  height: number
}

/** Resolve a pointer only inside the two local, non-overlapping ear regions. */
export function resolveXiaoheiPointerEar(
  bounds: MascotBounds,
  target: Point,
  activeEar?: EarReaction,
): EarReaction | undefined {
  if (bounds.width <= 0 || bounds.height <= 0) return undefined

  const normalizedDistance = (
    ear: EarReaction,
    radiusX: number,
    radiusY: number,
  ): number => {
    const centerX = ear === 'ear-left' ? LEFT_EAR_CENTER_X : RIGHT_EAR_CENTER_X
    const centerY = ear === 'ear-left' ? LEFT_EAR_CENTER_Y : RIGHT_EAR_CENTER_Y
    const dx = (target.x - (bounds.left + bounds.width * centerX)) / (bounds.width * radiusX)
    const dy = (target.y - (bounds.top + bounds.height * centerY)) / (bounds.height * radiusY)
    return Math.hypot(dx, dy)
  }

  const entering = (['ear-left', 'ear-right'] as const)
    .map((ear) => ({
      ear,
      distance: normalizedDistance(ear, EAR_POINTER_ENTER_RADIUS_X, EAR_POINTER_ENTER_RADIUS_Y),
    }))
    .filter(({ distance }) => distance <= 1)
    .sort((left, right) => left.distance - right.distance)[0]
  if (entering !== undefined) return entering.ear

  if (
    activeEar !== undefined
    && normalizedDistance(activeEar, EAR_POINTER_EXIT_RADIUS_X, EAR_POINTER_EXIT_RADIUS_Y) <= 1
  ) {
    return activeEar
  }
  return undefined
}

/** Resolve the next sparse tail visit; exported to keep the timing contract testable. */
export function resolveXiaoheiIdleTailDelay(randomValue = Math.random()): number {
  const normalized = Math.min(1, Math.max(0, randomValue))
  return IDLE_TAIL_MIN_DELAY_MS + Math.round(normalized * IDLE_TAIL_DELAY_RANGE_MS)
}

/** Install proximity ear motion and sparse idle tails without a JavaScript frame loop. */
export function installXiaoheiIdleReactions(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc?.body === undefined || doc.defaultView === null) return () => {}

  const win = doc.defaultView
  doc.getElementById(XIAOHEI_REACTION_STYLE_ID)?.remove()
  const style = doc.createElement('style')
  style.id = XIAOHEI_REACTION_STYLE_ID
  style.textContent = XIAOHEI_REACTION_CSS
  doc.head.append(style)

  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)')
  const coarsePointer = win.matchMedia('(hover: none) and (pointer: coarse)')
  const preloads = [XIAOHEI_IDLE_EAR_LEFT, XIAOHEI_IDLE_EAR_RIGHT, XIAOHEI_IDLE_TAIL]
    .map((source) => {
      const image = new win.Image()
      image.decoding = 'async'
      image.src = source
      return image
    })
  let disposed = false
  let mascot: HTMLElement | undefined
  let reactionLayer: HTMLImageElement | undefined
  let pointer: Point | undefined
  let pointerEar: EarReaction | undefined
  let previousState = currentState(doc)
  let reactionTimer = 0
  let pendingEarTimer = 0
  let heixiuEarTimer = 0
  let heixiuInteractionTimer = 0
  let idleTailTimer = 0

  const behaviorDisabled = (): boolean => reducedMotion.matches || coarsePointer.matches
  const isIdle = (): boolean => currentState(doc) === 'idle' && doc.visibilityState !== 'hidden'
  const clearTimer = (timer: number): void => {
    if (timer !== 0) win.clearTimeout(timer)
  }

  const clearPendingEar = (): void => {
    clearTimer(pendingEarTimer)
    pendingEarTimer = 0
  }

  const clearHeixiuEar = (): void => {
    clearTimer(heixiuEarTimer)
    heixiuEarTimer = 0
  }

  const clearHeixiuInteraction = (): void => {
    clearTimer(heixiuInteractionTimer)
    heixiuInteractionTimer = 0
    mascot?.removeAttribute('data-xiaohei-heixiu-interaction')
  }

  const clearReaction = (): void => {
    clearTimer(reactionTimer)
    reactionTimer = 0
    mascot?.removeAttribute('data-xiaohei-reaction')
    mascot?.removeAttribute('data-xiaohei-ear-loop')
    reactionLayer?.removeAttribute('data-reaction')
  }

  const sourceFor = (reaction: XiaoheiReaction): string => {
    if (reaction === 'ear-left') return XIAOHEI_IDLE_EAR_LEFT
    if (reaction === 'ear-right') return XIAOHEI_IDLE_EAR_RIGHT
    return XIAOHEI_IDLE_TAIL
  }

  const play = (reaction: XiaoheiReaction, durationMs: number): boolean => {
    if (disposed || behaviorDisabled() || !isIdle() || mascot === undefined || reactionLayer === undefined) {
      return false
    }
    if (mascot.hasAttribute('data-xiaohei-reaction')) return false

    reactionLayer.src = sourceFor(reaction)
    reactionLayer.dataset.reaction = reaction
    mascot.dataset.xiaoheiReaction = reaction
    reactionTimer = win.setTimeout(() => {
      reactionTimer = 0
      mascot?.removeAttribute('data-xiaohei-reaction')
      reactionLayer?.removeAttribute('data-reaction')
    }, durationMs + 40)
    return true
  }

  const playEar = (ear: EarReaction): void => {
    play(ear, EAR_DURATION_MS)
  }

  const setEarFrame = (ear: EarReaction): void => {
    if (mascot === undefined || reactionLayer === undefined) return
    reactionLayer.src = sourceFor(ear)
    reactionLayer.dataset.reaction = ear
    mascot.dataset.xiaoheiReaction = ear
  }

  const stopPointerEarLoop = (): void => {
    clearPendingEar()
    if (mascot?.dataset.xiaoheiEarLoop === 'true') clearReaction()
  }

  const attach = (): void => {
    const nextMascot = doc.querySelector<HTMLElement>('.xiaohei-scene__mascot') ?? undefined
    if (nextMascot === mascot && reactionLayer?.isConnected === true) return

    clearReaction()
    reactionLayer?.remove()
    reactionLayer = undefined
    mascot = nextMascot
    const viewport = nextMascot?.querySelector<HTMLElement>('.xiaohei-scene__mascot-idle-viewport')
    if (viewport === null || viewport === undefined) return

    const layer = doc.createElement('img')
    layer.className = 'xiaohei-scene__idle-reaction'
    layer.alt = ''
    layer.decoding = 'async'
    layer.fetchPriority = 'low'
    viewport.append(layer)
    reactionLayer = layer
  }

  const earToward = (target: Point): EarReaction | undefined => {
    if (mascot === undefined) return undefined
    const rect = mascot.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return undefined
    const leftEar = {
      x: rect.left + rect.width * LEFT_EAR_CENTER_X,
      y: rect.top + rect.height * LEFT_EAR_CENTER_Y,
    }
    const rightEar = {
      x: rect.left + rect.width * RIGHT_EAR_CENTER_X,
      y: rect.top + rect.height * RIGHT_EAR_CENTER_Y,
    }
    const leftDistance = Math.hypot(target.x - leftEar.x, target.y - leftEar.y)
    const rightDistance = Math.hypot(target.x - rightEar.x, target.y - rightEar.y)
    return leftDistance <= rightDistance ? 'ear-left' : 'ear-right'
  }

  const startPointerEarLoop = (): void => {
    if (pointerEar === undefined || behaviorDisabled() || !isIdle()) return
    clearHeixiuEar()
    clearHeixiuInteraction()
    clearReaction()
    setEarFrame(pointerEar)
    if (mascot !== undefined) mascot.dataset.xiaoheiEarLoop = 'true'
  }

  const schedulePointerEarLoop = (): void => {
    if (pendingEarTimer !== 0 || mascot?.dataset.xiaoheiEarLoop === 'true') return
    if (pointerEar === undefined || behaviorDisabled() || !isIdle()) return
    pendingEarTimer = win.setTimeout(() => {
      pendingEarTimer = 0
      startPointerEarLoop()
    }, EAR_DELAY_MS)
  }

  const refreshPointerEarDirection = (): void => {
    if (mascot?.dataset.xiaoheiEarLoop !== 'true' || pointerEar === undefined) return
    if (mascot.dataset.xiaoheiReaction === pointerEar) return
    setEarFrame(pointerEar)
  }

  const syncPointerEarLoop = (): void => {
    const rect = mascot?.getBoundingClientRect()
    pointerEar = pointer !== undefined && rect !== undefined
      ? resolveXiaoheiPointerEar(rect, pointer, pointerEar)
      : undefined
    if (pointerEar !== undefined) {
      schedulePointerEarLoop()
      refreshPointerEarDirection()
    } else {
      stopPointerEarLoop()
    }
  }

  const scheduleIdleTail = (): void => {
    clearTimer(idleTailTimer)
    idleTailTimer = 0
    if (disposed || behaviorDisabled() || !isIdle()) return
    const delay = resolveXiaoheiIdleTailDelay()
    idleTailTimer = win.setTimeout(() => {
      idleTailTimer = 0
      play('tail-slow', TAIL_SLOW_DURATION_MS)
      scheduleIdleTail()
    }, delay)
  }

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      pointer = undefined
      pointerEar = undefined
      stopPointerEarLoop()
      return
    }

    pointer = { x: event.clientX, y: event.clientY }
    syncPointerEarLoop()
  }

  const clearPointer = (): void => {
    pointer = undefined
    pointerEar = undefined
    stopPointerEarLoop()
  }

  const onPortalProximity = (event: Event): void => {
    const detail = (event as CustomEvent<XiaoheiPortalProximityDetail>).detail
    const active = Boolean(detail?.active)
    if (!active) {
      clearHeixiuEar()
      clearHeixiuInteraction()
      return
    }

    if (pointerEar !== undefined || !isIdle() || detail.target === undefined || mascot === undefined) return
    startHeixiuInteraction(detail.target, false)
  }

  const startHeixiuInteraction = (target: Point, supersedePointer: boolean): void => {
    if (!isIdle() || behaviorDisabled() || mascot === undefined) return
    if (pointerEar !== undefined && !supersedePointer) return
    if (supersedePointer) stopPointerEarLoop()
    clearHeixiuInteraction()
    mascot.dataset.xiaoheiHeixiuInteraction = 'true'
    heixiuInteractionTimer = win.setTimeout(() => {
      heixiuInteractionTimer = 0
      mascot?.removeAttribute('data-xiaohei-heixiu-interaction')
      syncPointerEarLoop()
    }, HEIXIU_INTERACTION_DURATION_MS)
    clearHeixiuEar()
    heixiuEarTimer = win.setTimeout(() => {
      heixiuEarTimer = 0
      const ear = earToward(target)
      if (ear !== undefined) playEar(ear)
    }, HEIXIU_EAR_DELAY_MS)
  }

  const onHeixiuGreeting = (event: Event): void => {
    const detail = (event as CustomEvent<XiaoheiHeixiuGreetingDetail>).detail
    if (detail?.target === undefined) return
    startHeixiuInteraction(detail.target, true)
  }

  const onStateChange = (): void => {
    const nextState = currentState(doc)
    if (nextState === previousState) return
    const cameFromComplete = previousState === 'complete' && nextState === 'idle'
    previousState = nextState
    clearPendingEar()
    clearHeixiuEar()
    clearHeixiuInteraction()
    clearTimer(idleTailTimer)
    idleTailTimer = 0

    if (nextState !== 'idle') {
      clearReaction()
      pointerEar = undefined
      return
    }

    if (cameFromComplete) play('tail-complete', TAIL_COMPLETE_DURATION_MS)
    scheduleIdleTail()
    syncPointerEarLoop()
  }

  const onVisibilityChange = (): void => {
    clearPendingEar()
    clearHeixiuEar()
    clearHeixiuInteraction()
    clearTimer(idleTailTimer)
    idleTailTimer = 0
    if (doc.visibilityState === 'hidden') {
      pointerEar = undefined
      clearReaction()
    } else {
      scheduleIdleTail()
      syncPointerEarLoop()
    }
  }

  const onPreferenceChange = (): void => {
    clearPendingEar()
    clearHeixiuEar()
    clearHeixiuInteraction()
    clearReaction()
    scheduleIdleTail()
    syncPointerEarLoop()
  }

  const mountObserver = new win.MutationObserver(attach)
  mountObserver.observe(doc.body, { childList: true, subtree: true })
  const stateObserver = new win.MutationObserver(onStateChange)
  stateObserver.observe(doc.documentElement, {
    attributes: true,
    attributeFilter: ['data-xiaohei-state'],
  })
  doc.addEventListener('pointermove', onPointerMove, { passive: true })
  doc.addEventListener('pointerleave', clearPointer)
  doc.addEventListener('visibilitychange', onVisibilityChange)
  doc.addEventListener(XIAOHEI_PORTAL_PROXIMITY_EVENT, onPortalProximity)
  doc.addEventListener(XIAOHEI_HEIXIU_GREETING_EVENT, onHeixiuGreeting)
  win.addEventListener('blur', clearPointer)
  reducedMotion.addEventListener('change', onPreferenceChange)
  coarsePointer.addEventListener('change', onPreferenceChange)
  attach()
  scheduleIdleTail()

  return () => {
    disposed = true
    clearPendingEar()
    clearHeixiuEar()
    clearHeixiuInteraction()
    clearTimer(idleTailTimer)
    clearReaction()
    mountObserver.disconnect()
    stateObserver.disconnect()
    doc.removeEventListener('pointermove', onPointerMove)
    doc.removeEventListener('pointerleave', clearPointer)
    doc.removeEventListener('visibilitychange', onVisibilityChange)
    doc.removeEventListener(XIAOHEI_PORTAL_PROXIMITY_EVENT, onPortalProximity)
    doc.removeEventListener(XIAOHEI_HEIXIU_GREETING_EVENT, onHeixiuGreeting)
    win.removeEventListener('blur', clearPointer)
    reducedMotion.removeEventListener('change', onPreferenceChange)
    coarsePointer.removeEventListener('change', onPreferenceChange)
    reactionLayer?.remove()
    mascot?.removeAttribute('data-xiaohei-reaction')
    mascot?.removeAttribute('data-xiaohei-ear-loop')
    mascot?.removeAttribute('data-xiaohei-heixiu-interaction')
    preloads.length = 0
    style.remove()
  }
}

function currentState(doc: Document): string {
  return doc.documentElement.getAttribute('data-xiaohei-state') ?? 'idle'
}
