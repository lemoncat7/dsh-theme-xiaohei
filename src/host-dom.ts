/** A listener that reconciles plugin-owned DOM after the DSH host tree changes. */
export type XiaoheiHostDomListener = () => void

interface XiaoheiHostDomHub {
  listeners: Set<XiaoheiHostDomListener>
  observer?: MutationObserver
  queued: boolean
  frame?: number
}

const hubs = new WeakMap<Document, XiaoheiHostDomHub>()

/**
 * Share one batched body observer across all runtime theme behaviours.
 *
 * The Host owns the React tree and may replace slots at any time. Theme modules
 * subscribe here instead of observing the full document independently. The
 * first subscriber creates the observer and the last cleanup disconnects it.
 */
export function subscribeXiaoheiHostDom(
  doc: Document,
  listener: XiaoheiHostDomListener,
): () => void {
  const win = doc.defaultView
  if (doc.body === undefined || win === null || typeof win.MutationObserver !== 'function') {
    return () => {}
  }

  let hub = hubs.get(doc)
  if (hub === undefined) {
    const listeners = new Set<XiaoheiHostDomListener>()
    const nextHub: XiaoheiHostDomHub = {
      listeners,
      queued: false,
    }

    const flush = (): void => {
      nextHub.queued = false
      delete nextHub.frame
      if (hubs.get(doc) !== nextHub) return
      for (const subscriber of [...listeners]) {
        try {
          subscriber()
        } catch (error) {
          win.setTimeout(() => { throw error }, 0)
        }
      }
    }

    nextHub.observer = new win.MutationObserver(() => {
      if (nextHub.queued) return
      nextHub.queued = true
      // React can commit several batches within one frame. Do not run every
      // theme reconciler in each microtask before the host finishes layout.
      if (typeof win.requestAnimationFrame === 'function') nextHub.frame = win.requestAnimationFrame(flush)
      else queueMicrotask(flush)
    })
    nextHub.observer.observe(doc.body, { childList: true, subtree: true })
    hubs.set(doc, nextHub)
    hub = nextHub
  }

  hub.listeners.add(listener)
  let subscribed = true
  return () => {
    if (!subscribed) return
    subscribed = false
    const activeHub = hubs.get(doc)
    if (activeHub === undefined) return
    activeHub.listeners.delete(listener)
    if (activeHub.listeners.size > 0) return
    activeHub.observer?.disconnect()
    if (activeHub.frame !== undefined) win.cancelAnimationFrame(activeHub.frame)
    hubs.delete(doc)
  }
}
