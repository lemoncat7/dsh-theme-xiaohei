import { useEffect, useState } from 'react'
import { motionEnabled, setMotionEnabled, RIFT_MOTION_EVENT, RIFT_MOTION_KEY } from './motion.js'
import { RiftResonance } from './field.js'

/** Native brand slots are wrapped by the Host's new-session control: no nested button. */
export function RiftMark() {
  return <svg className="rift-mark" aria-hidden="true" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M19 3 6 17l6 12 4-12-4 1L24 4l-5 12 6-2-7 15" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round"/><path d="m5 9 4-4m14 22 4-4" stroke="currentColor" strokeOpacity=".4"/></svg>
}
export function RiftBrand() {
  return <span className="rift-brand"><strong>界隙</strong><small>RIFT</small></span>
}
export function RiftHeroMark() {
  return <svg className="rift-hero-mark" aria-hidden="true" width="52" height="60" viewBox="0 0 64 72" fill="none">
    <path className="rift-hero-mark__left" d="M29 6 8 28 16 61 29 45 21 29Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity=".09"/>
    <path className="rift-hero-mark__right" d="m38 12 17 26-13 29-7-24 9-12Z" stroke="currentColor" strokeWidth="1.4" fill="currentColor" fillOpacity=".16"/>
    <path className="rift-hero-mark__core" d="m35 5-8 33h8l-5 29 13-38h-8Z" fill="currentColor"/>
    <path d="m4 18 4-5m47 45 5-7M21 2l2-2" stroke="currentColor" strokeOpacity=".45"/>
  </svg>
}
export function RiftMotion({ wide }: { wide: boolean }) {
  const [enabled, setEnabled] = useState(() => typeof window === 'undefined' || motionEnabled(window))
  useEffect(() => {
    const change = (event: Event) => setEnabled((event as CustomEvent).detail !== false)
    const storage = (event: StorageEvent) => { if (event.key === RIFT_MOTION_KEY || event.key === null) setEnabled(motionEnabled(window)) }
    window.addEventListener(RIFT_MOTION_EVENT, change); window.addEventListener('storage', storage)
    return () => { window.removeEventListener(RIFT_MOTION_EVENT, change); window.removeEventListener('storage', storage) }
  }, [])
  return <><button className="rift-motion" type="button" data-wide={wide} aria-label="界隙背景动效" aria-pressed={enabled}
    title={enabled ? '暂停动效；失焦、后台及减少动态模式会自动静止' : '开启界隙动效'}
    onClick={() => { setMotionEnabled(window, !enabled); setEnabled(!enabled) }}>
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m14 2-9 12h6l-1 8 9-12h-6z"/></svg>
    {wide && <><span>界隙动效</span><small>{enabled ? '已开启' : '已暂停'}</small></>}
  </button><RiftResonance/></>
}
