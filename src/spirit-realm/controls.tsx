import { useEffect, useState } from 'react'
import { motionEnabled, REALM_MOTION_EVENT, REALM_MOTION_KEY, setMotionEnabled } from './motion.js'

export function SpiritRealmBrand() {
  return <span className="xh-realm-brand"><span className="xh-realm-brand__name"><strong>罗小黑</strong><small>灵质空间</small></span></span>
}

// The host wraps sidebar.brand.name in a new-session button and aria-hidden.
// Keep interactive controls in the footer's dedicated action slot instead.
export function SpiritRealmMotion({ wide }: { wide: boolean }) {
  const [enabled, setEnabled] = useState(() => typeof window === 'undefined' || motionEnabled(window))
  useEffect(() => {
    const sync = (e: Event) => setEnabled(e instanceof CustomEvent ? e.detail !== false : motionEnabled(window))
    const storage = (e: StorageEvent) => { if (e.key === REALM_MOTION_KEY || e.key === null) sync(e) }
    window.addEventListener(REALM_MOTION_EVENT, sync);window.addEventListener('storage', storage)
    return () => { window.removeEventListener(REALM_MOTION_EVENT, sync);window.removeEventListener('storage', storage) }
  }, [])
  return <button type="button" className="xh-realm-motion" data-wide={wide} aria-label="背景动效" aria-pressed={enabled} title={enabled ? '暂停背景动效（后台或减少动态效果时自动暂停）' : '开启背景动效'} onClick={() => { setMotionEnabled(window, !enabled);setEnabled(!enabled) }}>
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="6" transform="rotate(-35 12 12)"/></svg>
    {wide && <><span>灵质动效</span><small>{enabled ? '开' : '关'}</small></>}
  </button>
}
