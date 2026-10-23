import { motionEnabled } from './motion.js'
import type { RiftSignal } from './interaction.js'

/** One transient contour, outside transformed shell slots. Never transform the
 * native control. Track its live bounds only during the 900ms visual effect. */
export function createRiftImpulse(doc: Document) {
  const win = doc.defaultView!
  const root = doc.documentElement
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)')
  const forced = win.matchMedia('(forced-colors: active)')
  let frame = 0, timer = 0, outline: HTMLDivElement | null = null, disposed = false
  const allowed = () => !disposed && !doc.hidden && !reduced.matches && !forced.matches &&
    !root.hasAttribute('data-rift-paused') && motionEnabled(win)
  const clear = () => {
    win.cancelAnimationFrame(frame); win.clearTimeout(timer)
    frame = timer = 0; outline?.remove(); outline = null
  }
  const sync = () => { if (!allowed()) clear() }
  const observer = new win.MutationObserver(sync)
  observer.observe(root, { attributes: true, attributeFilter: ['data-rift-paused'] })
  doc.addEventListener('visibilitychange', sync)
  win.addEventListener('blur', clear)
  reduced.addEventListener('change', sync); forced.addEventListener('change', sync)
  return {
    show(signal: RiftSignal, target: Element) {
      clear()
      if (!allowed()) return
      let previous = ''
      const update = () => {
        if (!allowed() || !target.isConnected) { clear(); return }
        const box = target.getBoundingClientRect()
        if (box.width <= 0 || box.height <= 0) { clear(); return }
        if (!outline) {
          outline = doc.createElement('div'); outline.className = 'rift-impulse'
          outline.dataset.kind = signal.kind; outline.setAttribute('aria-hidden', 'true')
          const edge = doc.createElement('span'); edge.className = 'rift-impulse__edge'; outline.append(edge)
          for (const side of ['a', 'b']) {
            const shard = doc.createElement('span')
            shard.className = `rift-impulse__shard rift-impulse__shard--${side}`
            outline.append(shard)
          }
          doc.body.append(outline)
          timer = win.setTimeout(clear, 900)
        }
        const bounds = `${box.left},${box.top},${box.width},${box.height}`
        if (bounds !== previous) {
          previous = bounds
          Object.assign(outline.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` })
        }
        frame = win.requestAnimationFrame(update)
      }
      // Native navigation/focus handlers settle layout before measuring.
      frame = win.requestAnimationFrame(update)
    },
    dispose() {
      disposed = true; clear(); observer.disconnect()
      doc.removeEventListener('visibilitychange', sync); win.removeEventListener('blur', clear)
      reduced.removeEventListener('change', sync); forced.removeEventListener('change', sync)
    },
  }
}
