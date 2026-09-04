import {
  XIAOHEI_HEIXIU_BLINK,
  XIAOHEI_HEIXIU_OPEN,
} from '../generated-keyart.js'
import { subscribeXiaoheiHostDom } from '../host-dom.js'
import { XIAOHEI_HOST_SELECTORS } from '../host-contract.js'
import {
  XIAOHEI_SCENE_CSS,
  XIAOHEI_SCENE_LAYER_ID,
  XIAOHEI_SCENE_STYLE_ID,
  XIAOHEI_SCENE_WORLD_CLASS,
} from './styles.js'

type XiaoheiWorldRenderer = (host: HTMLElement) => () => void
let worldRenderer: XiaoheiWorldRenderer | undefined

/** Register the browser-only world renderer without coupling shared scene code to raw assets. */
export function configureXiaoheiWorldRenderer(renderer: XiaoheiWorldRenderer): () => void {
  worldRenderer = renderer
  return () => {
    if (worldRenderer === renderer) worldRenderer = undefined
  }
}

const PARTS = [
  XIAOHEI_SCENE_WORLD_CLASS,
  'xiaohei-scene__heixiu-field',
] as const

/** Number of top-level decorative parts installed into the ambient layer. */
export const XIAOHEI_SCENE_PART_COUNT = PARTS.length

/** Skip host lookups while every companion remains attached to the document. */
export function shouldRestoreXiaoheiHeixiuCompanions(
  creatures: readonly Pick<Node, 'isConnected'>[],
): boolean {
  return creatures.some(creature => !creature.isConnected)
}

/**
 * Install the generated scene after plugin boot becomes idle. The theme tokens
 * apply immediately, while image decoding never extends DSH's loading screen.
 */
export function installXiaoheiScene(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc === undefined) return () => {}

  let disposed = false
  let removeMountedScene = (): void => {}
  let removeSidebarHeixiu = (): void => {}
  let removeWorld = (): void => {}

  const mount = (): void => {
    if (disposed) return

    removeWorld()
    removeWorld = () => {}
    doc.getElementById(XIAOHEI_SCENE_STYLE_ID)?.remove()
    doc.getElementById(XIAOHEI_SCENE_LAYER_ID)?.remove()

    const style = doc.createElement('style')
    style.id = XIAOHEI_SCENE_STYLE_ID
    style.textContent = XIAOHEI_SCENE_CSS
    doc.head.append(style)

    const layer = doc.createElement('div')
    layer.id = XIAOHEI_SCENE_LAYER_ID
    layer.setAttribute('aria-hidden', 'true')
    layer.setAttribute('data-xiaohei-scene', '')

    let worldHost: HTMLDivElement | undefined
    for (const className of PARTS) {
      if (className === XIAOHEI_SCENE_WORLD_CLASS) {
        worldHost = createWorldBackground(doc)
        layer.append(worldHost)
        continue
      }

      if (className === 'xiaohei-scene__heixiu-field') {
        layer.append(createHeixiuField(doc))
        continue
      }

      const part = doc.createElement('span')
      part.className = className
      layer.append(part)
    }

    doc.body.prepend(layer)
    if (worldHost !== undefined && worldRenderer !== undefined) {
      removeWorld = worldRenderer(worldHost)
    }
    removeSidebarHeixiu()
    removeSidebarHeixiu = installSidebarHeixiu(doc)
    removeMountedScene = () => {
      removeWorld()
      removeWorld = () => {}
      removeSidebarHeixiu()
      removeSidebarHeixiu = () => {}
      layer.remove()
      style.remove()
    }
  }

  const win = doc.defaultView
  let cancelSchedule = (): void => {}
  if (win !== null && typeof win.requestIdleCallback === 'function') {
    const idleId = win.requestIdleCallback(mount, { timeout: 800 })
    cancelSchedule = () => win.cancelIdleCallback(idleId)
  } else if (win !== null) {
    const timeoutId = win.setTimeout(mount, 0)
    cancelSchedule = () => win.clearTimeout(timeoutId)
  } else {
    mount()
  }

  return () => {
    disposed = true
    cancelSchedule()
    removeMountedScene()
  }
}

function createWorldBackground(doc: Document): HTMLDivElement {
  const world = doc.createElement('div')
  world.className = XIAOHEI_SCENE_WORLD_CLASS
  return world
}

function createHeixiuField(doc: Document): HTMLDivElement {
  const field = doc.createElement('div')
  field.className = 'xiaohei-scene__heixiu-field'

  field.append(
    createHeixiuCreature(doc, 'mascot'),
  )

  return field
}

function createHeixiuCreature(doc: Document, name: string): HTMLSpanElement {
  const creature = doc.createElement('span')
  creature.className = `xiaohei-scene__heixiu xiaohei-scene__heixiu--${name}`
  creature.setAttribute('aria-hidden', 'true')
  const body = doc.createElement('span')
  body.className = 'xiaohei-scene__heixiu-body'
  body.append(
    createHeixiuImage(doc, XIAOHEI_HEIXIU_OPEN, 'xiaohei-scene__heixiu-open'),
    createHeixiuImage(doc, XIAOHEI_HEIXIU_BLINK, 'xiaohei-scene__heixiu-blink'),
  )
  creature.append(body)
  return creature
}

function installSidebarHeixiu(doc: Document): () => void {
  const creature = createHeixiuCreature(doc, 'sidebar')
  let attachQueued = false

  const attach = (): void => {
    attachQueued = false
    const host = doc.querySelector<HTMLElement>(XIAOHEI_HOST_SELECTORS.sidebar)?.firstElementChild
    if (host !== null && host !== undefined && creature.parentElement !== host) host.append(creature)
  }

  const queueAttach = (): void => {
    if (attachQueued) return
    attachQueued = true
    queueMicrotask(attach)
  }

  const restoreDetachedCompanion = (): void => {
    if (!shouldRestoreXiaoheiHeixiuCompanions([creature])) return
    queueAttach()
  }

  attach()
  const unsubscribeHostDom = subscribeXiaoheiHostDom(doc, restoreDetachedCompanion)

  return () => {
    unsubscribeHostDom()
    creature.remove()
  }
}

function createHeixiuImage(doc: Document, source: string, className: string): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = className
  image.alt = ''
  image.decoding = 'async'
  image.fetchPriority = 'low'
  image.src = source
  return image
}
