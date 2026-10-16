import { subscribeXiaoheiHostDom } from './host-dom.js'
import type * as Decorations from './decorations-entry.js'

// Supplied by DSH's package-local chunk factory on both Web and Desktop.
declare const require: { async(path: string): Promise<typeof Decorations> }

export function installDeferredDecorations(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
  load: () => Promise<typeof Decorations> = () => require.async('./client.decorations.js'),
  readySelector = '[data-slot="sidebar"]',
): () => void {
  const win = doc?.defaultView
  if (!doc || !win) return () => {}
  let disposed = false
  let started = false
  let timer: number | undefined
  let idle: number | undefined
  let cleanup: (() => void) | undefined
  let unsubscribe = () => {}
  const run = () => {
    if (disposed) return
    void load().then(module => {
      if (!disposed) cleanup = module.installDecorations(doc)
    }).catch(() => {
      // Decorative failure must never prevent reading or sending messages.
      if (!disposed) console.warn('[xiaohei] Decorative resources unavailable; refresh to retry.')
    })
  }
  const check = () => {
    if (disposed || started || !doc.querySelector(readySelector)) return
    started = true
    unsubscribe()
    // Let the committed app paint before starting the independent resource request.
    timer = win.setTimeout(() => {
      if (disposed) return
      if (typeof win.requestIdleCallback === 'function') idle = win.requestIdleCallback(run, { timeout: 1500 })
      else run()
    }, 100)
  }
  unsubscribe = subscribeXiaoheiHostDom(doc, check)
  check()
  return () => {
    disposed = true
    unsubscribe()
    if (timer !== undefined) win.clearTimeout(timer)
    if (idle !== undefined) win.cancelIdleCallback(idle)
    cleanup?.()
  }
}
