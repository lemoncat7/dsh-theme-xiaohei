import { XIAOHEI_IDLE_SHEET, XIAOHEI_KEY_ART } from './generated-keyart.js'

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
  width: 58vmax;
  aspect-ratio: 1;
  right: -16vmax;
  bottom: -23vmax;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(117 228 208 / 31%) 0%, rgb(58 161 151 / 13%) 38%, transparent 70%);
  mix-blend-mode: screen;
  opacity: 0.62;
  transform: scale(0.96);
  will-change: transform, opacity;
  animation: xiaohei-scene-aura 7.5s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate;
}

.xiaohei-scene__spirit {
  width: 0.58rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #8BE5D5;
  box-shadow: 0 0 0.7rem rgb(117 228 208 / 88%), 0 0 1.8rem rgb(101 209 190 / 56%);
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

.xiaohei-scene__mascot {
  right: clamp(0.75rem, 3.8vw, 4rem);
  bottom: clamp(0.25rem, 1.8vh, 1.5rem);
  width: clamp(12rem, 22vw, 21rem);
  aspect-ratio: 1;
  overflow: hidden;
  filter: drop-shadow(0 1.25rem 2.8rem rgb(1 9 10 / 48%));
}

.xiaohei-scene__mascot-sheet {
  position: absolute;
  display: block;
  inset: 0 auto auto 0;
  width: 400%;
  height: 200%;
  max-width: none;
  max-height: none;
  object-fit: fill;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  animation: xiaohei-idle-cycle 6s steps(1, end) infinite;
}

@keyframes xiaohei-scene-aura {
  from { transform: scale(0.94); opacity: 0.44; }
  to { transform: scale(1.05); opacity: 0.78; }
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

@keyframes xiaohei-idle-cycle {
  0%, 13.99% { transform: translate3d(0, 0, 0); }
  14%, 27.99% { transform: translate3d(-25%, 0, 0); }
  28%, 41.99% { transform: translate3d(-50%, 0, 0); }
  42%, 55.99% { transform: translate3d(-75%, 0, 0); }
  56%, 69.99% { transform: translate3d(0, -50%, 0); }
  70%, 83.99% { transform: translate3d(-25%, -50%, 0); }
  84%, 89.99% { transform: translate3d(-50%, -50%, 0); }
  90%, 100% { transform: translate3d(-75%, -50%, 0); }
}

@media (max-width: 768px) {
  .xiaohei-scene__keyart {
    object-position: 68% center;
    opacity: 0.82;
  }

  .xiaohei-scene__veil {
    background: linear-gradient(180deg, rgb(5 12 15 / 16%), rgb(5 12 15 / 40%));
  }

  .xiaohei-scene__mascot {
    right: -1.5rem;
    bottom: 0;
    width: clamp(10rem, 42vw, 14rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .xiaohei-scene__aura,
  .xiaohei-scene__spirit,
  .xiaohei-scene__mascot-sheet {
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
  'xiaohei-scene__mascot',
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
      if (className === 'xiaohei-scene__mascot') {
        const mascot = doc.createElement('div')
        mascot.className = className
        const idleSheet = doc.createElement('img')
        idleSheet.className = 'xiaohei-scene__mascot-sheet'
        idleSheet.alt = ''
        idleSheet.decoding = 'async'
        idleSheet.fetchPriority = 'low'
        idleSheet.src = XIAOHEI_IDLE_SHEET
        mascot.append(idleSheet)
        layer.append(mascot)
        continue
      }

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
