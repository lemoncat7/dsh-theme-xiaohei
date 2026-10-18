export const RIFT_MOTION_KEY = 'dsh-theme-xiaohei/rift-motion'
export const RIFT_MOTION_EVENT = 'xiaohei/rift-motion'
export function motionEnabled(win: Pick<Window, 'localStorage'>): boolean {
  try { return win.localStorage.getItem(RIFT_MOTION_KEY) !== 'off' } catch { return true }
}
export function setMotionEnabled(win: Window, enabled: boolean): void {
  try { win.localStorage.setItem(RIFT_MOTION_KEY, enabled ? 'on' : 'off') } catch { /* restricted storage keeps session preference */ }
  win.dispatchEvent(new CustomEvent(RIFT_MOTION_EVENT, { detail: enabled }))
}
export function canAnimate(enabled: boolean, reduced: boolean, hidden: boolean, focused: boolean, compact: boolean): boolean {
  return enabled && !reduced && !hidden && focused && !compact
}
export function activeState(state: string): boolean { return ['thinking', 'streaming', 'tool'].includes(state) }
/** Preserve 1080p detail and modest Retina sampling, not an unbounded DPR buffer. */
export function renderSize(width: number, height: number, dpr = 1): [number, number] {
  const w = Number.isFinite(width) ? Math.max(1, width) : 1
  const h = Number.isFinite(height) ? Math.max(1, height) : 1
  const density = Number.isFinite(dpr) ? Math.min(1.5, Math.max(1, dpr)) : 1
  const ratio = Math.min(density, 2560 / w, Math.sqrt(3_000_000 / (w * h)))
  return [Math.max(1, Math.floor(w * ratio)), Math.max(1, Math.floor(h * ratio))]
}
export function coverUv(width: number, height: number, imageWidth: number, imageHeight: number): [number, number, number, number] {
  const scale = Math.max(width / imageWidth, height / imageHeight)
  const x = width / (imageWidth * scale), y = height / (imageHeight * scale)
  return [x, y, 1 - x, (1 - y) / 2]
}
/** Match cover/right/center CSS exactly: no empty strip below the artwork. */
export function sceneUv(width:number,height:number,imageWidth:number,imageHeight:number):[number,number,number,number] {
  return coverUv(width,height,imageWidth,imageHeight)
}
