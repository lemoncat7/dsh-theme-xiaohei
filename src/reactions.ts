import {
  XIAOHEI_IDLE_EAR_LEFT,
  XIAOHEI_IDLE_EAR_RIGHT,
  XIAOHEI_IDLE_TAIL,
} from './generated-keyart.js'
import { XIAOHEI_REACTION_CSS } from './chrome/reactions.js'
import {
  XIAOHEI_PORTAL_ACTIVITY_EVENT,
  XIAOHEI_PORTAL_LAYER_ID,
  type XiaoheiPortalActivityDetail,
} from './portal.js'

export const XIAOHEI_REACTION_STYLE_ID = 'dsh-theme-xiaohei/reaction-style'

const POINTER_ENTER_RADIUS_PX = 460
const POINTER_EXIT_RADIUS_PX = 520
const EAR_DELAY_MS = 190
const EAR_DURATION_MS = 560
const TAIL_SLOW_DURATION_MS = 1280
const TAIL_COMPLETE_DURATION_MS = 700
const IDLE_TAIL_MIN_DELAY_MS = 12_000
const IDLE_TAIL_DELAY_RANGE_MS = 12_000
const EYE_CENTER_X = (69 + 109) / 2 / 256
const EYE_CENTER_Y = (105 + 108) / 2 / 256

type EarReaction = 'ear-left' | 'ear-right'
type XiaoheiReaction = EarReaction | 'tail-slow' | 'tail-complete'

interface Point {
  x: number
  y: number
}

/** Resolve the next sparse tail visit; exported to keep the timing contract testable. */
export function resolveXiaoheiIdleTailDelay(randomValue = Math.random()): number {
  const normalized = Math.min(1, Math.max(0, randomValue))
  return IDLE_TAIL_MIN_DELAY_MS + Math.round(normalized * IDLE_TAIL_DELAY_RANGE_MS)
}

/** Install sparse idle-only reactions without maintaining an animation loop. */
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
  let pointerInside = false
  let previousState = currentState(doc)
  let reactionTimer = 0
  let pendingEarTimer = 0
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

  const clearReaction = (): void => {
    clearTimer(reactionTimer)
    reactionTimer = 0
    mascot?.removeAttribute('data-xiaohei-reaction')
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

  const eyeCenter = (): Point | undefined => {
    if (mascot === undefined) return undefined
    const rect = mascot.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return undefined
    return {
      x: rect.left + rect.width * EYE_CENTER_X,
      y: rect.top + rect.height * EYE_CENTER_Y,
    }
  }

  const earToward = (target: Point): EarReaction | undefined => {
    const origin = eyeCenter()
    if (origin === undefined) return undefined
    return target.x < origin.x ? 'ear-left' : 'ear-right'
  }

  const scheduleEarToward = (target: Point, delayMs = EAR_DELAY_MS): void => {
    clearPendingEar()
    const ear = earToward(target)
    if (ear === undefined || behaviorDisabled() || !isIdle()) return
    pendingEarTimer = win.setTimeout(() => {
      pendingEarTimer = 0
      playEar(ear)
    }, delayMs)
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
      pointerInside = false
      clearPendingEar()
      return
    }

    pointer = { x: event.clientX, y: event.clientY }
    const origin = eyeCenter()
    if (origin === undefined) return
    const distance = Math.hypot(pointer.x - origin.x, pointer.y - origin.y)
    if (!pointerInside && distance < POINTER_ENTER_RADIUS_PX) {
      pointerInside = true
      scheduleEarToward(pointer)
    } else if (pointerInside && distance > POINTER_EXIT_RADIUS_PX) {
      pointerInside = false
      clearPendingEar()
    }
  }

  const clearPointer = (): void => {
    pointer = undefined
    pointerInside = false
    clearPendingEar()
  }

  const onPortalActivity = (event: Event): void => {
    const active = Boolean((event as CustomEvent<XiaoheiPortalActivityDetail>).detail?.active)
    if (!active) {
      clearPendingEar()
      return
    }

    // Gaze reacts to the same event immediately. Resolve the moving traveler
    // shortly afterwards so the ear follows the direction already being seen.
    clearPendingEar()
    pendingEarTimer = win.setTimeout(() => {
      pendingEarTimer = 0
      const traveler = doc.getElementById(XIAOHEI_PORTAL_LAYER_ID)
        ?.querySelector<HTMLElement>('.xiaohei-portal__traveler')
      const rect = traveler?.getBoundingClientRect()
      if (rect === undefined) return
      const target = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      const ear = earToward(target)
      if (ear !== undefined) playEar(ear)
    }, EAR_DELAY_MS)
  }

  const onStateChange = (): void => {
    const nextState = currentState(doc)
    if (nextState === previousState) return
    const cameFromComplete = previousState === 'complete' && nextState === 'idle'
    previousState = nextState
    clearPendingEar()
    clearTimer(idleTailTimer)
    idleTailTimer = 0

    if (nextState !== 'idle') {
      clearReaction()
      pointerInside = false
      return
    }

    if (cameFromComplete) play('tail-complete', TAIL_COMPLETE_DURATION_MS)
    scheduleIdleTail()
  }

  const onVisibilityChange = (): void => {
    clearPendingEar()
    clearTimer(idleTailTimer)
    idleTailTimer = 0
    pointerInside = false
    if (doc.visibilityState === 'hidden') {
      clearReaction()
    } else {
      scheduleIdleTail()
    }
  }

  const onPreferenceChange = (): void => {
    clearPendingEar()
    clearReaction()
    scheduleIdleTail()
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
  doc.addEventListener(XIAOHEI_PORTAL_ACTIVITY_EVENT, onPortalActivity)
  win.addEventListener('blur', clearPointer)
  reducedMotion.addEventListener('change', onPreferenceChange)
  coarsePointer.addEventListener('change', onPreferenceChange)
  attach()
  scheduleIdleTail()

  return () => {
    disposed = true
    clearPendingEar()
    clearTimer(idleTailTimer)
    clearReaction()
    mountObserver.disconnect()
    stateObserver.disconnect()
    doc.removeEventListener('pointermove', onPointerMove)
    doc.removeEventListener('pointerleave', clearPointer)
    doc.removeEventListener('visibilitychange', onVisibilityChange)
    doc.removeEventListener(XIAOHEI_PORTAL_ACTIVITY_EVENT, onPortalActivity)
    win.removeEventListener('blur', clearPointer)
    reducedMotion.removeEventListener('change', onPreferenceChange)
    coarsePointer.removeEventListener('change', onPreferenceChange)
    reactionLayer?.remove()
    mascot?.removeAttribute('data-xiaohei-reaction')
    preloads.length = 0
    style.remove()
  }
}

function currentState(doc: Document): string {
  return doc.documentElement.getAttribute('data-xiaohei-state') ?? 'idle'
}
