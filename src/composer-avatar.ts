import {
  XIAOHEI_BREAKFRAME_BLINK,
  XIAOHEI_BREAKFRAME_BRACE,
  XIAOHEI_BREAKFRAME_COMPLETE,
  XIAOHEI_BREAKFRAME_ERROR,
  XIAOHEI_BREAKFRAME_IDLE,
  XIAOHEI_BREAKFRAME_REACH,
  XIAOHEI_BREAKFRAME_THINKING,
  XIAOHEI_BREAKFRAME_WORKING,
} from './generated-keyart.js'
import { XIAOHEI_HOST_SELECTORS } from './host-contract.js'
import { subscribeXiaoheiHostDom } from './host-dom.js'

export const XIAOHEI_COMPOSER_AVATAR_CLASS = 'xiaohei-composer-avatar'

export const XIAOHEI_COMPOSER_IDLE_MOTIONS = [
  'glance-left',
  'glance-right',
  'nod',
  'perk',
  'peek',
  'double-blink',
  'ponder',
] as const

export type XiaoheiComposerIdleMotion = typeof XIAOHEI_COMPOSER_IDLE_MOTIONS[number]

/** Pick a varied idle gesture without visibly repeating the previous one. */
export function resolveXiaoheiComposerIdleMotion(
  random: () => number = Math.random,
  previous?: XiaoheiComposerIdleMotion,
): XiaoheiComposerIdleMotion {
  const candidates = previous === undefined
    ? XIAOHEI_COMPOSER_IDLE_MOTIONS
    : XIAOHEI_COMPOSER_IDLE_MOTIONS.filter(motion => motion !== previous)
  const index = Math.min(candidates.length - 1, Math.max(0, Math.floor(random() * candidates.length)))
  return candidates[index] ?? XIAOHEI_COMPOSER_IDLE_MOTIONS[0]
}

const XIAOHEI_IDLE_MOTION_DURATION: Readonly<Record<XiaoheiComposerIdleMotion, number>> = {
  'glance-left': 1_760,
  'glance-right': 1_760,
  'nod': 1_520,
  'perk': 1_640,
  'peek': 1_860,
  'double-blink': 760,
  'ponder': 2_260,
}

type ComposerPlacement = 'hero' | 'docked' | 'mobile'

interface ComposerAvatarPosition {
  placement: ComposerPlacement
  scale: number
  x: number
  y: number
}

/** Resolve the avatar target without coupling to generated Host class names. */
export function resolveXiaoheiComposerAvatarPosition(
  composer: Pick<DOMRect, 'bottom' | 'height' | 'left' | 'top' | 'width'>,
  viewportWidth: number,
  viewportHeight: number,
): ComposerAvatarPosition {
  const avatarWidth = 172
  const avatarHeight = 184
  const mobile = viewportWidth <= 760
  const hero = composer.top < viewportHeight * 0.58

  let placement: ComposerPlacement
  let scale: number
  let x: number
  let y: number

  if (mobile) {
    placement = 'mobile'
    scale = 0.72
    x = composer.left + 8
    y = composer.top - avatarHeight * scale - 8
  } else if (hero) {
    placement = 'hero'
    scale = 0.92
    x = composer.left + composer.width / 2 - avatarWidth / 2
    y = composer.top - avatarHeight * scale - 12
  } else {
    placement = 'docked'
    scale = 0.9
    x = composer.left - avatarWidth * scale - 16
    y = composer.bottom - avatarHeight * scale + 8
  }

  return {
    placement,
    scale,
    x: Math.round(Math.max(8, Math.min(viewportWidth - avatarWidth * scale - 8, x))),
    y: Math.round(Math.max(8, Math.min(viewportHeight - avatarHeight * scale - 8, y))),
  }
}

/** Mount one persistent avatar and let the native composer remain fully owned by DSH. */
export function installXiaoheiComposerAvatar(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc === undefined) return () => {}
  const win = doc.defaultView
  if (win === null) return () => {}

  doc.querySelector(`.${XIAOHEI_COMPOSER_AVATAR_CLASS}`)?.remove()

  const avatar = doc.createElement('span')
  avatar.className = XIAOHEI_COMPOSER_AVATAR_CLASS
  avatar.setAttribute('aria-hidden', 'true')
  avatar.dataset.xiaoheiPortrait = 'idle'

  const effectsBack = createAvatarLayer(doc, 'effects-back')
  const ringBack = createAvatarLayer(doc, 'ring-back')
  const circle = createAvatarLayer(doc, 'circle')
  circle.append(...createPortraitImages(doc, 'inside'))

  const overflow = createAvatarLayer(doc, 'overflow')
  overflow.append(...createPortraitImages(doc, 'overflow'))

  const ringFront = createAvatarLayer(doc, 'ring-front')
  const breakoutRight = createAvatarLayer(doc, 'breakout-right')
  breakoutRight.append(...createBreakoutRightImages(doc))
  const effectsFront = createAvatarLayer(doc, 'effects-front')

  avatar.append(
    effectsBack,
    ringBack,
    circle,
    overflow,
    ringFront,
    breakoutRight,
    effectsFront,
  )
  doc.body.append(avatar)
  let disposed = false
  let composer: HTMLElement | undefined
  let resizeObserver: ResizeObserver | undefined
  let frameRequest: number | undefined
  let pointerRequest: number | undefined
  let reactionTimer: ReturnType<typeof setTimeout> | undefined
  let reactionStageTimers: Array<ReturnType<typeof setTimeout>> = []
  let stateTimer: ReturnType<typeof setTimeout> | undefined
  let blinkTimer: ReturnType<typeof setTimeout> | undefined
  let blinkResetTimer: ReturnType<typeof setTimeout> | undefined
  let idleTimer: ReturnType<typeof setTimeout> | undefined
  let idleResetTimer: ReturnType<typeof setTimeout> | undefined
  let portraitRequest = 0
  let reactionRequest = 0
  let previousIdleMotion: XiaoheiComposerIdleMotion | undefined
  let desiredHostPortrait: DisplayPortraitState = resolveDisplayPortrait(
    doc.documentElement.dataset.xiaoheiState,
  )
  let layoutReady = false
  let idlePortraitReady = false
  let pointerX = 0
  let pointerY = 0

  const revealAvatar = (): void => {
    if (layoutReady && idlePortraitReady) avatar.dataset.xiaoheiAvatarReady = 'true'
  }

  const portraitImages = Array.from(
    avatar.querySelectorAll<HTMLImageElement>('[data-xiaohei-portrait-frame]'),
  )
  const imagesByState = new Map<PortraitState, HTMLImageElement[]>()
  for (const image of portraitImages) {
    const state = image.dataset.xiaoheiPortraitFrame as PortraitState
    const images = imagesByState.get(state) ?? []
    images.push(image)
    imagesByState.set(state, images)
  }
  const decodedStates = new Set<PortraitState>()
  const decodeTasks = new Map<PortraitState, Promise<boolean>>()

  const ensurePortraitDecoded = (state: PortraitState): Promise<boolean> => {
    if (decodedStates.has(state)) return Promise.resolve(true)
    const existing = decodeTasks.get(state)
    if (existing !== undefined) return existing
    const task = Promise.all((imagesByState.get(state) ?? []).map(decodePortraitImage))
      .then((results) => {
        const decoded = results.length > 0 && results.every(Boolean)
        if (decoded) decodedStates.add(state)
        return decoded
      })
    decodeTasks.set(state, task)
    return task
  }

  const showPortrait = async (state: DisplayPortraitState): Promise<void> => {
    const request = ++portraitRequest
    const decoded = await ensurePortraitDecoded(state)
    if (disposed || request !== portraitRequest || !decoded) return
    avatar.dataset.xiaoheiPortrait = state
  }

  const applyHostPortrait = (): void => {
    if (avatar.dataset.xiaoheiAvatarReaction !== undefined) return
    void showPortrait(desiredHostPortrait)
  }

  const scheduleHostPortrait = (): void => {
    desiredHostPortrait = resolveDisplayPortrait(doc.documentElement.dataset.xiaoheiState)
    if (stateTimer !== undefined) clearTimeout(stateTimer)
    stateTimer = setTimeout(() => {
      stateTimer = undefined
      applyHostPortrait()
    }, 150)
  }

  const measure = (): void => {
    frameRequest = undefined
    if (disposed || composer === undefined || !composer.isConnected) {
      avatar.removeAttribute('data-xiaohei-avatar-ready')
      layoutReady = false
      return
    }

    const bounds = composer.getBoundingClientRect()
    const viewport = win.visualViewport
    const viewportWidth = viewport?.width ?? win.innerWidth
    const viewportHeight = viewport?.height ?? win.innerHeight
    const position = resolveXiaoheiComposerAvatarPosition(bounds, viewportWidth, viewportHeight)
    avatar.style.setProperty('--xiaohei-composer-avatar-x', `${position.x}px`)
    avatar.style.setProperty('--xiaohei-composer-avatar-y', `${position.y}px`)
    avatar.style.setProperty('--xiaohei-composer-avatar-scale', String(position.scale))
    avatar.dataset.xiaoheiAvatarPlacement = position.placement
    if (!layoutReady) {
      avatar.getBoundingClientRect()
      layoutReady = true
      revealAvatar()
    }
  }

  const scheduleMeasure = (): void => {
    if (disposed || frameRequest !== undefined) return
    frameRequest = win.requestAnimationFrame(measure)
  }

  const bindComposer = (): void => {
    const next = doc.querySelector<HTMLElement>(XIAOHEI_HOST_SELECTORS.composerCard) ?? undefined
    if (next !== composer) {
      resizeObserver?.disconnect()
      resizeObserver = undefined
      composer = next
      if (composer !== undefined && typeof win.ResizeObserver === 'function') {
        resizeObserver = new win.ResizeObserver(scheduleMeasure)
        resizeObserver.observe(composer)
      }
    }
    scheduleMeasure()
  }

  const handleViewportChange = (): void => scheduleMeasure()
  const renderPointerResponse = (): void => {
    pointerRequest = undefined
    const bounds = avatar.getBoundingClientRect()
    const centerX = bounds.left + bounds.width / 2
    const centerY = bounds.top + bounds.height / 2
    const deltaX = pointerX - centerX
    const deltaY = pointerY - centerY
    const distance = Math.hypot(deltaX, deltaY)
    const proximity = Math.max(0, 1 - distance / 220)
    avatar.style.setProperty('--xiaohei-avatar-look-x', `${Math.max(-2.5, Math.min(2.5, deltaX / 62)) * proximity}px`)
    avatar.style.setProperty('--xiaohei-avatar-look-y', `${Math.max(-1.6, Math.min(1.6, deltaY / 88)) * proximity}px`)
    avatar.style.setProperty('--xiaohei-avatar-look-rotation', `${Math.max(-1.2, Math.min(1.2, deltaX / 170)) * proximity}deg`)
    avatar.toggleAttribute('data-xiaohei-avatar-aware', proximity > 0)
    avatar.toggleAttribute('data-xiaohei-avatar-near', distance < 104)
  }
  const handlePointerMove = (event: PointerEvent): void => {
    pointerX = event.clientX
    pointerY = event.clientY
    if (pointerRequest === undefined) pointerRequest = win.requestAnimationFrame(renderPointerResponse)
  }
  const handleAvatarClick = (): void => {
    if (avatar.dataset.xiaoheiAvatarReaction !== undefined) return
    if (reactionTimer !== undefined) clearTimeout(reactionTimer)
    for (const timer of reactionStageTimers) clearTimeout(timer)
    reactionStageTimers = []
    const request = ++reactionRequest
    if (idleResetTimer !== undefined) clearTimeout(idleResetTimer)
    idleResetTimer = undefined
    delete avatar.dataset.xiaoheiAvatarIdle
    avatar.dataset.xiaoheiAvatarReaction = 'touch'
    avatar.dataset.xiaoheiAvatarReactionStage = 'anticipate'
    reactionStageTimers.push(
      setTimeout(() => {
        if (request !== reactionRequest) return
        avatar.dataset.xiaoheiAvatarReactionStage = 'brace'
        void showPortrait('brace')
      }, 170),
      setTimeout(() => {
        if (request !== reactionRequest) return
        avatar.dataset.xiaoheiAvatarReactionStage = 'break'
        void showPortrait('reach')
      }, 430),
      setTimeout(() => {
        if (request !== reactionRequest) return
        avatar.dataset.xiaoheiAvatarReactionStage = 'recover'
        void showPortrait('brace')
      }, 820),
      setTimeout(() => {
        if (request !== reactionRequest) return
        avatar.dataset.xiaoheiAvatarReactionStage = 'settle'
        void showPortrait(desiredHostPortrait)
      }, 1_090),
    )
    reactionTimer = setTimeout(() => {
      if (request !== reactionRequest) return
      delete avatar.dataset.xiaoheiAvatarReaction
      delete avatar.dataset.xiaoheiAvatarReactionStage
      reactionTimer = undefined
      reactionStageTimers = []
      applyHostPortrait()
    }, 1_340)
  }
  const scheduleBlink = (): void => {
    if (disposed || blinkTimer !== undefined) return
    blinkTimer = setTimeout(() => {
      blinkTimer = undefined
      if (
        !doc.hidden
        && avatar.dataset.xiaoheiPortrait === 'idle'
        && avatar.dataset.xiaoheiAvatarReaction === undefined
        && avatar.dataset.xiaoheiAvatarIdle === undefined
      ) {
        void ensurePortraitDecoded('blink').then((decoded) => {
          if (!decoded || disposed || avatar.dataset.xiaoheiPortrait !== 'idle') return
          avatar.dataset.xiaoheiAvatarBlink = 'true'
          if (blinkResetTimer !== undefined) clearTimeout(blinkResetTimer)
          blinkResetTimer = setTimeout(() => {
            delete avatar.dataset.xiaoheiAvatarBlink
            blinkResetTimer = undefined
          }, 130)
        })
      }
      scheduleBlink()
    }, 4200 + Math.random() * 3600)
  }
  const scheduleIdleMotion = (): void => {
    if (disposed || idleTimer !== undefined) return
    idleTimer = setTimeout(() => {
      idleTimer = undefined
      if (
        !doc.hidden
        && desiredHostPortrait === 'idle'
        && avatar.dataset.xiaoheiAvatarReaction === undefined
      ) {
        const motion = resolveXiaoheiComposerIdleMotion(Math.random, previousIdleMotion)
        previousIdleMotion = motion
        avatar.dataset.xiaoheiAvatarIdle = motion
        if (motion === 'ponder') void showPortrait('thinking')
        idleResetTimer = setTimeout(() => {
          delete avatar.dataset.xiaoheiAvatarIdle
          idleResetTimer = undefined
          if (motion === 'ponder') applyHostPortrait()
        }, XIAOHEI_IDLE_MOTION_DURATION[motion])
      }
      scheduleIdleMotion()
    }, 4_800 + Math.random() * 5_600)
  }
  const handleTransitionEnd = (event: Event): void => {
    if (composer === undefined) return
    const target = event.target
    if (target instanceof win.Node && (target === composer || composer.contains(target))) scheduleMeasure()
  }

  const unsubscribeHostDom = subscribeXiaoheiHostDom(doc, bindComposer)
  const stateObserver = new win.MutationObserver(scheduleHostPortrait)
  stateObserver.observe(doc.documentElement, {
    attributes: true,
    attributeFilter: ['data-xiaohei-state'],
  })
  win.addEventListener('resize', handleViewportChange, { passive: true })
  win.addEventListener('pointermove', handlePointerMove, { passive: true })
  win.visualViewport?.addEventListener('resize', handleViewportChange, { passive: true })
  win.visualViewport?.addEventListener('scroll', handleViewportChange, { passive: true })
  doc.addEventListener('transitionend', handleTransitionEnd, true)
  avatar.addEventListener('click', handleAvatarClick)
  bindComposer()
  void ensurePortraitDecoded('idle').then((decoded) => {
    if (!decoded || disposed) return
    idlePortraitReady = true
    revealAvatar()
  })
  for (const [state] of PORTRAIT_SOURCES) {
    if (state !== 'idle') void ensurePortraitDecoded(state)
  }
  scheduleHostPortrait()
  scheduleBlink()
  scheduleIdleMotion()

  return () => {
    disposed = true
    unsubscribeHostDom()
    stateObserver.disconnect()
    resizeObserver?.disconnect()
    if (frameRequest !== undefined) win.cancelAnimationFrame(frameRequest)
    if (pointerRequest !== undefined) win.cancelAnimationFrame(pointerRequest)
    if (reactionTimer !== undefined) clearTimeout(reactionTimer)
    for (const timer of reactionStageTimers) clearTimeout(timer)
    if (stateTimer !== undefined) clearTimeout(stateTimer)
    if (blinkTimer !== undefined) clearTimeout(blinkTimer)
    if (blinkResetTimer !== undefined) clearTimeout(blinkResetTimer)
    if (idleTimer !== undefined) clearTimeout(idleTimer)
    if (idleResetTimer !== undefined) clearTimeout(idleResetTimer)
    win.removeEventListener('resize', handleViewportChange)
    win.removeEventListener('pointermove', handlePointerMove)
    win.visualViewport?.removeEventListener('resize', handleViewportChange)
    win.visualViewport?.removeEventListener('scroll', handleViewportChange)
    doc.removeEventListener('transitionend', handleTransitionEnd, true)
    avatar.removeEventListener('click', handleAvatarClick)
    avatar.remove()
  }
}

function createAvatarImage(
  doc: Document,
  source: string,
  state: `${'inside' | 'overflow' | 'breakout-right'}-${PortraitState}`,
): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = `${XIAOHEI_COMPOSER_AVATAR_CLASS}__image ${XIAOHEI_COMPOSER_AVATAR_CLASS}__image--${state}`
  image.alt = ''
  image.decoding = 'async'
  const portraitState = state.slice(state.lastIndexOf('-') + 1) as PortraitState
  image.dataset.xiaoheiPortraitFrame = portraitState
  image.fetchPriority = portraitState === 'idle' ? 'high' : 'low'
  image.src = source
  return image
}

type PortraitState = 'idle' | 'blink' | 'brace' | 'reach' | 'thinking' | 'working' | 'complete' | 'error'
type DisplayPortraitState = Exclude<PortraitState, 'blink'>

function resolveDisplayPortrait(state: string | undefined): DisplayPortraitState {
  switch (state) {
    case 'thinking':
    case 'waiting':
      return 'thinking'
    case 'tool':
    case 'streaming':
      return 'working'
    case 'complete':
      return 'complete'
    case 'error':
      return 'error'
    default:
      return 'idle'
  }
}

async function decodePortraitImage(image: HTMLImageElement): Promise<boolean> {
  try {
    if (typeof image.decode === 'function') await image.decode()
    return image.naturalWidth > 0 || image.complete
  } catch {
    return image.complete && image.naturalWidth > 0
  }
}

const PORTRAIT_SOURCES: ReadonlyArray<readonly [PortraitState, string]> = [
  ['idle', XIAOHEI_BREAKFRAME_IDLE],
  ['blink', XIAOHEI_BREAKFRAME_BLINK],
  ['brace', XIAOHEI_BREAKFRAME_BRACE],
  ['reach', XIAOHEI_BREAKFRAME_REACH],
  ['thinking', XIAOHEI_BREAKFRAME_THINKING],
  ['working', XIAOHEI_BREAKFRAME_WORKING],
  ['complete', XIAOHEI_BREAKFRAME_COMPLETE],
  ['error', XIAOHEI_BREAKFRAME_ERROR],
]

function createPortraitImages(doc: Document, layer: 'inside' | 'overflow'): HTMLImageElement[] {
  return PORTRAIT_SOURCES.map(([state, source]) => createAvatarImage(doc, source, `${layer}-${state}`))
}

function createBreakoutRightImages(doc: Document): HTMLImageElement[] {
  return PORTRAIT_SOURCES
    .filter(([state]) => state === 'brace' || state === 'reach')
    .map(([state, source]) => createAvatarImage(doc, source, `breakout-right-${state}`))
}

function createAvatarLayer(doc: Document, name: string): HTMLSpanElement {
  const layer = doc.createElement('span')
  layer.className = `${XIAOHEI_COMPOSER_AVATAR_CLASS}__${name}`
  return layer
}
