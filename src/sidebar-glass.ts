import { XIAOHEI_SCENE_LAYER_ID } from './scene.js'
import { subscribeXiaoheiHostDom } from './host-dom.js'
import { XIAOHEI_HOST_SELECTORS } from './host-contract.js'

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
  let sidebarShell: HTMLElement | undefined
  let animationFrame: number | undefined
  let resizeSettleTimer: number | undefined
  let resizing = false
  let appliedBounds: XiaoheiSidebarGlassBounds | undefined

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
        markResizeActivity()
        scheduleReconcile()
      })
    : undefined

  const applyBounds = (): void => {
    if (glass === undefined || sidebarShell === undefined) return
    const bounds = resolveXiaoheiSidebarGlassBounds(sidebarShell.getBoundingClientRect())
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
  }

  const reconcile = (): void => {
    if (disposed) return

    const sceneLayer = doc.getElementById(XIAOHEI_SCENE_LAYER_ID)
    const nextSidebarShell = doc.querySelector<HTMLElement>(XIAOHEI_HOST_SELECTORS.sidebarShell) ?? undefined

    if (nextSidebarShell !== sidebarShell) {
      resizeObserver?.disconnect()
      sidebarShell = nextSidebarShell
      if (sidebarShell !== undefined) resizeObserver?.observe(sidebarShell)
    }

    if (sceneLayer === null || sidebarShell === undefined) {
      clearResizeState()
      glass?.remove()
      glass = undefined
      appliedBounds = undefined
      return
    }

    if (glass === undefined || glass.parentElement !== sceneLayer) {
      doc.getElementById(XIAOHEI_SIDEBAR_GLASS_ID)?.remove()
      glass = doc.createElement('div')
      glass.id = XIAOHEI_SIDEBAR_GLASS_ID
      glass.setAttribute('aria-hidden', 'true')
      appliedBounds = undefined

      const dawnKeyArt = sceneLayer.querySelector('.xiaohei-scene__keyart--dawn')
      sceneLayer.insertBefore(glass, dawnKeyArt?.nextSibling ?? sceneLayer.firstChild)
    }

    applyBounds()
  }

  function scheduleReconcile(): void {
    if (disposed || animationFrame !== undefined) return
    animationFrame = win.requestAnimationFrame(() => {
      animationFrame = undefined
      reconcile()
    })
  }

  const unsubscribeHostDom = subscribeXiaoheiHostDom(doc, scheduleReconcile)
  win.addEventListener('resize', scheduleReconcile, { passive: true })
  scheduleReconcile()

  return () => {
    disposed = true
    if (animationFrame !== undefined) win.cancelAnimationFrame(animationFrame)
    animationFrame = undefined
    unsubscribeHostDom()
    resizeObserver?.disconnect()
    win.removeEventListener('resize', scheduleReconcile)
    clearResizeState()
    glass?.remove()
    glass = undefined
    sidebarShell = undefined
    appliedBounds = undefined
  }
}
