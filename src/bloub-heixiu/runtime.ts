import { BotEngine } from '../vendor/bloub/engine.js'
import { liveliness } from '../vendor/bloub/face.js'
import { STATE_BY_ID } from '../vendor/bloub/states.js'
import { subscribeXiaoheiHostDom } from '../host-dom.js'
import { XIAOHEI_HOST_SELECTORS } from '../host-contract.js'
import { createHeixiuRenderer } from './renderer.js'
import { resolveHeixiuDock, resolveHeixiuWelcome } from './layout.js'
import { resolveHeixiuFollow, resolveHeixiuGaze } from './follow.js'
import { createHeixiuFlight, type HeixiuBox } from './flight.js'
import { heixiuAmbientDelay, heixiuAmbientIndex } from './ambient.js'
import { HEIXIU_BLOUB_CSS } from './styles.js'
import { HEIXIU_FACE, HEIXIU_PROFILE, HEIXIU_REACTIONS, HeixiuReactions } from './character.js'
import type { StateId } from '../vendor/bloub/states.js'
import type { HeixiuSignals } from './signals.js'

export const HEIXIU_BLOUB_ACTIONS = ['burst', 'egg', 'orbit', 'hexagon', 'wink', 'wide', 'exclaim', 'alert', 'sleep', 'thinking', 'notify'] as const
export const HEIXIU_AMBIENT_ACTIONS = ['burst', 'egg', 'orbit', 'hexagon', 'wink', 'wide', 'sleep'] as const

/** One native-composer-owned button; optional read-only state, never send handlers. */
export function installComposerBloub(doc: Document | undefined = typeof document === 'undefined' ? undefined : document, signals?: HeixiuSignals): () => void {
  const win = doc?.defaultView
  if (!doc || !win) return () => {}
  const style = doc.createElement('style'); style.textContent = HEIXIU_BLOUB_CSS; doc.head.append(style)
  const button = doc.createElement('button')
  button.className = 'xiaohei-bloub'; button.type = 'button'
  button.setAttribute('aria-label', '逗逗嘿咻'); button.title = '单击逗逗嘿咻 · 双击轮换变形（键盘 Shift+Enter）'
  const renderer = createHeixiuRenderer(doc)
  const drift = doc.createElement('span'); drift.className = 'xiaohei-bloub-drift'
  drift.append(renderer.svg); button.append(drift)
  const flight = createHeixiuFlight(button)
  const engine = new BotEngine(100, 'idle', HEIXIU_PROFILE, HEIXIU_FACE)
  const reactions = new HeixiuReactions()
  const neutral = { yaw: 0, pitch: -7, mix: 1, spin: 0, wander: .35 }
  let gaze = neutral
  engine.setLook(neutral, 0)
  renderer.render(engine.sample(0))
  let disposed = false, visible = false, dirty = true
  let composer: HTMLElement | null = null, sidebar: HTMLElement | null = null
  let hero: HTMLElement | null = null, heroRow: HTMLElement | null = null
  let bounds: HeixiuBox | undefined
  let layoutFrame: number | undefined, animationFrame: number | undefined, wake: number | undefined
  let frameTimer: number | undefined
  let lastPointerStamp = -Infinity
  let time = 0, lastStamp: number | undefined, activeUntil = 2.5, actionUntil = 0, reactionIndex = 0
  let pointerSide = 1
  let special = false, specialIndex = 0
  let followingX = '', followingY = ''
  let ambientTimer: number | undefined, previousSpecial = -1, lastInput = -Infinity
  let signal = signals?.getSnapshot()
  let dockMode: string | undefined, viewportWidth = win.innerWidth, viewportHeight = win.innerHeight
  const motion = win.matchMedia('(prefers-reduced-motion: reduce)')

  const ro = typeof win.ResizeObserver === 'function' ? new win.ResizeObserver(() => { dirty = true; scheduleLayout() }) : undefined
  const io = typeof win.IntersectionObserver === 'function' ? new win.IntersectionObserver(entries => {
    const entry = entries.find(e => e.target === button)
    if (entry) { visible = entry.isIntersecting; syncPlayback() }
  }) : undefined

  function stop() {
    button.dataset.floating = 'false'
    follow(0, 0)
    if (ambientTimer !== undefined) win!.clearTimeout(ambientTimer)
    ambientTimer = undefined
    flight.cancel()
    if (animationFrame !== undefined) win!.cancelAnimationFrame(animationFrame)
    if (frameTimer !== undefined) win!.clearTimeout(frameTimer)
    if (wake !== undefined) win!.clearTimeout(wake)
    animationFrame = undefined; frameTimer = undefined; wake = undefined; lastStamp = undefined
  }
  function follow(dx: number, dy: number) {
    const offset = resolveHeixiuFollow(dx, dy, win!.innerWidth <= 760 || composer?.dataset.heixiuDock === 'compact')
    const x = `${offset.x.toFixed(3)}px`, y = `${offset.y.toFixed(3)}px`
    if (x !== followingX) { button.style.setProperty('--heixiu-follow-x', x); followingX = x }
    if (y !== followingY) { button.style.setProperty('--heixiu-follow-y', y); followingY = y }
  }
  function allowed() { return !disposed && visible && !!composer?.isConnected && !doc!.hidden && !motion.matches }
  function scheduleAmbient(delay = heixiuAmbientDelay()) {
    if (ambientTimer !== undefined) win!.clearTimeout(ambientTimer)
    ambientTimer = undefined
    if (!allowed()) return
    ambientTimer = win!.setTimeout(() => {
      ambientTimer = undefined
      if (!allowed()) return
      if (actionUntil || signal?.running || flight.active || Date.now() - lastInput < 5000) { scheduleAmbient(5000); return }
      playState(HEIXIU_AMBIENT_ACTIONS[heixiuAmbientIndex(HEIXIU_AMBIENT_ACTIONS.length, previousSpecial)]!, 'ambient')
    }, delay)
  }
  function animateFor(seconds: number) {
    activeUntil = Math.max(activeUntil, time + seconds)
    if (!allowed() || animationFrame !== undefined || frameTimer !== undefined) return
    if (wake !== undefined) win!.clearTimeout(wake)
    wake = undefined; lastStamp = undefined
    animationFrame = win!.requestAnimationFrame(tick)
  }
  function tick(stamp: number) {
    animationFrame = undefined
    if (!allowed()) { stop(); return }
    if (lastStamp !== undefined) time += Math.min(.05, Math.max(0, (stamp - lastStamp) / 1000))
    lastStamp = stamp
    if (actionUntil && time >= actionUntil) {
      special = false; engine.setLook(gaze, time)
      actionUntil = 0; engine.setState('idle', time); button.dataset.action = 'idle'; activeUntil = Math.max(activeUntil, time + .65)
      if (signal?.running) playState('thinking', 'session', true)
    }
    renderer.render(engine.sample(time), reactions.sample(time))
    // Stop only with open eyes. The next short life window resumes the same
    // clock, so neither gaze nor a partly completed blink can jump on waking.
    if (time < activeUntil || actionUntil || liveliness(time).lid < .99) {
      // SVG path deformation needs painting. Cap it instead of following a
      // 120/144 Hz desktop display; preserve elapsed time and action continuity.
      frameTimer = win!.setTimeout(() => {
        frameTimer = undefined
        if (allowed()) animationFrame = win!.requestAnimationFrame(tick)
      }, 1000 / 30)
    } else {
      lastStamp = undefined
      wake = win!.setTimeout(() => { wake = undefined; animateFor(1) }, 8000)
    }
  }
  function syncPlayback() {
    if (!allowed()) {
      stop()
      if (motion.matches) {
        engine.reset('idle', time); engine.setLook(neutral, time, .001); actionUntil = 0; special = false
        reactions.reset()
        time += 1
        renderer.render(engine.sample(time)); button.dataset.action = 'idle'
      }
    } else {
      button.dataset.floating = 'true'; animateFor(1)
      if (signal?.running && !actionUntil) playState('thinking', 'session', true)
      if (ambientTimer === undefined) scheduleAmbient()
    }
  }
  function reconcile() {
    layoutFrame = undefined
    if (disposed) return
    const next = doc!.querySelector<HTMLElement>(XIAOHEI_HOST_SELECTORS.composerCard)
    const nextSidebar = doc!.querySelector<HTMLElement>(XIAOHEI_HOST_SELECTORS.sidebarShell)
    const nextHero = doc!.querySelector<HTMLElement>(XIAOHEI_HOST_SELECTORS.composerHeroMark)
    if (composer !== next || sidebar !== nextSidebar || hero !== nextHero) {
      composer?.removeAttribute('data-heixiu-dock'); ro?.disconnect()
      heroRow?.removeAttribute('data-heixiu-hero-row')
      composer = next; sidebar = nextSidebar; hero = nextHero; dirty = true
      heroRow = hero?.closest<HTMLElement>(XIAOHEI_HOST_SELECTORS.composerHeroRow) ?? null
      heroRow?.setAttribute('data-heixiu-hero-row', '')
      if (composer) ro?.observe(composer)
      if (sidebar) ro?.observe(sidebar)
      if (hero) ro?.observe(hero)
      if (heroRow) ro?.observe(heroRow)
    }
    if (!composer) { button.remove(); visible = false; stop(); return }
    if (button.parentElement !== composer || composer.lastElementChild === button) {
      // The native trailing toolbar must stay last: DSH and the existing send
      // skin use its structural position. The overlay must not replace it.
      const toolbar = [...composer.children].reverse().find(child => child !== button)
      composer.insertBefore(button, toolbar ?? null)
      io?.observe(button); dirty = true
    }
    if (!dirty) return
    dirty = false
    const wasFlying = flight.active
    const viewportChanged = viewportWidth !== win!.innerWidth || viewportHeight !== win!.innerHeight
    const origin = flight.capture(bounds)
    follow(0, 0)
    const rect = composer.getBoundingClientRect()
    const sidebarRight = sidebar?.getBoundingClientRect().right ?? 0
    const dock = resolveHeixiuDock(rect.left, sidebarRight, win!.innerWidth)
    const heroRect = hero?.getBoundingClientRect()
    const welcome = heroRect && resolveHeixiuWelcome(heroRect, rect, sidebarRight, win!.innerWidth)
    if (welcome) {
      button.style.setProperty('--heixiu-welcome-left', `${welcome.left}px`)
      button.style.setProperty('--heixiu-welcome-top', `${welcome.top}px`)
      button.style.setProperty('--heixiu-welcome-size', `${welcome.size}px`)
    }
    const mode = welcome ? 'welcome' : dock.mode
    const fly = !viewportChanged && (wasFlying || !!dockMode && dockMode !== mode && (dockMode === 'welcome' || mode === 'welcome'))
    dockMode = mode; viewportWidth = win!.innerWidth; viewportHeight = win!.innerHeight
    if (composer.dataset.heixiuDock !== mode) composer.dataset.heixiuDock = mode
    // One read after layout configuration; never inside the animation loop.
    bounds = flight.target(button.getBoundingClientRect())
    visible = rect.width > 0 && rect.height > 0 && bounds.top + bounds.height > 0 && bounds.top < win!.innerHeight
    syncPlayback()
    if (allowed() && fly) flight.move(origin, bounds, motion.matches)
    else flight.cancel()
  }
  function scheduleLayout() {
    if (disposed || layoutFrame !== undefined) return
    layoutFrame = win!.requestAnimationFrame(reconcile)
  }
  const move = (event: PointerEvent) => {
    if (!allowed() || flight.active || !bounds?.width) return
    if (event.pointerType === 'touch') { leave(); return }
    if (event.timeStamp - lastPointerStamp < 1000 / 30) return
    lastPointerStamp = event.timeStamp
    const dx = event.clientX - (bounds.left + bounds.width / 2)
    const dy = event.clientY - (bounds.top + bounds.height / 2)
    follow(dx, dy)
    gaze = resolveHeixiuGaze(dx, dy)
    if (special) return
    pointerSide = dx < 0 ? -1 : 1
    reactions.aim(Math.abs(dx) < 90 && Math.abs(dy) < 90 ? dx / 60 : 0, time)
    engine.setLook(gaze, time)
    animateFor(.8)
  }
  const leave = () => {
    follow(0, 0); gaze = neutral
    if (allowed() && !special) { reactions.aim(0, time); engine.setLook(neutral, time); animateFor(.8) }
  }
  const click = (event: MouseEvent) => {
    event.stopPropagation()
    if (!allowed() || event.detail > 1) return
    // A follow-up double click must not flash idle between special actions.
    // A single click during one lets it finish; the next double click can
    // interrupt it directly, without a delayed single-click timer.
    if (special && event.detail > 0) return
    const index = reactionIndex++ % (HEIXIU_REACTIONS.length + 1)
    if (index === HEIXIU_REACTIONS.length) { playState('exclaim', 'manual'); return }
    const kind = HEIXIU_REACTIONS[index]!
    special = false; engine.setState('idle', time); engine.setLook(gaze, time)
    reactions.play(kind, time, pointerSide); button.dataset.action = kind
    button.dataset.actionSource = 'manual'; scheduleAmbient()
    actionUntil = reactions.end; animateFor(actionUntil - time + .65)
  }
  function playState(state: StateId, source: 'manual' | 'ambient' | 'session', held = false) {
    const def = STATE_BY_ID.get(state)!
    renderer.prepareEffects(); reactions.settle(time)
    special = true; engine.setLook(null, time); engine.setState(state, time); button.dataset.action = state
    previousSpecial = HEIXIU_AMBIENT_ACTIONS.findIndex(action => action === state); button.dataset.actionSource = source
    actionUntil = held ? Infinity : time + Math.max(def.duration, def.minDuration ?? 0)
    // Do not poison activeUntil with Infinity: normal idle must sleep again.
    animateFor(Math.max(def.duration, def.minDuration ?? 0) + .65)
    scheduleAmbient()
  }
  const doubleClick = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation()
    if (!allowed()) return
    playState(HEIXIU_BLOUB_ACTIONS[specialIndex++ % HEIXIU_BLOUB_ACTIONS.length]!, 'manual')
  }
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault()
      if (!event.repeat) doubleClick(event)
    }
  }
  const resized = () => { dirty = true; scheduleLayout() }
  const input = (event: Event) => { if (composer?.contains(event.target as Node)) lastInput = Date.now() }
  const unsubscribeSignals = signals?.subscribe(() => {
    const next = signals.getSnapshot(), changedSession = next.sessionId !== signal?.sessionId
    signal = next
    button.dataset.sessionState = next.running ? 'running' : 'idle'
    // Never replay missed notifications on visibility/reduced-motion changes.
    if (!allowed()) {
      if (actionUntil === Infinity || button.dataset.actionSource === 'session' || changedSession) {
        actionUntil = 0; special = false; engine.setState('idle', time); engine.setLook(gaze, time)
        button.dataset.action = 'idle'
      }
      return
    }
    if (changedSession || actionUntil === Infinity && !next.running) {
      actionUntil = 0; special = false; engine.setState('idle', time); engine.setLook(gaze, time)
      button.dataset.action = 'idle'; animateFor(.65)
    }
    if (!changedSession && next.notice) playState(next.notice, 'session')
    else if (next.running && (!actionUntil || button.dataset.actionSource !== 'session')) playState('thinking', 'session', true)
  }) ?? (() => {})
  const unsubscribe = subscribeXiaoheiHostDom(doc, scheduleLayout)
  doc.addEventListener('pointermove', move, { passive: true })
  doc.addEventListener('pointerleave', leave)
  doc.addEventListener('visibilitychange', syncPlayback)
  doc.addEventListener('input', input, { passive: true })
  button.addEventListener('click', click)
  button.addEventListener('dblclick', doubleClick)
  button.addEventListener('keydown', keydown)
  win.addEventListener('resize', resized, { passive: true })
  win.addEventListener('scroll', resized, { passive: true, capture: true })
  motion.addEventListener('change', syncPlayback)
  scheduleLayout()
  return () => {
    disposed = true; stop(); unsubscribe(); unsubscribeSignals(); ro?.disconnect(); io?.disconnect()
    if (layoutFrame !== undefined) win.cancelAnimationFrame(layoutFrame)
    doc.removeEventListener('pointermove', move); doc.removeEventListener('pointerleave', leave)
    doc.removeEventListener('visibilitychange', syncPlayback); button.removeEventListener('click', click)
    doc.removeEventListener('input', input)
    button.removeEventListener('dblclick', doubleClick)
    button.removeEventListener('keydown', keydown)
    win.removeEventListener('resize', resized); win.removeEventListener('scroll', resized, true)
    motion.removeEventListener('change', syncPlayback)
    heroRow?.removeAttribute('data-heixiu-hero-row')
    composer?.removeAttribute('data-heixiu-dock'); button.remove(); style.remove()
  }
}
