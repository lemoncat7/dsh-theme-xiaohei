import { XIAOHEI_IDLE_EYE_BASE } from './generated-keyart.js'
import { XIAOHEI_GAZE_CSS } from './chrome/gaze.js'
import {
  XIAOHEI_PORTAL_ACTIVITY_EVENT,
  XIAOHEI_PORTAL_LAYER_ID,
  type XiaoheiPortalActivityDetail,
} from './portal.js'

export const XIAOHEI_GAZE_STYLE_ID = 'dsh-theme-xiaohei/gaze-style'

const POINTER_FULL_GAZE_RADIUS_PX = 360
const POINTER_GAZE_LIMIT_PX = 460
const PORTAL_FULL_GAZE_RADIUS_PX = 320
const PORTAL_GAZE_LIMIT_PX = 440
const EYE_CENTER_X = (69 + 109) / 2 / 256
const EYE_CENTER_Y = (105 + 108) / 2 / 256
const SETTLED_EPSILON = 0.015

interface Point {
  x: number
  y: number
}

interface GazeOffset {
  x: number
  y: number
}

/** Install a proximity gaze without keeping a permanent animation loop alive. */
export function installXiaoheiGaze(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc?.body === undefined || doc.defaultView === null) return () => {}

  const win = doc.defaultView
  doc.getElementById(XIAOHEI_GAZE_STYLE_ID)?.remove()

  const style = doc.createElement('style')
  style.id = XIAOHEI_GAZE_STYLE_ID
  style.textContent = XIAOHEI_GAZE_CSS
  doc.head.append(style)

  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)')
  const coarsePointer = win.matchMedia('(hover: none) and (pointer: coarse)')
  let disposed = false
  let pointer: Point | undefined
  let portalActive = false
  let gaze: HTMLSpanElement | undefined
  let mascot: HTMLElement | undefined
  let frameId = 0
  let lastFrameTime = 0
  let currentX = 0
  let currentY = 0

  const behaviorDisabled = (): boolean => reducedMotion.matches || coarsePointer.matches

  const setMoving = (moving: boolean): void => {
    if (gaze !== undefined) gaze.dataset.moving = String(moving)
  }

  const writeOffset = (): void => {
    if (gaze === undefined) return
    gaze.style.setProperty('--xiaohei-gaze-x', `${currentX.toFixed(3)}px`)
    gaze.style.setProperty('--xiaohei-gaze-y', `${currentY.toFixed(3)}px`)
  }

  const wake = (): void => {
    if (disposed || frameId !== 0 || gaze === undefined) return
    setMoving(true)
    frameId = win.requestAnimationFrame(tick)
  }

  const tick = (time: number): void => {
    frameId = 0
    if (disposed || gaze === undefined || mascot === undefined) return

    const target = resolveGazeTarget(doc, mascot, pointer, portalActive, behaviorDisabled())
    const elapsed = lastFrameTime === 0 ? 16 : Math.min(48, Math.max(1, time - lastFrameTime))
    const easing = 1 - Math.exp(-elapsed / 82)
    currentX += (target.x - currentX) * easing
    currentY += (target.y - currentY) * easing
    lastFrameTime = time

    if (Math.abs(target.x - currentX) < SETTLED_EPSILON) currentX = target.x
    if (Math.abs(target.y - currentY) < SETTLED_EPSILON) currentY = target.y
    writeOffset()

    const unsettled = currentX !== target.x || currentY !== target.y
    if (portalActive || unsettled) {
      frameId = win.requestAnimationFrame(tick)
      return
    }

    lastFrameTime = 0
    setMoving(false)
  }

  const attach = (): void => {
    const nextMascot = doc.querySelector<HTMLElement>('.xiaohei-scene__mascot') ?? undefined
    if (nextMascot === mascot && gaze?.isConnected === true) return

    gaze?.remove()
    gaze = undefined
    mascot = nextMascot
    if (nextMascot === undefined) return

    const viewport = nextMascot.querySelector<HTMLElement>('.xiaohei-scene__mascot-idle-viewport')
    if (viewport === null) return

    gaze = createGazeLayer(doc)
    viewport.append(gaze)
    writeOffset()
    wake()
  }

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') {
      pointer = undefined
    } else {
      pointer = { x: event.clientX, y: event.clientY }
    }
    wake()
  }

  const clearPointer = (): void => {
    pointer = undefined
    wake()
  }

  const onPortalActivity = (event: Event): void => {
    portalActive = Boolean((event as CustomEvent<XiaoheiPortalActivityDetail>).detail?.active)
    wake()
  }

  const onPreferenceChange = (): void => wake()
  const onStateChange = (): void => wake()

  const mountObserver = new win.MutationObserver(attach)
  mountObserver.observe(doc.body, { childList: true, subtree: true })
  const stateObserver = new win.MutationObserver(onStateChange)
  stateObserver.observe(doc.documentElement, {
    attributes: true,
    attributeFilter: ['data-xiaohei-state'],
  })

  doc.addEventListener('pointermove', onPointerMove, { passive: true })
  doc.addEventListener('pointerleave', clearPointer)
  doc.addEventListener(XIAOHEI_PORTAL_ACTIVITY_EVENT, onPortalActivity)
  win.addEventListener('blur', clearPointer)
  reducedMotion.addEventListener('change', onPreferenceChange)
  coarsePointer.addEventListener('change', onPreferenceChange)
  attach()

  return () => {
    disposed = true
    if (frameId !== 0) win.cancelAnimationFrame(frameId)
    mountObserver.disconnect()
    stateObserver.disconnect()
    doc.removeEventListener('pointermove', onPointerMove)
    doc.removeEventListener('pointerleave', clearPointer)
    doc.removeEventListener(XIAOHEI_PORTAL_ACTIVITY_EVENT, onPortalActivity)
    win.removeEventListener('blur', clearPointer)
    reducedMotion.removeEventListener('change', onPreferenceChange)
    coarsePointer.removeEventListener('change', onPreferenceChange)
    gaze?.remove()
    style.remove()
  }
}

function createGazeLayer(doc: Document): HTMLSpanElement {
  const layer = doc.createElement('span')
  layer.className = 'xiaohei-gaze'
  layer.dataset.moving = 'false'

  const base = doc.createElement('img')
  base.className = 'xiaohei-gaze__base'
  base.alt = ''
  base.decoding = 'async'
  base.fetchPriority = 'low'
  base.src = XIAOHEI_IDLE_EYE_BASE

  const leftPupil = doc.createElement('span')
  leftPupil.className = 'xiaohei-gaze__pupil xiaohei-gaze__pupil--left'
  const rightPupil = doc.createElement('span')
  rightPupil.className = 'xiaohei-gaze__pupil xiaohei-gaze__pupil--right'
  layer.append(base, leftPupil, rightPupil)
  return layer
}

function resolveGazeTarget(
  doc: Document,
  mascot: HTMLElement,
  pointer: Point | undefined,
  portalActive: boolean,
  disabled: boolean,
): GazeOffset {
  if (disabled || (doc.documentElement.getAttribute('data-xiaohei-state') ?? 'idle') !== 'idle') {
    return { x: 0, y: 0 }
  }

  const mascotRect = mascot.getBoundingClientRect()
  if (mascotRect.width <= 0 || mascotRect.height <= 0) return { x: 0, y: 0 }

  const eyeCenter = {
    x: mascotRect.left + mascotRect.width * EYE_CENTER_X,
    y: mascotRect.top + mascotRect.height * EYE_CENTER_Y,
  }
  const maximum = {
    x: clamp(5 * mascotRect.width / 256, 3.6, 5.2),
    y: clamp(3.2 * mascotRect.height / 256, 2.4, 3.35),
  }

  if (portalActive) {
    const portalLayer = doc.getElementById(XIAOHEI_PORTAL_LAYER_ID)
    const traveler = portalLayer?.querySelector<HTMLElement>('.xiaohei-portal__traveler')
    if (portalLayer?.dataset.running === 'true' && traveler !== null && traveler !== undefined) {
      const travelerRect = traveler.getBoundingClientRect()
      const portalTarget = {
        x: travelerRect.left + travelerRect.width / 2,
        y: travelerRect.top + travelerRect.height / 2,
      }
      const offset = offsetToward(
        eyeCenter,
        portalTarget,
        PORTAL_FULL_GAZE_RADIUS_PX,
        PORTAL_GAZE_LIMIT_PX,
        maximum,
      )
      if (offset !== undefined) return offset
    }
  }

  if (pointer !== undefined) {
    return offsetToward(
      eyeCenter,
      pointer,
      POINTER_FULL_GAZE_RADIUS_PX,
      POINTER_GAZE_LIMIT_PX,
      maximum,
    ) ?? { x: 0, y: 0 }
  }

  return { x: 0, y: 0 }
}

function offsetToward(
  origin: Point,
  target: Point,
  fullRadius: number,
  limitRadius: number,
  maximum: GazeOffset,
): GazeOffset | undefined {
  const dx = target.x - origin.x
  const dy = target.y - origin.y
  const distance = Math.hypot(dx, dy)
  if (distance >= limitRadius) return undefined
  if (distance < 0.001) return { x: 0, y: 0 }

  const fadeProgress = clamp((distance - fullRadius) / (limitRadius - fullRadius), 0, 1)
  const strength = 1 - smoothstep(fadeProgress)
  return {
    x: dx / distance * maximum.x * strength,
    y: dy / distance * maximum.y * strength,
  }
}

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value)
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}
