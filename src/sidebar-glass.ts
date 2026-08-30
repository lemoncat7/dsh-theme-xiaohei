import { XIAOHEI_SCENE_LAYER_ID } from './scene.js'
import { XIAOHEI_SIDEBAR_ATMOSPHERE } from './generated-sidebar-assets.js'
import { subscribeXiaoheiHostDom } from './host-dom.js'
import { XIAOHEI_HOST_SELECTORS } from './host-contract.js'

/** Stable id for the paint-only glass surface behind DSH's native sidebar. */
export const XIAOHEI_SIDEBAR_GLASS_ID = 'dsh-theme-xiaohei/sidebar-glass'

const HORIZONTAL_INSET_START = 7
const HORIZONTAL_INSET_END = 7
const VERTICAL_INSET = 8

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

  const resizeObserver = typeof win.ResizeObserver === 'function'
    ? new win.ResizeObserver(() => scheduleReconcile())
    : undefined

  const applyBounds = (): void => {
    if (glass === undefined || sidebarShell === undefined) return
    const bounds = resolveXiaoheiSidebarGlassBounds(sidebarShell.getBoundingClientRect())
    glass.style.setProperty('--xiaohei-sidebar-glass-left', `${bounds.left}px`)
    glass.style.setProperty('--xiaohei-sidebar-glass-top', `${bounds.top}px`)
    glass.style.setProperty('--xiaohei-sidebar-glass-width', `${bounds.width}px`)
    glass.style.setProperty('--xiaohei-sidebar-glass-height', `${bounds.height}px`)
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
      glass?.remove()
      glass = undefined
      return
    }

    if (glass === undefined || glass.parentElement !== sceneLayer) {
      doc.getElementById(XIAOHEI_SIDEBAR_GLASS_ID)?.remove()
      glass = doc.createElement('div')
      glass.id = XIAOHEI_SIDEBAR_GLASS_ID
      glass.setAttribute('aria-hidden', 'true')

      const atmosphere = doc.createElement('img')
      atmosphere.className = 'xiaohei-sidebar-atmosphere'
      atmosphere.alt = ''
      atmosphere.decoding = 'async'
      atmosphere.fetchPriority = 'low'
      atmosphere.src = XIAOHEI_SIDEBAR_ATMOSPHERE
      glass.append(atmosphere)

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
    glass?.remove()
    glass = undefined
    sidebarShell = undefined
  }
}
