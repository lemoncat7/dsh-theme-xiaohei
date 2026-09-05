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
] as const

/** Number of top-level decorative parts installed into the ambient layer. */
export const XIAOHEI_SCENE_PART_COUNT = PARTS.length

/**
 * Install the static wallpaper after plugin boot becomes idle. Appearance is
 * CSS-driven; no image load handlers or per-frame character animation.
 */
export function installXiaoheiScene(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc === undefined) return () => {}

  let disposed = false
  let removeMountedScene = (): void => {}
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

      const part = doc.createElement('span')
      part.className = className
      layer.append(part)
    }

    doc.body.prepend(layer)
    if (worldHost !== undefined && worldRenderer !== undefined) {
      removeWorld = worldRenderer(worldHost)
    }
    removeMountedScene = () => {
      removeWorld()
      removeWorld = () => {}
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
