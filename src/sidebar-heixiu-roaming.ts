export const XIAOHEI_SIDEBAR_ROAMING_STYLE_ID = 'dsh-theme-xiaohei/sidebar-heixiu-roaming-style'

const SIDEBAR_HEIXIU_SELECTOR = '.xiaohei-scene__heixiu--sidebar'
const SIDEBAR_SELECTOR = "[data-slot='sidebar']"
const INTERACTIVE_SELECTOR = [
  'button',
  'a[href]',
  "[role='treeitem']",
  "[role='menuitem']",
  "[tabindex]:not([tabindex='-1'])",
].join(',')

const EDGE_PADDING_PX = 10
const TOP_RESERVE_PX = 64
const BOTTOM_RESERVE_PX = 62
const CONTROL_PADDING_PX = 7
const DESTINATION_CANDIDATES = 28
const MIN_TRAVEL_PX = 42
const INITIAL_PAUSE_MS = 1800
const MIN_PAUSE_MS = 2600
const PAUSE_RANGE_MS = 3800

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

export interface XiaoheiSidebarRoamingSpace {
  width: number
  height: number
  creatureWidth: number
  creatureHeight: number
  controls: readonly Box[]
}

export const XIAOHEI_SIDEBAR_ROAMING_CSS = `
.xiaohei-scene__heixiu--sidebar[data-xiaohei-sidebar-roaming='true'] {
  left: 0;
  right: auto;
  top: 0;
  animation: none;
  transform: translate3d(
    var(--xiaohei-sidebar-heixiu-x, 7.15rem),
    var(--xiaohei-sidebar-heixiu-y, 8.05rem),
    0
  );
  transition: transform var(--xiaohei-sidebar-heixiu-duration, 0ms) cubic-bezier(0.22, 0.72, 0.24, 1);
  pointer-events: none;
  will-change: transform;
}

.xiaohei-scene__heixiu--sidebar[data-xiaohei-sidebar-roaming-paused='true'] {
  transition-duration: 0ms;
  will-change: auto;
}

@media (prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse) {
  .xiaohei-scene__heixiu--sidebar[data-xiaohei-sidebar-roaming='true'] {
    transform: translate3d(7.15rem, 8.05rem, 0);
    transition: none;
    will-change: auto;
  }
}
`

/** Pick a low-obstruction destination while retaining organic variation. */
export function chooseXiaoheiSidebarDestination(
  space: XiaoheiSidebarRoamingSpace,
  current: Point | undefined,
  random: () => number = Math.random,
): Point {
  const minX = EDGE_PADDING_PX
  const maxX = Math.max(minX, space.width - space.creatureWidth - EDGE_PADDING_PX)
  const minY = Math.min(TOP_RESERVE_PX, Math.max(EDGE_PADDING_PX, space.height - space.creatureHeight))
  const maxY = Math.max(minY, space.height - space.creatureHeight - BOTTOM_RESERVE_PX)
  const candidates: Array<{ point: Point; obstruction: number }> = []

  for (let index = 0; index < DESTINATION_CANDIDATES; index += 1) {
    const point = {
      x: minX + random() * (maxX - minX),
      y: minY + random() * (maxY - minY),
    }
    const travel = current === undefined ? Number.POSITIVE_INFINITY : Math.hypot(point.x - current.x, point.y - current.y)
    if (travel < MIN_TRAVEL_PX && index < DESTINATION_CANDIDATES - 1) continue
    candidates.push({ point, obstruction: destinationObstruction(point, space) })
  }

  candidates.sort((left, right) => left.obstruction - right.obstruction)
  const bestScore = candidates[0]?.obstruction
  const best = candidates.filter(candidate => candidate.obstruction === bestScore)
  return best[Math.min(best.length - 1, Math.floor(random() * best.length))]?.point ?? { x: minX, y: minY }
}

/** Longer trips get more time so the companion never darts across controls. */
export function resolveXiaoheiSidebarRoamDuration(from: Point, to: Point): number {
  const distance = Math.hypot(to.x - from.x, to.y - from.y)
  return Math.round(Math.min(5200, Math.max(2400, 2100 + distance * 8.5)))
}

/** Let the sidebar companion wander without owning scene construction. */
export function installXiaoheiSidebarHeixiuRoaming(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc?.head === undefined || doc.body === undefined || doc.defaultView === null) return () => {}

  const win = doc.defaultView
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)')
  const coarsePointer = win.matchMedia('(hover: none) and (pointer: coarse)')
  let disposed = false
  let creature: HTMLElement | undefined
  let host: HTMLElement | undefined
  let current: Point | undefined
  let roamTimer = 0
  let attachQueued = false
  let observedHost: HTMLElement | undefined

  doc.getElementById(XIAOHEI_SIDEBAR_ROAMING_STYLE_ID)?.remove()
  const style = doc.createElement('style')
  style.id = XIAOHEI_SIDEBAR_ROAMING_STYLE_ID
  style.textContent = XIAOHEI_SIDEBAR_ROAMING_CSS
  doc.head.append(style)

  const behaviorDisabled = (): boolean => (
    reducedMotion.matches
    || coarsePointer.matches
    || doc.visibilityState === 'hidden'
    || host === undefined
    || host.className.includes('_collapsed')
    || host.getBoundingClientRect().width < 80
  )

  const clearTimer = (): void => {
    win.clearTimeout(roamTimer)
    roamTimer = 0
  }

  const pause = (): void => {
    clearTimer()
    creature?.setAttribute('data-xiaohei-sidebar-roaming-paused', 'true')
  }

  const measureSpace = (): XiaoheiSidebarRoamingSpace | undefined => {
    if (host === undefined || creature === undefined) return undefined
    const hostRect = host.getBoundingClientRect()
    const creatureRect = creature.getBoundingClientRect()
    if (hostRect.width <= 0 || hostRect.height <= 0) return undefined
    const controls = Array.from(host.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR))
      .filter(element => !creature?.contains(element))
      .map(element => element.getBoundingClientRect())
      .filter(rect => rect.width > 0 && rect.height > 0)
      .map(rect => ({
        left: rect.left - hostRect.left - CONTROL_PADDING_PX,
        top: rect.top - hostRect.top - CONTROL_PADDING_PX,
        right: rect.right - hostRect.left + CONTROL_PADDING_PX,
        bottom: rect.bottom - hostRect.top + CONTROL_PADDING_PX,
      }))
    return {
      width: hostRect.width,
      height: hostRect.height,
      creatureWidth: creatureRect.width || 40,
      creatureHeight: creatureRect.height || 40,
      controls,
    }
  }

  const scheduleRoam = (delay = MIN_PAUSE_MS + Math.round(Math.random() * PAUSE_RANGE_MS)): void => {
    clearTimer()
    if (disposed || behaviorDisabled()) {
      pause()
      return
    }
    creature?.removeAttribute('data-xiaohei-sidebar-roaming-paused')
    roamTimer = win.setTimeout(roam, delay)
  }

  const roam = (): void => {
    roamTimer = 0
    if (disposed || behaviorDisabled() || creature === undefined) {
      pause()
      return
    }
    const space = measureSpace()
    if (space === undefined) {
      scheduleRoam()
      return
    }
    const destination = chooseXiaoheiSidebarDestination(space, current)
    const start = current ?? destination
    const duration = current === undefined ? 0 : resolveXiaoheiSidebarRoamDuration(start, destination)
    creature.style.setProperty('--xiaohei-sidebar-heixiu-duration', `${duration}ms`)
    creature.style.setProperty('--xiaohei-sidebar-heixiu-x', `${destination.x.toFixed(1)}px`)
    creature.style.setProperty('--xiaohei-sidebar-heixiu-y', `${destination.y.toFixed(1)}px`)
    current = destination
    scheduleRoam(duration + MIN_PAUSE_MS + Math.round(Math.random() * PAUSE_RANGE_MS))
  }

  const bind = (): void => {
    attachQueued = false
    if (disposed) return
    const nextCreature = doc.querySelector<HTMLElement>(SIDEBAR_HEIXIU_SELECTOR) ?? undefined
    const nextHost = doc.querySelector<HTMLElement>(SIDEBAR_SELECTOR)?.firstElementChild
    const nextHostElement = nextHost instanceof win.HTMLElement ? nextHost : undefined
    if (nextCreature === creature && nextHostElement === host) return

    if (creature !== undefined) {
      creature.removeAttribute('data-xiaohei-sidebar-roaming')
      creature.removeAttribute('data-xiaohei-sidebar-roaming-paused')
      creature.style.removeProperty('--xiaohei-sidebar-heixiu-duration')
      creature.style.removeProperty('--xiaohei-sidebar-heixiu-x')
      creature.style.removeProperty('--xiaohei-sidebar-heixiu-y')
    }
    clearTimer()
    creature = nextCreature
    host = nextHostElement
    current = undefined
    observeHostState()
    if (creature === undefined || host === undefined) return
    const hostRect = host.getBoundingClientRect()
    const creatureRect = creature.getBoundingClientRect()
    current = {
      x: creatureRect.left - hostRect.left,
      y: creatureRect.top - hostRect.top,
    }
    creature.style.setProperty('--xiaohei-sidebar-heixiu-duration', '0ms')
    creature.style.setProperty('--xiaohei-sidebar-heixiu-x', `${current.x.toFixed(1)}px`)
    creature.style.setProperty('--xiaohei-sidebar-heixiu-y', `${current.y.toFixed(1)}px`)
    creature.setAttribute('data-xiaohei-sidebar-roaming', 'true')
    scheduleRoam(INITIAL_PAUSE_MS)
  }

  const queueBind = (): void => {
    if (attachQueued || disposed) return
    attachQueued = true
    queueMicrotask(bind)
  }

  const resumeOrPause = (): void => {
    if (behaviorDisabled()) pause()
    else scheduleRoam(600)
  }

  const hostStateObserver = new win.MutationObserver(resumeOrPause)
  const hostResizeObserver = typeof win.ResizeObserver === 'function'
    ? new win.ResizeObserver(resumeOrPause)
    : undefined

  const observeHostState = (): void => {
    if (host === observedHost) return
    hostStateObserver.disconnect()
    hostResizeObserver?.disconnect()
    observedHost = host
    if (host === undefined) return
    hostStateObserver.observe(host, { attributes: true, attributeFilter: ['class'] })
    hostResizeObserver?.observe(host)
  }

  bind()
  const observer = new win.MutationObserver(queueBind)
  observer.observe(doc.body, { childList: true, subtree: true })
  doc.addEventListener('visibilitychange', resumeOrPause)
  win.addEventListener('resize', resumeOrPause, { passive: true })
  reducedMotion.addEventListener('change', resumeOrPause)
  coarsePointer.addEventListener('change', resumeOrPause)

  return () => {
    disposed = true
    clearTimer()
    observer.disconnect()
    hostStateObserver.disconnect()
    hostResizeObserver?.disconnect()
    doc.removeEventListener('visibilitychange', resumeOrPause)
    win.removeEventListener('resize', resumeOrPause)
    reducedMotion.removeEventListener('change', resumeOrPause)
    coarsePointer.removeEventListener('change', resumeOrPause)
    if (creature !== undefined) {
      creature.removeAttribute('data-xiaohei-sidebar-roaming')
      creature.removeAttribute('data-xiaohei-sidebar-roaming-paused')
      creature.style.removeProperty('--xiaohei-sidebar-heixiu-duration')
      creature.style.removeProperty('--xiaohei-sidebar-heixiu-x')
      creature.style.removeProperty('--xiaohei-sidebar-heixiu-y')
    }
    style.remove()
  }
}

function destinationObstruction(point: Point, space: XiaoheiSidebarRoamingSpace): number {
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
