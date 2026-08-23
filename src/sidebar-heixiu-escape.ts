const POINTER_ALERT_RADIUS_PX = 92
const ESCAPE_DESTINATION_CANDIDATES = 32
const ESCAPE_MIN_POINTER_DISTANCE_PX = 138
const ESCAPE_MIN_TRAVEL_PX = 96
const ESCAPE_ENTER_MS = 460
const ESCAPE_EXIT_MS = 540
const ESCAPE_COOLDOWN_MS = 1900
const ESCAPE_EDGE_PADDING_PX = 10

interface Point {
  x: number
  y: number
}

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

export interface XiaoheiSidebarEscapeSpace {
  width: number
  height: number
  creatureWidth: number
  creatureHeight: number
  controls: readonly Box[]
}

export interface XiaoheiSidebarEscapeTarget {
  creature: HTMLElement
  host: HTMLElement
  space: XiaoheiSidebarEscapeSpace
}

interface XiaoheiSidebarEscapeControllerOptions {
  doc: Document
  isDisabled: () => boolean
  resolveTarget: () => XiaoheiSidebarEscapeTarget | undefined
  onFreeze: (position: Point) => void
  onTeleport: (destination: Point) => void
  onComplete: (destination: Point) => void
}

export interface XiaoheiSidebarEscapeController {
  cancel: () => void
  dispose: () => void
  isRunning: () => boolean
}

export const XIAOHEI_SIDEBAR_ESCAPE_CSS = `
.xiaohei-sidebar-escape-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  overflow: hidden;
  contain: layout paint style;
  pointer-events: none;
}

.xiaohei-sidebar-escape-portal {
  position: absolute;
  left: var(--xiaohei-sidebar-portal-x, 50%);
  top: var(--xiaohei-sidebar-portal-y, 50%);
  display: block;
  width: 2rem;
  height: 2.8rem;
  border-radius: 48% 52% 45% 55% / 54% 46% 55% 45%;
  opacity: 0;
  background:
    radial-gradient(ellipse at 46% 50%, #010304 0%, #020608 57%, #0a2528 70%, rgb(77 194 171 / 40%) 77%, transparent 83%);
  box-shadow:
    inset 0 0 0.55rem rgb(0 0 0 / 94%),
    0 0 0.65rem rgb(76 201 177 / 16%);
  transform: translate3d(-50%, -50%, 0) rotate(var(--xiaohei-sidebar-portal-angle, 0deg)) scale3d(.06, .16, 1);
  transform-origin: center;
  will-change: transform, opacity;
}

.xiaohei-sidebar-escape-portal::after {
  position: absolute;
  inset: 14% 19%;
  display: block;
  content: '';
  border-radius: inherit;
  background: #000102;
  box-shadow: inset 0.15rem 0 0.36rem rgb(18 68 67 / 42%);
}

.xiaohei-sidebar-escape-layer[data-xiaohei-sidebar-escape-phase='enter']
  .xiaohei-sidebar-escape-portal--entry,
.xiaohei-sidebar-escape-layer[data-xiaohei-sidebar-escape-phase='exit']
  .xiaohei-sidebar-escape-portal--exit {
  animation: xiaohei-sidebar-escape-portal-open 520ms cubic-bezier(.2, .76, .24, 1) both;
}

.xiaohei-scene__heixiu--sidebar[data-xiaohei-sidebar-escape-phase]::before {
  opacity: 0;
}

.xiaohei-scene__heixiu--sidebar[data-xiaohei-sidebar-escape-phase]
  .xiaohei-scene__heixiu-body {
  position: absolute;
  inset: 0;
  display: block;
  transition: none;
  transform-origin: center;
  will-change: transform, opacity;
}

.xiaohei-scene__heixiu--sidebar[data-xiaohei-sidebar-escape-phase='enter']
  .xiaohei-scene__heixiu-body {
  animation: xiaohei-sidebar-heixiu-enter ${ESCAPE_ENTER_MS}ms cubic-bezier(.42, 0, .72, .38) both;
}

.xiaohei-scene__heixiu--sidebar[data-xiaohei-sidebar-escape-phase='exit']
  .xiaohei-scene__heixiu-body {
  animation: xiaohei-sidebar-heixiu-exit ${ESCAPE_EXIT_MS}ms cubic-bezier(.18, .76, .24, 1) both;
}

@keyframes xiaohei-sidebar-escape-portal-open {
  0% {
    opacity: 0;
    transform: translate3d(-50%, -50%, 0) rotate(var(--xiaohei-sidebar-portal-angle, 0deg)) scale3d(.06, .16, 1);
  }
  20%, 72% {
    opacity: .94;
    transform: translate3d(-50%, -50%, 0) rotate(var(--xiaohei-sidebar-portal-angle, 0deg)) scale3d(1, 1, 1);
  }
  100% {
    opacity: 0;
    transform: translate3d(-50%, -50%, 0) rotate(var(--xiaohei-sidebar-portal-angle, 0deg)) scale3d(.06, .16, 1);
  }
}

@keyframes xiaohei-sidebar-heixiu-enter {
  0%, 15% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
  70% { opacity: .82; }
  100% {
    transform: translate3d(var(--xiaohei-sidebar-escape-in-x), var(--xiaohei-sidebar-escape-in-y), 0) scale(.08);
    opacity: 0;
  }
}

@keyframes xiaohei-sidebar-heixiu-exit {
  0%, 16% {
    transform: translate3d(var(--xiaohei-sidebar-escape-out-x), var(--xiaohei-sidebar-escape-out-y), 0) scale(.08);
    opacity: 0;
  }
  38% { opacity: .72; }
  100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
}

html[data-xiaohei-appearance='light'] .xiaohei-sidebar-escape-portal {
  background:
    radial-gradient(ellipse at 46% 50%, #010304 0%, #030708 58%, #123231 70%, rgb(46 142 121 / 34%) 77%, transparent 83%);
  box-shadow:
    inset 0 0 0.55rem rgb(0 0 0 / 94%),
    0 0 0.58rem rgb(44 139 118 / 18%);
}

@media (prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse), (forced-colors: active) {
  .xiaohei-sidebar-escape-layer { display: none; }

  .xiaohei-scene__heixiu--sidebar[data-xiaohei-sidebar-escape-phase]
    .xiaohei-scene__heixiu-body {
    animation: none;
    will-change: auto;
  }
}
`

/** True when the pointer is close enough for the sidebar companion to flee. */
export function isXiaoheiSidebarPointerNear(pointer: Point, creatureCenter: Point): boolean {
  return Math.hypot(pointer.x - creatureCenter.x, pointer.y - creatureCenter.y) <= POINTER_ALERT_RADIUS_PX
}

/** Choose a low-obstruction endpoint that is meaningfully away from the pointer. */
export function chooseXiaoheiSidebarEscapeDestination(
  space: XiaoheiSidebarEscapeSpace,
  pointer: Point,
  current: Point,
  random: () => number = Math.random,
): Point {
  const minX = ESCAPE_EDGE_PADDING_PX
  const maxX = Math.max(minX, space.width - space.creatureWidth - ESCAPE_EDGE_PADDING_PX)
  const minY = Math.min(64, Math.max(ESCAPE_EDGE_PADDING_PX, space.height - space.creatureHeight))
  const maxY = Math.max(minY, space.height - space.creatureHeight - 62)
  const candidates: Point[] = [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: minX, y: maxY },
    { x: maxX, y: maxY },
  ]

  for (let index = 0; index < ESCAPE_DESTINATION_CANDIDATES; index += 1) {
    candidates.push({
      x: minX + random() * (maxX - minX),
      y: minY + random() * (maxY - minY),
    })
  }

  const centerOffset = { x: space.creatureWidth / 2, y: space.creatureHeight / 2 }
  const score = (candidate: Point): number => {
    const pointerDistance = Math.hypot(
      candidate.x + centerOffset.x - pointer.x,
      candidate.y + centerOffset.y - pointer.y,
    )
    const travel = Math.hypot(candidate.x - current.x, candidate.y - current.y)
    const obstruction = escapeDestinationObstruction(candidate, space)
    const pointerPenalty = pointerDistance < ESCAPE_MIN_POINTER_DISTANCE_PX
      ? (ESCAPE_MIN_POINTER_DISTANCE_PX - pointerDistance) * 7
      : 0
    const travelPenalty = travel < ESCAPE_MIN_TRAVEL_PX
      ? (ESCAPE_MIN_TRAVEL_PX - travel) * 4
      : 0
    return pointerDistance * 2.7 + travel * .25 - obstruction * .12 - pointerPenalty - travelPenalty
  }

  return candidates.reduce((best, candidate) => score(candidate) > score(best) ? candidate : best)
}

/** Own pointer proximity and the enter/exit portal sequence; roaming owns position. */
export function createXiaoheiSidebarEscapeController(
  options: XiaoheiSidebarEscapeControllerOptions,
): XiaoheiSidebarEscapeController {
  const { doc } = options
  const win = doc.defaultView
  if (win === null) return { cancel: () => {}, dispose: () => {}, isRunning: () => false }

  let disposed = false
  let running = false
  let frameId = 0
  let phaseTimer = 0
  let cooldownUntil = 0
  let pointer: Point | undefined
  let layer: HTMLDivElement | undefined
  let activeCreature: HTMLElement | undefined
  let destination: Point | undefined

  const clearPhaseTimer = (): void => {
    win.clearTimeout(phaseTimer)
    phaseTimer = 0
  }

  const removeVisuals = (): void => {
    layer?.remove()
    layer = undefined
    if (activeCreature !== undefined) {
      activeCreature.removeAttribute('data-xiaohei-sidebar-escape-phase')
      activeCreature.style.removeProperty('--xiaohei-sidebar-escape-in-x')
      activeCreature.style.removeProperty('--xiaohei-sidebar-escape-in-y')
      activeCreature.style.removeProperty('--xiaohei-sidebar-escape-out-x')
      activeCreature.style.removeProperty('--xiaohei-sidebar-escape-out-y')
    }
    activeCreature = undefined
  }

  const finish = (notify: boolean): void => {
    clearPhaseTimer()
    const completedDestination = destination
    destination = undefined
    running = false
    removeVisuals()
    if (notify && completedDestination !== undefined) options.onComplete(completedDestination)
  }

  const startEscape = (target: XiaoheiSidebarEscapeTarget, point: Point): void => {
    const hostRect = target.host.getBoundingClientRect()
    const creatureRect = target.creature.getBoundingClientRect()
    const current = {
      x: creatureRect.left - hostRect.left,
      y: creatureRect.top - hostRect.top,
    }
    const localPointer = { x: point.x - hostRect.left, y: point.y - hostRect.top }
    const nextDestination = chooseXiaoheiSidebarEscapeDestination(
      target.space,
      localPointer,
      current,
    )
    const currentCenter = {
      x: current.x + target.space.creatureWidth / 2,
      y: current.y + target.space.creatureHeight / 2,
    }
    const nextCenter = {
      x: nextDestination.x + target.space.creatureWidth / 2,
      y: nextDestination.y + target.space.creatureHeight / 2,
    }
    const entryDirection = unitVector(currentCenter.x - localPointer.x, currentCenter.y - localPointer.y)
    const exitDirection = unitVector(nextCenter.x - localPointer.x, nextCenter.y - localPointer.y)
    const entryShift = { x: entryDirection.x * 12, y: entryDirection.y * 12 }
    const exitShift = { x: -exitDirection.x * 10, y: -exitDirection.y * 10 }

    running = true
    cooldownUntil = win.performance.now() + ESCAPE_ENTER_MS + ESCAPE_EXIT_MS + ESCAPE_COOLDOWN_MS
    destination = nextDestination
    activeCreature = target.creature
    options.onFreeze(current)

    layer = createEscapeLayer(doc, {
      entry: {
        x: currentCenter.x + entryShift.x,
        y: currentCenter.y + entryShift.y,
        angle: Math.atan2(entryDirection.y, entryDirection.x) * 180 / Math.PI,
      },
      exit: {
        x: nextCenter.x + exitShift.x,
        y: nextCenter.y + exitShift.y,
        angle: Math.atan2(exitDirection.y, exitDirection.x) * 180 / Math.PI,
      },
    })
    target.host.append(layer)
    target.creature.style.setProperty('--xiaohei-sidebar-escape-in-x', `${entryShift.x.toFixed(2)}px`)
    target.creature.style.setProperty('--xiaohei-sidebar-escape-in-y', `${entryShift.y.toFixed(2)}px`)
    target.creature.style.setProperty('--xiaohei-sidebar-escape-out-x', `${exitShift.x.toFixed(2)}px`)
    target.creature.style.setProperty('--xiaohei-sidebar-escape-out-y', `${exitShift.y.toFixed(2)}px`)
    target.creature.setAttribute('data-xiaohei-sidebar-escape-phase', 'enter')
    layer.setAttribute('data-xiaohei-sidebar-escape-phase', 'enter')

    phaseTimer = win.setTimeout(() => {
      phaseTimer = 0
      if (disposed || !running || destination === undefined || layer === undefined || activeCreature === undefined) return
      options.onTeleport(destination)
      activeCreature.setAttribute('data-xiaohei-sidebar-escape-phase', 'exit')
      layer.setAttribute('data-xiaohei-sidebar-escape-phase', 'exit')
      phaseTimer = win.setTimeout(() => finish(true), ESCAPE_EXIT_MS)
    }, ESCAPE_ENTER_MS)
  }

  const inspectPointer = (): void => {
    frameId = 0
    if (disposed || running || pointer === undefined || options.isDisabled()) return
    if (win.performance.now() < cooldownUntil) return
    const target = options.resolveTarget()
    if (target === undefined) return
    const rect = target.creature.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return
    const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    if (isXiaoheiSidebarPointerNear(pointer, center)) startEscape(target, pointer)
  }

  const queueInspection = (): void => {
    if (disposed || frameId !== 0) return
    frameId = win.requestAnimationFrame(inspectPointer)
  }

  const onPointerMove = (event: PointerEvent): void => {
    pointer = event.pointerType === 'touch' ? undefined : { x: event.clientX, y: event.clientY }
    queueInspection()
  }

  const clearPointer = (): void => {
    pointer = undefined
  }

  doc.addEventListener('pointermove', onPointerMove, { passive: true })
  doc.addEventListener('pointerleave', clearPointer)
  win.addEventListener('blur', clearPointer)

  return {
    cancel: () => finish(false),
    dispose: () => {
      disposed = true
      if (frameId !== 0) win.cancelAnimationFrame(frameId)
      doc.removeEventListener('pointermove', onPointerMove)
      doc.removeEventListener('pointerleave', clearPointer)
      win.removeEventListener('blur', clearPointer)
      finish(false)
    },
    isRunning: () => running,
  }
}

function createEscapeLayer(
  doc: Document,
  portals: { entry: Point & { angle: number }; exit: Point & { angle: number } },
): HTMLDivElement {
  const layer = doc.createElement('div')
  layer.className = 'xiaohei-sidebar-escape-layer'
  layer.setAttribute('aria-hidden', 'true')
  layer.append(
    createPortal(doc, 'entry', portals.entry),
    createPortal(doc, 'exit', portals.exit),
  )
  return layer
}

function createPortal(
  doc: Document,
  kind: 'entry' | 'exit',
  point: Point & { angle: number },
): HTMLSpanElement {
  const portal = doc.createElement('span')
  portal.className = `xiaohei-sidebar-escape-portal xiaohei-sidebar-escape-portal--${kind}`
  portal.style.setProperty('--xiaohei-sidebar-portal-x', `${point.x.toFixed(1)}px`)
  portal.style.setProperty('--xiaohei-sidebar-portal-y', `${point.y.toFixed(1)}px`)
  portal.style.setProperty('--xiaohei-sidebar-portal-angle', `${point.angle.toFixed(1)}deg`)
  return portal
}

function escapeDestinationObstruction(point: Point, space: XiaoheiSidebarEscapeSpace): number {
  const creature = {
    left: point.x,
    top: point.y,
    right: point.x + space.creatureWidth,
    bottom: point.y + space.creatureHeight,
  }
  return space.controls.reduce((total, control) => total + overlapArea(creature, control), 0)
}

function overlapArea(left: Box, right: Box): number {
  const width = Math.max(0, Math.min(left.right, right.right) - Math.max(left.left, right.left))
  const height = Math.max(0, Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top))
  return width * height
}

function unitVector(x: number, y: number): Point {
  const length = Math.hypot(x, y)
  return length <= .001 ? { x: 1, y: 0 } : { x: x / length, y: y / length }
}
