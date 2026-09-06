import { XIAOHEI_SCENE_LAYER_ID, XIAOHEI_SCENE_WORLD_CLASS } from './scene.js'
import { subscribeXiaoheiHostDom } from './host-dom.js'
import { XIAOHEI_HOST_SELECTORS } from './host-contract.js'
import { createSidebarReveal } from './sidebar-reveal.js'

/** Stable id for the paint-only glass surface behind DSH's native sidebar. */
export const XIAOHEI_SIDEBAR_GLASS_ID = 'dsh-theme-xiaohei/sidebar-glass'

const HORIZONTAL_INSET_START = 7
const HORIZONTAL_INSET_END = 7
const VERTICAL_INSET = 8
const RESIZE_SETTLE_MS = 120

export interface XiaoheiSidebarGlassBounds {
  left: number
  top: number
  width: number
  height: number
}

/** Keep the visual surface inside the native sidebar without changing layout. */
export function resolveXiaoheiSidebarGlassBounds(
  rect: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>,
): XiaoheiSidebarGlassBounds {
  return {
    left: rect.left + HORIZONTAL_INSET_START,
    top: rect.top + VERTICAL_INSET,
    width: Math.max(0, rect.width - HORIZONTAL_INSET_START - HORIZONTAL_INSET_END),
    height: Math.max(0, rect.height - VERTICAL_INSET * 2),
  }
}

/**
 * Mount a visual-only glass surface in the scene layer. It mirrors the native
 * sidebar geometry but never becomes an ancestor of controls or fixed dialogs.
 */
export function installXiaoheiSidebarGlass(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc === undefined) return () => {}

  const browserWindow = doc.defaultView
  if (browserWindow === null) return () => {}
  const win: Window & typeof globalThis = browserWindow

  let disposed = false
  let glass: HTMLElement | undefined
  let sidebarColumn: HTMLElement | undefined
  let animationFrame: number | undefined
  let resizeSettleTimer: number | undefined
  let resizing = false
  let appliedBounds: XiaoheiSidebarGlassBounds | undefined
  let geometryDirty = true
  const reveal = createSidebarReveal(doc)

  const clearResizeState = (): void => {
    if (resizeSettleTimer !== undefined) win.clearTimeout(resizeSettleTimer)
    resizeSettleTimer = undefined
    resizing = false
    doc.documentElement.removeAttribute('data-xiaohei-sidebar-resizing')
  }

  const markResizeActivity = (): void => {
    if (glass === undefined) return
    if (!resizing) {
      resizing = true
      doc.documentElement.setAttribute('data-xiaohei-sidebar-resizing', '')
    }
    if (resizeSettleTimer !== undefined) win.clearTimeout(resizeSettleTimer)
    resizeSettleTimer = win.setTimeout(() => {
      resizeSettleTimer = undefined
      resizing = false
      doc.documentElement.removeAttribute('data-xiaohei-sidebar-resizing')
    }, RESIZE_SETTLE_MS)
  }

  const resizeObserver = typeof win.ResizeObserver === 'function'
    ? new win.ResizeObserver(() => {
        if (disposed) return
        // RO runs after host layout and before paint. Update the independent
        // paint layer now, not in next frame's RAF (which visibly trails).
        const changed = applyBounds()
        geometryDirty = false
        if (changed) markResizeActivity()
      })
    : undefined

  const applyBounds = (): boolean => {
    if (glass === undefined || sidebarColumn === undefined) return false
    const bounds = resolveXiaoheiSidebarGlassBounds(sidebarColumn.getBoundingClientRect())
    reveal.resize(bounds.width + HORIZONTAL_INSET_START + HORIZONTAL_INSET_END)
    const changed = appliedBounds !== undefined && (
      bounds.left !== appliedBounds.left || bounds.top !== appliedBounds.top ||
      bounds.width !== appliedBounds.width || bounds.height !== appliedBounds.height)
    if (bounds.left !== appliedBounds?.left) {
      glass.style.setProperty('--xiaohei-sidebar-glass-left', `${bounds.left}px`)
    }
    if (bounds.top !== appliedBounds?.top) {
      glass.style.setProperty('--xiaohei-sidebar-glass-top', `${bounds.top}px`)
    }
    if (bounds.width !== appliedBounds?.width) {
      glass.style.setProperty('--xiaohei-sidebar-glass-width', `${bounds.width}px`)
    }
    if (bounds.height !== appliedBounds?.height) {
      glass.style.setProperty('--xiaohei-sidebar-glass-height', `${bounds.height}px`)
    }
    appliedBounds = bounds
    return changed
  }

  const reconcile = (): void => {
    if (disposed) return

    const sceneLayer = doc.getElementById(XIAOHEI_SCENE_LAYER_ID)
    const nextSidebarColumn = doc.querySelector<HTMLElement>(XIAOHEI_HOST_SELECTORS.sidebarColumn) ?? undefined

    if (nextSidebarColumn !== sidebarColumn) {
      resizeObserver?.disconnect()
      sidebarColumn = nextSidebarColumn
      geometryDirty = true
      if (sidebarColumn !== undefined) resizeObserver?.observe(sidebarColumn)
    }

    if (sceneLayer === null || sidebarColumn === undefined) {
      reveal.setColumn(undefined)
      clearResizeState()
      glass?.remove()
      glass = undefined
      appliedBounds = undefined
      geometryDirty = true
      return
    }
    reveal.setColumn(sidebarColumn)

    if (glass === undefined || glass.parentElement !== sceneLayer) {
      doc.getElementById(XIAOHEI_SIDEBAR_GLASS_ID)?.remove()
      glass = doc.createElement('div')
      glass.id = XIAOHEI_SIDEBAR_GLASS_ID
      glass.setAttribute('aria-hidden', 'true')
      appliedBounds = undefined
      geometryDirty = true

      const world = sceneLayer.querySelector(`.${XIAOHEI_SCENE_WORLD_CLASS}`)
      // null is meaningful here: insertBefore(node, null) appends after a
      // last-child wallpaper. Falling back to firstChild hides glass UNDER it.
      sceneLayer.insertBefore(glass, world !== null ? world.nextSibling : sceneLayer.firstChild)
    }

    // Streamed text mutates the host tree frequently. Recheck slot identity,
    // but do not force layout unless sidebar geometry actually changed.
    if (geometryDirty) {
      applyBounds()
      geometryDirty = false
    }
  }

  function scheduleReconcile(): void {
    if (disposed || animationFrame !== undefined) return
    animationFrame = win.requestAnimationFrame(() => {
      animationFrame = undefined
      reconcile()
    })
  }

  const unsubscribeHostDom = subscribeXiaoheiHostDom(doc, scheduleReconcile)
  const onViewportResize = (): void => {
    geometryDirty = true
    scheduleReconcile()
  }
  win.addEventListener('resize', onViewportResize, { passive: true })
  scheduleReconcile()

  return () => {
    disposed = true
    if (animationFrame !== undefined) win.cancelAnimationFrame(animationFrame)
    animationFrame = undefined
    unsubscribeHostDom()
    resizeObserver?.disconnect()
    reveal.dispose()
    win.removeEventListener('resize', onViewportResize)
    clearResizeState()
    glass?.remove()
    glass = undefined
    sidebarColumn = undefined
    appliedBounds = undefined
  }
}
