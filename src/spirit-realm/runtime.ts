import { XIAOHEI_SCENE_LAYER_ID } from '../scene/ids.js'
import { XIAOHEI_REALM_REST, XIAOHEI_REALM_ACTIVE } from '../generated-keyart.js'
import { paintRealm } from './painter.js'
import { canAnimate, motionEnabled, REALM_MOTION_EVENT, REALM_MOTION_KEY } from './motion.js'

/** Visual-only effects. Never install filters/transforms on a host UI ancestor. */
export function installSpiritRealm(doc: Document): () => void {
  const win = doc.defaultView
  const scene = doc.getElementById(XIAOHEI_SCENE_LAYER_ID)
  if (!win || !scene) return () => {}
  const root = doc.documentElement, host = doc.createElement('div')
  host.className = 'xh-realm';host.setAttribute('aria-hidden', 'true')
  const canvas = doc.createElement('canvas'), vignette = doc.createElement('div'), island = doc.createElement('div')
  vignette.className = 'xh-realm__vignette';island.className = 'xh-realm__island'
  const orbit = doc.createElement('div'), character = doc.createElement('div'), caption = doc.createElement('div')
  orbit.className = 'xh-realm__orbit';character.className = 'xh-realm__character';caption.className = 'xh-realm__caption'
  caption.textContent = '万物有灵'
  const subtitle = doc.createElement('small');subtitle.textContent = 'THE SPIRIT REALM';caption.append(subtitle)
  for (const [src, cls] of [[XIAOHEI_REALM_REST, 'rest'], [XIAOHEI_REALM_ACTIVE, 'active']] as const) {
    const image = doc.createElement('img');image.src = src;image.alt = '';image.decoding = 'async';image.className = `xh-realm__${cls}`;character.append(image)
  }
  island.append(orbit, character, caption);host.append(canvas, vignette, island);scene.append(host)
  const ctx = canvas.getContext('2d', { alpha: true }), media = win.matchMedia('(prefers-reduced-motion: reduce)')
  let enabled = motionEnabled(win), focused = doc.hasFocus(), disposed = false
  let frame = 0, pointerFrame = 0, last = 0, time = 0, width = 1, height = 1
  let px = .5, py = .5, sidebarLight: HTMLElement | null = null
  const active = () => ['thinking', 'streaming', 'tool'].includes(root.dataset.xiaoheiState || '')
  const allowed = () => canAnimate(enabled, media.matches, doc.hidden, focused)
  const paint = () => { if (ctx) paintRealm(ctx, width, height, time, root.dataset.xiaoheiAppearance === 'light', active()) }
  function tick(now: number): void {
    frame = 0
    if (disposed || !allowed() || !ctx) return
    const interval = active() ? 1000 / 24 : 1000 / 18
    if (now - last >= interval) { time += Math.min((now - last) / 1000, .15);last = now;paint() }
    frame = win!.requestAnimationFrame(tick)
  }
  function sync(): void {
    if (disposed) return
    win!.cancelAnimationFrame(frame);frame = 0;last = win!.performance.now()
    root.toggleAttribute('data-xh-realm-paused', !allowed())
    host.dataset.motion = allowed() ? 'running' : 'paused'
    paint()
    if (allowed() && ctx) frame = win!.requestAnimationFrame(tick)
  }
  function resize(): void {
    width = Math.max(1, scene!.clientWidth);height = Math.max(1, scene!.clientHeight)
    // Bound total painted pixels; no full-screen Retina rendering.
    const ratio = Math.min(1, 1440 / width, 1000 / height)
    canvas.width = Math.ceil(width * ratio);canvas.height = Math.ceil(height * ratio)
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);paint()
  }
  const observer = new win.ResizeObserver(resize);observer.observe(scene)
  const appearance = new win.MutationObserver(sync)
  appearance.observe(root, { attributes: true, attributeFilter: ['data-xiaohei-appearance', 'data-xiaohei-state'] })
  const onMotion = (e: Event) => { enabled = (e as CustomEvent<boolean>).detail;sync() }
  const onStorage = (e: StorageEvent) => { if (e.key === REALM_MOTION_KEY || e.key === null) { enabled = motionEnabled(win);sync() } }
  const onFocus = () => { focused = true;sync() }, onBlur = () => { focused = false;sync() }
  function pointer(e: PointerEvent): void {
    if (!allowed() || e.pointerType === 'touch') return
    px = e.clientX;py = e.clientY
    if (pointerFrame) return
    pointerFrame = win!.requestAnimationFrame(() => {
      pointerFrame = 0
      if (disposed || !allowed()) return
      island.style.setProperty('--realm-dx', `${(px / width - .5) * 9}px`)
      island.style.setProperty('--realm-dy', `${(py / height - .5) * 7}px`)
      sidebarLight = doc.getElementById('dsh-theme-xiaohei/sidebar-glass')
      // Reuse the glass mirror's cached geometry; no per-pointer layout read.
      sidebarLight?.style.setProperty('--realm-light-x', `calc(${px}px - var(--xiaohei-sidebar-glass-left, 0px))`)
      sidebarLight?.style.setProperty('--realm-light-y', `calc(${py}px - var(--xiaohei-sidebar-glass-top, 0px))`)
    })
  }
  win.addEventListener('pointermove', pointer, { passive: true });win.addEventListener('focus', onFocus);win.addEventListener('blur', onBlur)
  win.addEventListener(REALM_MOTION_EVENT, onMotion);win.addEventListener('storage', onStorage)
  doc.addEventListener('visibilitychange', sync);media.addEventListener('change', sync)
  resize();sync()
  return () => {
    disposed = true;win.cancelAnimationFrame(frame);win.cancelAnimationFrame(pointerFrame)
    observer.disconnect();appearance.disconnect();media.removeEventListener('change', sync)
    win.removeEventListener('pointermove', pointer);win.removeEventListener('focus', onFocus);win.removeEventListener('blur', onBlur)
    win.removeEventListener(REALM_MOTION_EVENT, onMotion);win.removeEventListener('storage', onStorage);doc.removeEventListener('visibilitychange', sync)
    sidebarLight?.style.removeProperty('--realm-light-x');sidebarLight?.style.removeProperty('--realm-light-y')
    root.removeAttribute('data-xh-realm-paused');host.remove()
  }
}
