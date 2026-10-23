import { useEffect, useRef, useState } from 'react'
import { motionEnabled, setMotionEnabled, RIFT_MOTION_EVENT, RIFT_MOTION_KEY } from './motion.js'
import { RiftResonance } from './field.js'
import { RIFT_MARK_IMAGE } from './mark.js'
import { readView, setView, watchView, type RiftView } from './view.js'

/** Native brand slots are wrapped by the Host's new-session control: no nested button. */
export function RiftMark() {
  return <img className="rift-mark" aria-hidden="true" alt="" width="38" height="38" src={RIFT_MARK_IMAGE}/>
}
export function RiftBrand() {
  return <span className="rift-brand"><strong>界隙</strong><small>RIFT</small></span>
}
export function RiftHeroMark() {
  return <img className="rift-hero-mark" aria-hidden="true" alt="" width="60" height="60" src={RIFT_MARK_IMAGE}/>
}
export function RiftMotion({ wide }: { wide: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [view, updateView] = useState<RiftView>(() => typeof window === 'undefined' ? 'full' : readView(window))
  const [enabled, setEnabled] = useState(() => typeof window === 'undefined' || motionEnabled(window))
  useEffect(() => watchView(window, updateView), [])
  useEffect(() => {
    const change = (event: Event) => setEnabled((event as CustomEvent).detail !== false)
    const storage = (event: StorageEvent) => { if (event.key === RIFT_MOTION_KEY || event.key === null) setEnabled(motionEnabled(window)) }
    window.addEventListener(RIFT_MOTION_EVENT, change); window.addEventListener('storage', storage)
    return () => { window.removeEventListener(RIFT_MOTION_EVENT, change); window.removeEventListener('storage', storage) }
  }, [])
  const names = { full: '完整界隙', gradient: '柔和渐变', solid: '纯色专注' }
  return <><button className="rift-motion" type="button" data-wide={wide} aria-label="界隙外观" aria-haspopup="dialog"
    title={`当前：${names[view]}；切换整套界面风格`}
    onClick={() => dialog.current?.showModal()}>
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m14 2-9 12h6l-1 8 9-12h-6z"/></svg>
    {wide && <><span>界隙外观</span><small>{view === 'full' && !enabled ? '动效暂停' : names[view]}</small></>}
  </button><RiftResonance/>
  <dialog className="rift-view-panel" ref={dialog} aria-labelledby="rift-view-title"
    onClick={event => { if (event.target === dialog.current) dialog.current.close() }}>
    <div className="rift-view-content">
      <div className="rift-view-heading"><h2 id="rift-view-title">界隙外观</h2>
        <button className="rift-view-close" type="button" aria-label="关闭外观设置" onClick={() => dialog.current?.close()}>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button></div>
      <p className="rift-view-hint">切换整套界面：边栏、对话、输入框与弹窗一起变化。立即生效，仅记在当前浏览器。</p>
      <fieldset className="rift-view-options" aria-label="展示模式">
        {(['full', 'gradient', 'solid'] as const).map(mode => <label className="rift-view-option" key={mode}>
          <input type="radio" name="rift-view" value={mode} checked={view === mode} onChange={() => setView(window, mode)}/>
          <span><strong>{names[mode]}</strong><small>{({full:'人物、玻璃材质与界隙交互',gradient:'雾蓝渐变界面，柔和圆角与轻量层次',solid:'中性灰阶界面，平整材质与克制边框'})[mode]}</small></span>
        </label>)}
      </fieldset>
      <label className="rift-view-motion"><span>完整界隙动效</span><input type="checkbox" checked={enabled} disabled={view !== 'full'}
        onChange={event => { setMotionEnabled(window, event.target.checked); setEnabled(event.target.checked) }}/></label>
    </div>
  </dialog></>
}
