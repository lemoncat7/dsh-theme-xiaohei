export const RIFT_VIEW_KEY = 'dsh-theme-xiaohei/rift-view'
export const RIFT_VIEW_EVENT = 'xiaohei/rift-view'
export type RiftView = 'full' | 'gradient' | 'solid'
export function validView(value: unknown): RiftView {
  return value === 'gradient' || value === 'solid' ? value : 'full'
}
export function readView(win: Pick<Window, 'localStorage'>): RiftView {
  try { return validView(win.localStorage.getItem(RIFT_VIEW_KEY)) } catch { return 'full' }
}
export function setView(win: Window, value: RiftView): void {
  const mode = validView(value)
  try { win.localStorage.setItem(RIFT_VIEW_KEY, mode) } catch { /* session-only when storage is restricted */ }
  win.document.documentElement.setAttribute('data-rift-view', mode)
  win.dispatchEvent(new CustomEvent(RIFT_VIEW_EVENT, { detail: mode }))
}
export function watchView(win: Window, update: (mode: RiftView) => void): () => void {
  const changed = (event: Event) => update(validView((event as CustomEvent).detail))
  const storage = (event: StorageEvent) => {
    if (event.key === RIFT_VIEW_KEY || event.key === null) update(readView(win))
  }
  win.addEventListener(RIFT_VIEW_EVENT, changed); win.addEventListener('storage', storage)
  update(validView(win.document.documentElement.getAttribute('data-rift-view') ?? readView(win)))
  return () => { win.removeEventListener(RIFT_VIEW_EVENT, changed); win.removeEventListener('storage', storage) }
}
/** Quiet views unmount decorative engines, not merely hide a running canvas. */
export function bindRiftPresentation(doc: Document, mount: () => () => void): () => void {
  const win = doc.defaultView
  if (!win) return () => {}
  let dispose: (() => void) | undefined
  const off = watchView(win, mode => {
    doc.documentElement.setAttribute('data-rift-view', mode)
    if (mode === 'full') { dispose ??= mount() }
    else { dispose?.(); dispose = undefined }
  })
  return () => { off(); dispose?.() }
}
/** Read before first paint so presentation mode never flashes the character on reload. */
export const RIFT_VIEW_BOOT = `(()=>{try{const m=localStorage.getItem('${RIFT_VIEW_KEY}');document.documentElement.setAttribute('data-rift-view',m==='gradient'||m==='solid'?m:'full')}catch{}})()`
