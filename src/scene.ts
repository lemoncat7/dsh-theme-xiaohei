import { XIAOHEI_KEY_ART } from './generated-keyart.js'

/** DOM ids are exported so lifecycle and browser tests can detect leaks. */
export const XIAOHEI_SCENE_STYLE_ID = 'dsh-theme-xiaohei/scene-style'
export const XIAOHEI_SCENE_LAYER_ID = 'dsh-theme-xiaohei/scene-layer'

/**
 * The generated key art is a real raster asset. CSS supplies only atmosphere
 * and motion, never a shape-built substitute for the character.
 */
export const XIAOHEI_SCENE_CSS = `
body {
  background: #081014;
}

body > :not(#${cssEscape(XIAOHEI_SCENE_LAYER_ID)}) {
  position: relative;
  z-index: 1;
}

#${cssEscape(XIAOHEI_SCENE_LAYER_ID)} {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  contain: strict;
  isolation: isolate;
  pointer-events: none;
  user-select: none;
  background: #081014;
}

#${cssEscape(XIAOHEI_SCENE_LAYER_ID)} > * {
  position: absolute;
  display: block;
  pointer-events: none;
}

.xiaohei-scene__keyart {
  inset: -2.5%;
  width: 105%;
  height: 105%;
  max-width: none;
  object-fit: cover;
  object-position: center;
  opacity: 0.98;
}

.xiaohei-scene__veil {
  inset: 0;
  background:
    linear-gradient(90deg, rgb(5 12 15 / 42%) 0%, rgb(5 12 15 / 12%) 44%, transparent 72%),
    linear-gradient(180deg, rgb(4 10 13 / 12%) 0%, transparent 58%, rgb(4 10 13 / 26%) 100%);
}

.xiaohei-scene__aura {
  width: 48vmax;
  aspect-ratio: 1;
  right: -13vmax;
  bottom: -18vmax;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(101 209 190 / 20%) 0%, rgb(58 161 151 / 8%) 38%, transparent 70%);
  mix-blend-mode: screen;
  opacity: 0.42;
  transform: scale(0.96);
  will-change: transform, opacity;
  animation: xiaohei-scene-aura 7.5s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate;
}

.xiaohei-scene__spirit {
  width: 0.48rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #8BE5D5;
  box-shadow: 0 0 0.55rem rgb(101 209 190 / 78%), 0 0 1.5rem rgb(101 209 190 / 44%);
  mix-blend-mode: screen;
  opacity: 0.18;
  will-change: transform, opacity;
}

.xiaohei-scene__spirit--one {
  right: 18%;
  bottom: 22%;
  animation: xiaohei-spirit-one 6.8s cubic-bezier(0.37, 0, 0.63, 1) infinite;
}

.xiaohei-scene__spirit--two {
  right: 31%;
  bottom: 31%;
  animation: xiaohei-spirit-two 8.4s cubic-bezier(0.37, 0, 0.63, 1) -2.2s infinite;
}

.xiaohei-scene__spirit--three {
  right: 9%;
  bottom: 42%;
  animation: xiaohei-spirit-three 7.7s cubic-bezier(0.37, 0, 0.63, 1) -4.1s infinite;
}

@keyframes xiaohei-scene-aura {
  from { transform: scale(0.94); opacity: 0.28; }
  to { transform: scale(1.04); opacity: 0.52; }
}

@keyframes xiaohei-spirit-one {
  0%, 100% { transform: translate3d(0, 0.5rem, 0) scale(0.72); opacity: 0.12; }
  48% { transform: translate3d(-0.7rem, -1.6rem, 0) scale(1); opacity: 0.82; }
}

@keyframes xiaohei-spirit-two {
  0%, 100% { transform: translate3d(0.6rem, 0.4rem, 0) scale(0.68); opacity: 0.08; }
  52% { transform: translate3d(-0.35rem, -1.35rem, 0) scale(0.92); opacity: 0.66; }
}

@keyframes xiaohei-spirit-three {
  0%, 100% { transform: translate3d(-0.4rem, 0.8rem, 0) scale(0.7); opacity: 0.1; }
  44% { transform: translate3d(0.45rem, -1.2rem, 0) scale(0.96); opacity: 0.7; }
}

@media (max-width: 768px) {
  .xiaohei-scene__keyart {
    object-position: 68% center;
    opacity: 0.82;
  }

  .xiaohei-scene__veil {
    background: linear-gradient(180deg, rgb(5 12 15 / 16%), rgb(5 12 15 / 40%));
  }
}

@media (prefers-reduced-motion: reduce) {
  .xiaohei-scene__aura,
  .xiaohei-scene__spirit {
    animation: none;
    will-change: auto;
  }

  .xiaohei-scene__spirit { display: none; }
}

@media (prefers-contrast: more) {
  .xiaohei-scene__keyart { opacity: 0.48; }
  .xiaohei-scene__veil { background: rgb(5 12 15 / 48%); }
  .xiaohei-scene__aura,
  .xiaohei-scene__spirit { display: none; }
}

@media (forced-colors: active), print {
  #${cssEscape(XIAOHEI_SCENE_LAYER_ID)} { display: none; }
}
`

const PARTS = [
  'xiaohei-scene__keyart',
  'xiaohei-scene__veil',
  'xiaohei-scene__aura',
  'xiaohei-scene__spirit xiaohei-scene__spirit--one',
  'xiaohei-scene__spirit xiaohei-scene__spirit--two',
  'xiaohei-scene__spirit xiaohei-scene__spirit--three',
] as const

/** Number of top-level decorative parts installed into the ambient layer. */
export const XIAOHEI_SCENE_PART_COUNT = PARTS.length

/**
 * Install the generated scene after plugin boot becomes idle. The theme tokens
 * apply immediately, while image decoding never extends DSH's loading screen.
 */
export function installXiaoheiScene(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc === undefined) return () => {}

  let disposed = false
  let removeMountedScene = (): void => {}

  const mount = (): void => {
    if (disposed) return

    doc.getElementById(XIAOHEI_SCENE_STYLE_ID)?.remove()
    doc.getElementById(XIAOHEI_SCENE_LAYER_ID)?.remove()

    const style = doc.createElement('style')
    style.id = XIAOHEI_SCENE_STYLE_ID
    style.textContent = XIAOHEI_SCENE_CSS
    doc.head.append(style)

    const layer = doc.createElement('div')
    layer.id = XIAOHEI_SCENE_LAYER_ID
    layer.setAttribute('aria-hidden', 'true')
    layer.setAttribute('data-xiaohei-scene', '')

    const keyArt = doc.createElement('img')
    keyArt.className = PARTS[0]
    keyArt.alt = ''
    keyArt.decoding = 'async'
    keyArt.fetchPriority = 'low'
    keyArt.src = XIAOHEI_KEY_ART
    layer.append(keyArt)

    for (const className of PARTS.slice(1)) {
      const part = doc.createElement('span')
      part.className = className
      layer.append(part)
    }

    doc.body.prepend(layer)
    removeMountedScene = () => {
      layer.remove()
      style.remove()
    }
  }

  const win = doc.defaultView
  let cancelSchedule = (): void => {}
  if (win !== null && typeof win.requestIdleCallback === 'function') {
    const idleId = win.requestIdleCallback(mount, { timeout: 800 })
    cancelSchedule = () => win.cancelIdleCallback(idleId)
  } else if (win !== null) {
    const timeoutId = win.setTimeout(mount, 0)
    cancelSchedule = () => win.clearTimeout(timeoutId)
  } else {
    mount()
  }

  return () => {
    disposed = true
    cancelSchedule()
    removeMountedScene()
  }
}

/** CSS id escaping for the slash in stable plugin-owned DOM ids. */
function cssEscape(value: string): string {
  return value.replaceAll('/', '\\/')
}
