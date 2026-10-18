export const REALM_MOTION_KEY = 'dsh-xiaohei-spirit-motion'
export const REALM_MOTION_EVENT = 'xiaohei:spirit-motion'
export function motionEnabled(win: Window): boolean {
  try { return win.localStorage.getItem(REALM_MOTION_KEY) !== 'off' } catch { return true }
}
export function setMotionEnabled(win: Window, enabled: boolean): void {
  try { win.localStorage.setItem(REALM_MOTION_KEY, enabled ? 'on' : 'off') } catch { /* Storage may be unavailable on Desktop. */ }
  win.dispatchEvent(new CustomEvent(REALM_MOTION_EVENT, { detail: enabled }))
}
/** All animation paths share the same visibility and accessibility gate. */
export function canAnimate(enabled: boolean, reduced: boolean, hidden: boolean, focused: boolean): boolean {
  return enabled && !reduced && !hidden && focused
}
