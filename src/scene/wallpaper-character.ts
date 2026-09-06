import { subscribeXiaoheiHostDom } from '../host-dom.js'
import { XIAOHEI_HOST_SELECTORS } from '../host-contract.js'
import { XIAOHEI_SCENE_LAYER_ID } from './styles.js'
import { resolveCharacterPlacement, type CharacterPlacement } from './character-layout.js'
import { createCharacterIdleController } from './character-idle.js'
import { CHARACTER_POSES, CHARACTER_POSE_NAMES, type CharacterPose } from './character-poses.js'
import { createCharacterMotion } from './character-motion.js'

export const XIAOHEI_WALLPAPER_CHARACTER_ID = 'dsh-theme-xiaohei/wallpaper-character'

/** Places the layered character only when the host geometry is settled. */
export function installXiaoheiWallpaperCharacter(doc: Document | undefined = typeof document === 'undefined' ? undefined : document): () => void {
  const win = doc?.defaultView
  if (!doc || !win) return () => {}
  let disposed = false
  let frame: number | undefined
  let settled: number | undefined
  let host: HTMLElement | undefined
  let targets: (HTMLElement | null)[] = []
  let dirty = true
  let placement: CharacterPlacement = { pose: 'hidden', left: 0, top: 0, width: 0, height: 0 }
  const ready = new Set<CharacterPose>()
  const loading = new Set<CharacterPose>()
  const failed = new Set<CharacterPose>()
  const motion = typeof win.matchMedia === 'function' ? createCharacterMotion(doc) : undefined
  const idle = createCharacterIdleController({ now: () => win.performance.now(),
    setTimeout: (fn, delay) => win.setTimeout(fn, delay), clearTimeout: handle => win.clearTimeout(handle),
  }, () => schedule())
  const sizes = new WeakMap<Element, { width: number; height: number }>()
  const observer = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(entries => {
    for (const entry of entries) {
      const previous = sizes.get(entry.target)
      const width = entry.contentRect.width
      const height = entry.contentRect.height
      sizes.set(entry.target, { width, height })
      // Appending streamed paragraphs changes flow height, not its horizontal
      // safe area. Ignore that size change instead of measuring the whole UI.
      if (!previous || previous.width !== width || (entry.target === targets[0] && previous.height !== height)) dirty = true
    }
    if (dirty) { schedule(); scheduleSettled() }
  }) : undefined

  function reconcile(): void {
    if (disposed || !doc) return
    // The glass owner already tracks the native column's animated geometry.
    // Do not measure controls or rebuild a different rig at intermediate widths.
    if (doc.documentElement?.hasAttribute('data-xiaohei-sidebar-resizing')) {
      dirty = true
      if (host && host.dataset.pose !== 'hidden') host.dataset.pose = 'hidden'
      idle.setPaused(true)
      motion?.setPose(undefined, 'hidden')
      scheduleSettled()
      return
    }
    const layer = doc.getElementById(XIAOHEI_SCENE_LAYER_ID)
    const next = [
      doc.querySelector<HTMLElement>(XIAOHEI_HOST_SELECTORS.sidebarShell),
      doc.querySelector<HTMLElement>('[data-conversation-scroll]'),
      doc.querySelector<HTMLElement>('[data-chat-flow]'),
      doc.querySelector<HTMLElement>(XIAOHEI_HOST_SELECTORS.composerCard),
    ]
    if (next.some((element, i) => element !== targets[i])) {
      targets = next
      observer?.disconnect()
      for (const element of targets) if (element) observer?.observe(element)
      dirty = true
    }
    if (!layer) { host?.remove(); host = undefined; idle.setPaused(true); motion?.setPose(undefined, 'hidden'); return }
    if (!host || host.parentElement !== layer) {
      host?.remove()
      doc.getElementById(XIAOHEI_WALLPAPER_CHARACTER_ID)?.remove()
      host = doc.createElement('div')
      host.id = XIAOHEI_WALLPAPER_CHARACTER_ID
      host.className = 'xiaohei-wallpaper-character'
      host.setAttribute('aria-hidden', 'true')
      host.dataset.pose = 'hidden'
      for (const pose of CHARACTER_POSE_NAMES) {
        const part = doc.createElement('span')
        part.className = `xiaohei-wallpaper-character__${pose}`
        host.append(part)
      }
      layer.append(host)
      dirty = true
    }
    if (!dirty) { renderPose(); return }
    dirty = false
    const [sidebar, scroll, flow, composer] = targets
    if (!sidebar || !scroll || !composer) { placement = { ...placement, pose: 'hidden' }; renderPose(); return }
    const sidebarBounds = sidebar.getBoundingClientRect()
    const controls = sidebarBounds.width < 100
      ? [...sidebar.querySelectorAll<HTMLElement>('button,a,input,[role="button"],[role="treeitem"]')]
        .map(e => e.getBoundingClientRect()).filter(r => r.width > 0 && r.height > 0)
      : []
    const composerBounds = composer.getBoundingClientRect()
    // Native message content is inset 16px from its composer column. Use the
    // same horizontal footprint on the empty welcome page; never use its Y.
    const flowBounds = flow?.getBoundingClientRect() ?? {
      left: composerBounds.left + 16, right: composerBounds.right - 16, top: 0, bottom: 0 }
    placement = resolveCharacterPlacement({ sidebar: sidebarBounds,
      scroll: scroll.getBoundingClientRect(), flow: flowBounds,
      viewportWidth: win!.innerWidth, viewportHeight: win!.innerHeight, controls })
    renderPose()
  }
  function renderPose(): void {
    if (!host || disposed) return
    idle.setPaused(doc!.hidden || placement.pose !== 'seated')
    const pose = doc!.hidden ? 'hidden' : placement.pose === 'seated' ? idle.pose : placement.pose
    if (pose === 'hidden') { if (host.dataset.pose !== 'hidden') host.dataset.pose = 'hidden'; motion?.setPose(undefined, 'hidden'); return }
    if (!ready.has(pose)) {
      motion?.setPose(undefined, 'hidden')
      // Do not retain the old location across a layout change: it could now
      // overlap a message. Idle changes keep the already decoded seated pose.
      if (placement.pose !== 'seated' || !['seated', 'chin', 'doze'].includes(host.dataset.pose ?? '')) host.dataset.pose = 'hidden'
      if (!loading.has(pose) && !failed.has(pose)) {
        loading.add(pose)
        // Decode only a requested pose, in both appearances so changing theme
        // cannot produce a blank frame. No image fetch or perpetual RAF loop.
        void Promise.all(Object.values(CHARACTER_POSES[pose]).map(src => {
          const image = new win!.Image()
          image.src = src
          return image.decode()
        })).then(() => {
          if (disposed) return
          loading.delete(pose); ready.add(pose); schedule()
        }, () => { loading.delete(pose); failed.add(pose) })
      }
      return
    }
    // Each pose keeps its own coordinates during the short crossfade. No
    // travelling from the right edge through the conversation to the sidebar.
    const part = host.querySelector<HTMLElement>(`.xiaohei-wallpaper-character__${pose}`)!
    for (const key of ['left', 'top', 'width', 'height'] as const) {
      const value = `${Math.round(placement[key] * 100) / 100}px`
      if (part.style[key] !== value) part.style[key] = value
    }
    if (!part.dataset.ready) part.dataset.ready = 'true'
    if (host.dataset.pose !== pose) host.dataset.pose = pose
    motion?.setPose(part, pose)
  }
  function schedule(): void {
    if (disposed || frame !== undefined) return
    frame = win!.requestAnimationFrame(() => { frame = undefined; reconcile() })
  }
  function scheduleSettled(): void {
    if (settled !== undefined) win!.clearTimeout(settled)
    // Native rail/collapse transitions can move the sidebar after its last
    // size notification. One final measurement catches that resting position.
    settled = win!.setTimeout(() => { settled = undefined; dirty = true; schedule() }, 240)
  }
  const unsubscribe = subscribeXiaoheiHostDom(doc, schedule)
  const resized = (): void => { dirty = true; schedule(); scheduleSettled() }
  win.addEventListener('resize', resized, { passive: true })
  const activity = () => idle.activity()
  const events = ['pointermove', 'pointerdown', 'keydown', 'input', 'wheel'] as const
  for (const event of events) doc.addEventListener(event, activity, { passive: true, capture: true })
  const visibility = () => { if (doc.hidden) idle.setPaused(true); schedule() }
  doc.addEventListener('visibilitychange', visibility)
  schedule()
  return () => {
    disposed = true
    if (frame !== undefined) win.cancelAnimationFrame(frame)
    if (settled !== undefined) win.clearTimeout(settled)
    unsubscribe()
    observer?.disconnect()
    idle.dispose()
    motion?.dispose()
    for (const event of events) doc.removeEventListener(event, activity, true)
    doc.removeEventListener('visibilitychange', visibility)
    win.removeEventListener('resize', resized)
    host?.remove()
  }
}
