/** Visual-only signals. Never sent to the gateway or written into session logs. */
import { motionEnabled } from './motion.js'
export const RIFT_SIGNAL = 'xiaohei/rift-signal'
export type RiftSignalKind = 'navigate' | 'expand' | 'focus' | 'release' | 'complete'
export interface RiftSignal { kind: RiftSignalKind; x: number; y: number; width: number; height: number; serial: number }
export const RIFT_SELECTORS = {
  sidebar: '[data-slot="sidebar"]',
  tree: '[data-slot="sidebar.workspaces"]',
  row: '[role="treeitem"], [data-row-key]',
  file: '[data-files-entry] > button',
  composer: '[data-composer-card="true"]',
  editor: '[data-composer-card="true"] [role="textbox"], [data-composer-card="true"] textarea',
} as const

/** Event delegation only: no body scan on each streaming token, no draft reads. */
export function bindRiftInteractions(doc: Document, receive: (signal: RiftSignal, target: Element) => void): () => void {
  const win = doc.defaultView
  if (!win) return () => {}
  const root = doc.documentElement
  const reduced = win.matchMedia?.('(prefers-reduced-motion: reduce)')
  const mayAnimate = () => !doc.hidden && !reduced?.matches && motionEnabled(win) && !root.hasAttribute('data-rift-paused')
  let serial = 0, timer = 0, focusTimer = 0, pointerFrame = 0, previousState = root.getAttribute('data-xiaohei-state')
  let hovered: HTMLElement | null = null, pointerX = 0, pointerY = 0
  const clearHover = () => {
    hovered?.style.removeProperty('--rift-pointer-x'); hovered?.style.removeProperty('--rift-pointer-y')
    hovered?.removeAttribute('data-rift-hover'); hovered = null
  }
  const pointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || !mayAnimate()) return
    const row = target(event)?.closest<HTMLElement>(RIFT_SELECTORS.row)
    if (!row?.closest(RIFT_SELECTORS.tree)) { clearHover(); return }
    if (hovered !== row) { clearHover(); hovered = row; row.setAttribute('data-rift-hover', '') }
    pointerX = event.clientX; pointerY = event.clientY
    if (!pointerFrame) pointerFrame = win.requestAnimationFrame(() => {
      pointerFrame = 0; if (!hovered) return
      const box = hovered.getBoundingClientRect()
      hovered.style.setProperty('--rift-pointer-x', `${pointerX - box.left}px`)
      hovered.style.setProperty('--rift-pointer-y', `${pointerY - box.top}px`)
    })
  }
  const emit = (kind: RiftSignalKind, element: Element | null) => {
    if (!element || !mayAnimate()) return
    const box = element.getBoundingClientRect()
    if (!box.width || !box.height) return
    const signal = { kind, x: box.left, y: box.top, width: box.width, height: box.height, serial: ++serial }
    root.setAttribute('data-rift-signal', kind)
    win.clearTimeout(timer); timer = win.setTimeout(() => root.removeAttribute('data-rift-signal'), 1100)
    receive(signal, element)
    win.dispatchEvent(new CustomEvent<RiftSignal>(RIFT_SIGNAL, { detail: signal }))
  }
  const target = (event: Event) => event.target instanceof win.Element ? event.target : null
  const click = (event: Event) => {
    const el = target(event); if (!el) return
    const file = el.closest(RIFT_SELECTORS.file)
    if (file) { emit('expand', file); return }
    const row = el.closest(RIFT_SELECTORS.row)
    const control = el.closest('button,input')
    if (row?.closest(RIFT_SELECTORS.tree) && (!control || control === row)) {
      emit(row.hasAttribute('aria-expanded') ? 'expand' : 'navigate', row)
    } else if (row?.closest('[data-slot="rightbar"]') && (!control || control === row)) {
      emit('expand', row)
    } else if (el.closest('[data-slot="rightbar"] button')) {
      emit('expand', el.closest('button'))
    }
  }
  const focus = () => {
    win.clearTimeout(focusTimer)
    const editor = doc.activeElement?.closest(RIFT_SELECTORS.editor)
    const focused = !!editor
    if (root.hasAttribute('data-rift-focus') !== focused) {
      root.toggleAttribute('data-rift-focus', focused)
      if (focused) emit('focus', editor.closest(RIFT_SELECTORS.composer))
    }
  }
  const blur = () => { focusTimer = win.setTimeout(focus, 0) }
  const state = new win.MutationObserver(() => {
    const next = root.getAttribute('data-xiaohei-state')
    if (next === previousState) return
    const wasActive = ['thinking', 'streaming', 'tool'].includes(previousState || '')
    previousState = next
    if (next === 'complete') emit('complete', doc.querySelector(RIFT_SELECTORS.composer))
    else if (!wasActive && ['thinking', 'streaming', 'tool'].includes(next || '')) emit('release', doc.querySelector(RIFT_SELECTORS.composer))
  })
  state.observe(root, { attributes: true, attributeFilter: ['data-xiaohei-state'] })
  doc.addEventListener('click', click, true)
  doc.addEventListener('pointermove', pointer, { passive: true })
  win.addEventListener('blur', clearHover)
  doc.addEventListener('focusin', focus); doc.addEventListener('focusout', blur)
  focus()
  return () => {
    state.disconnect(); win.clearTimeout(timer); win.clearTimeout(focusTimer)
    win.cancelAnimationFrame(pointerFrame); clearHover()
    doc.removeEventListener('pointermove', pointer); win.removeEventListener('blur', clearHover)
    doc.removeEventListener('click', click, true)
    doc.removeEventListener('focusin', focus); doc.removeEventListener('focusout', blur)
    root.removeAttribute('data-rift-focus'); root.removeAttribute('data-rift-signal')
  }
}
