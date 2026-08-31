import { XIAOHEI_HEIXIU_BLINK, XIAOHEI_HEIXIU_OPEN } from './generated-keyart.js'
import { XIAOHEI_PORTAL_CSS } from './chrome/portal.js'
import { subscribeXiaoheiHostDom } from './host-dom.js'
import { XIAOHEI_HOST_SELECTORS } from './host-contract.js'
import { XIAOHEI_SCENE_LAYER_ID, XIAOHEI_SCENE_WORLD_CLASS } from './scene.js'

export const XIAOHEI_PORTAL_STYLE_ID = 'dsh-theme-xiaohei/portal-style'
export const XIAOHEI_PORTAL_LAYER_ID = 'dsh-theme-xiaohei/portal-layer'
export const XIAOHEI_PORTAL_DURATION_MS = 2600
export const XIAOHEI_PORTAL_ACTIVITY_EVENT = 'dsh-theme-xiaohei:portal-activity'
export const XIAOHEI_PORTAL_PROXIMITY_EVENT = 'dsh-theme-xiaohei:portal-proximity'

export interface XiaoheiPortalActivityDetail {
  active: boolean
}

export interface XiaoheiPortalProximityDetail {
  active: boolean
  target?: { x: number; y: number }
}

const INITIAL_VISIT_DELAY_MS = 1800
const VISIT_MIN_DELAY_MS = 12_000
const VISIT_DELAY_RANGE_MS = 9000
const INTERACTION_RADIUS_PX = 420
const INTERACTION_DURATION_MS = 520
const ENTRY_INTERACTION_DELAY_MS = Math.round(XIAOHEI_PORTAL_DURATION_MS * 0.22)
const EXIT_INTERACTION_DELAY_MS = Math.round(XIAOHEI_PORTAL_DURATION_MS * 0.76)

interface PortalPoint {
  x: number
  y: number
  angle: number
}

interface PortalInteraction {
  phase: 'entry' | 'exit'
  target: { x: number; y: number }
  delayMs: number
}

interface RectLike {
  left: number
  top: number
  width: number
  height: number
}

/** Resolve the closest visible portal phase without overlapping distant visits. */
export function resolveXiaoheiPortalInteraction(
  start: PortalPoint,
  finish: PortalPoint,
  mascotRect: RectLike,
): PortalInteraction | undefined {
  const head = {
    x: mascotRect.left + mascotRect.width * 0.35,
    y: mascotRect.top + mascotRect.height * 0.42,
  }
  const candidates: PortalInteraction[] = [
    { phase: 'entry', target: { x: start.x, y: start.y }, delayMs: ENTRY_INTERACTION_DELAY_MS },
    { phase: 'exit', target: { x: finish.x, y: finish.y }, delayMs: EXIT_INTERACTION_DELAY_MS },
  ]
  const distance = (candidate: PortalInteraction): number => Math.hypot(
    candidate.target.x - head.x,
    candidate.target.y - head.y,
  )
  const nearest = distance(candidates[0]!) <= distance(candidates[1]!)
    ? candidates[0]!
    : candidates[1]!
  return distance(nearest) <= INTERACTION_RADIUS_PX ? nearest : undefined
}

/** Install ambient random visits without coupling them to conversation state. */
export function installXiaoheiPortalTransit(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc?.body === undefined || doc.defaultView === null) return () => {}

  doc.getElementById(XIAOHEI_PORTAL_STYLE_ID)?.remove()
  doc.getElementById(XIAOHEI_PORTAL_LAYER_ID)?.remove()

  const style = doc.createElement('style')
  style.id = XIAOHEI_PORTAL_STYLE_ID
  style.textContent = XIAOHEI_PORTAL_CSS
  doc.head.append(style)

  const layer = doc.createElement('div')
  layer.id = XIAOHEI_PORTAL_LAYER_ID
  layer.setAttribute('aria-hidden', 'true')
  layer.dataset.running = 'false'

  const entry = doc.createElement('span')
  entry.className = 'xiaohei-portal__void xiaohei-portal__void--entry'
  const exit = doc.createElement('span')
  exit.className = 'xiaohei-portal__void xiaohei-portal__void--exit'
  const traveler = doc.createElement('span')
  traveler.className = 'xiaohei-portal__traveler'
  traveler.append(
    createTravelerImage(doc, XIAOHEI_HEIXIU_OPEN, 'xiaohei-portal__traveler-open'),
    createTravelerImage(doc, XIAOHEI_HEIXIU_BLINK, 'xiaohei-portal__traveler-blink'),
  )
  layer.append(entry, exit, traveler)

  const win = doc.defaultView
  let disposed = false
  let animationTimer = 0
  let visitTimer = 0
  let interactionStartTimer = 0
  let interactionEndTimer = 0
  let interactionActive = false
  let visitsStarted = false

  const mount = (): boolean => {
    const scene = doc.getElementById(XIAOHEI_SCENE_LAYER_ID)
    if (scene === null) return false
    if (layer.parentElement !== scene) {
      const world = scene.querySelector(`.${XIAOHEI_SCENE_WORLD_CLASS}`)
      scene.insertBefore(layer, world?.nextSibling ?? scene.firstChild)
    }
    return true
  }

  const clearTimer = (timer: number): void => {
    if (timer !== 0) win.clearTimeout(timer)
  }

  const endInteraction = (): void => {
    clearTimer(interactionStartTimer)
    clearTimer(interactionEndTimer)
    interactionStartTimer = 0
    interactionEndTimer = 0
    if (!interactionActive) return
    interactionActive = false
    dispatchPortalProximity(doc, false)
  }

  const scheduleVisit = (initial = false): void => {
    clearTimer(visitTimer)
    if (disposed) return
    const delay = initial
      ? INITIAL_VISIT_DELAY_MS
      : VISIT_MIN_DELAY_MS + Math.round(Math.random() * VISIT_DELAY_RANGE_MS)
    visitTimer = win.setTimeout(play, delay)
  }

  const play = (): void => {
    if (disposed || layer.dataset.running === 'true' || !mount()) return
    endInteraction()
    const [start, finish] = choosePortalPoints(doc)
    const styleMap = layer.style
    styleMap.setProperty('--portal-entry-x', `${start.x}px`)
    styleMap.setProperty('--portal-entry-y', `${start.y}px`)
    styleMap.setProperty('--portal-exit-x', `${finish.x}px`)
    styleMap.setProperty('--portal-exit-y', `${finish.y}px`)
    styleMap.setProperty('--portal-entry-angle', `${start.angle}deg`)
    styleMap.setProperty('--portal-exit-angle', `${finish.angle}deg`)
    styleMap.setProperty('--portal-travel-x', `${finish.x - start.x}px`)
    styleMap.setProperty('--portal-travel-y', `${finish.y - start.y}px`)
    const emergeDirection = finish.x < win.innerWidth / 2 ? -1 : 1
    styleMap.setProperty('--portal-emerge-near', `${emergeDirection * 20}px`)
    styleMap.setProperty('--portal-emerge-far', `${emergeDirection * 69}px`)
    styleMap.setProperty('--portal-emerge-end', `${emergeDirection * 86}px`)
    layer.dataset.running = 'false'
    void layer.offsetWidth
    layer.dataset.running = 'true'
    dispatchPortalActivity(doc, true)
    const mascotRect = doc.querySelector<HTMLElement>('.xiaohei-scene__mascot')?.getBoundingClientRect()
    const interaction = mascotRect === undefined
      ? undefined
      : resolveXiaoheiPortalInteraction(start, finish, mascotRect)
    layer.dataset.interaction = interaction?.phase ?? 'none'
    if (interaction !== undefined) {
      interactionStartTimer = win.setTimeout(() => {
        interactionStartTimer = 0
        if (disposed || layer.dataset.running !== 'true') return
        interactionActive = true
        dispatchPortalProximity(doc, true, interaction.target)
        interactionEndTimer = win.setTimeout(endInteraction, INTERACTION_DURATION_MS)
      }, interaction.delayMs)
    }
    clearTimer(animationTimer)
    animationTimer = win.setTimeout(() => {
      animationTimer = 0
      if (disposed) return
      endInteraction()
      layer.dataset.running = 'false'
      dispatchPortalActivity(doc, false)
      scheduleVisit()
    }, XIAOHEI_PORTAL_DURATION_MS)
  }

  const startVisits = (): void => {
    if (visitsStarted || disposed) return
    visitsStarted = true
    scheduleVisit(true)
  }

  let unsubscribeHostDom = (): void => {}
  if (mount()) {
    startVisits()
  } else {
    unsubscribeHostDom = subscribeXiaoheiHostDom(doc, () => {
      if (!mount()) return
      unsubscribeHostDom()
      startVisits()
    })
  }

  return () => {
    disposed = true
    clearTimer(animationTimer)
    clearTimer(visitTimer)
    endInteraction()
    unsubscribeHostDom()
    if (layer.dataset.running === 'true') dispatchPortalActivity(doc, false)
    layer.remove()
    style.remove()
  }
}

function dispatchPortalProximity(
  doc: Document,
  active: boolean,
  target?: { x: number; y: number },
): void {
  const EventConstructor = doc.defaultView?.CustomEvent
  if (EventConstructor === undefined) return
  doc.dispatchEvent(new EventConstructor<XiaoheiPortalProximityDetail>(XIAOHEI_PORTAL_PROXIMITY_EVENT, {
    detail: target === undefined ? { active } : { active, target },
  }))
}

function dispatchPortalActivity(doc: Document, active: boolean): void {
  const EventConstructor = doc.defaultView?.CustomEvent
  if (EventConstructor === undefined) return
  doc.dispatchEvent(new EventConstructor<XiaoheiPortalActivityDetail>(XIAOHEI_PORTAL_ACTIVITY_EVENT, {
    detail: { active },
  }))
}

function createTravelerImage(doc: Document, source: string, className: string): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = className
  image.alt = ''
  image.decoding = 'async'
  image.fetchPriority = 'low'
  image.src = source
  return image
}

/** Pick separated positions from background-biased zones, away from key UI. */
function choosePortalPoints(doc: Document): [PortalPoint, PortalPoint] {
  const win = doc.defaultView
  const width = Math.max(640, win?.innerWidth ?? 1280)
  const height = Math.max(480, win?.innerHeight ?? 720)
  const sidebarRight = doc.querySelector(XIAOHEI_HOST_SELECTORS.sidebar)?.getBoundingClientRect().right ?? 0
  const composerRect = doc.querySelector(XIAOHEI_HOST_SELECTORS.composerCard)?.getBoundingClientRect()
  const contentLeft = composerRect?.left ?? width * 0.37
  const contentRight = composerRect?.right ?? width * 0.77
  const leftMin = Math.max(sidebarRight + 80, 90)
  const leftMax = Math.max(leftMin + 60, contentLeft - 90)
  const rightMin = Math.min(width - 150, contentRight + 90)
  const rightMax = width - 90
  const minY = 100
  const maxY = height - 130

  const point = (side: 'left' | 'right'): PortalPoint => {
    const start = side === 'left' ? leftMin : rightMin
    const end = side === 'left' ? leftMax : rightMax
    const x = start + Math.random() * Math.max(40, end - start)
    const y = minY + Math.random() * Math.max(120, maxY - minY)
    return { x, y, angle: -8 + Math.round(Math.random() * 16) }
  }

  const leftFirst = Math.random() > 0.5
  return leftFirst ? [point('left'), point('right')] : [point('right'), point('left')]
}
