import { XIAOHEI_ENERGY, XIAOHEI_IDLE_SHEET, XIAOHEI_KEY_ART } from './generated-keyart.js'

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
  opacity: 0;
}

.xiaohei-scene__mascot-sheet--open {
  opacity: 1;
  transition: opacity 120ms ease-out;
}

.xiaohei-scene__mascot-sheet--blink {
  will-change: opacity;
  animation: xiaohei-mascot-blink 5.2s step-end infinite;
}

.xiaohei-scene__mascot-energy {
  position: absolute;
  display: block;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: fill;
  opacity: 0;
  transition: opacity 120ms ease-out;
}

.xiaohei-scene__energy-fx,
.xiaohei-scene__energy-fx > span {
  position: absolute;
  display: block;
  pointer-events: none;
}

.xiaohei-scene__energy-fx {
  inset: 0;
  opacity: 0;
  transition: opacity 120ms ease-out;
}

.xiaohei-scene__energy-aura {
  left: 33%;
  top: 52%;
  border-radius: 50%;
  mix-blend-mode: screen;
  transform: translate(-50%, -50%);
  will-change: transform, opacity;
}

.xiaohei-scene__energy-aura--outer {
  width: 28%;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgb(139 255 230 / 58%) 0%, rgb(72 238 208 / 28%) 35%, transparent 72%);
}

.xiaohei-scene__energy-aura--inner {
  width: 18%;
  aspect-ratio: 1;
  border: 1px solid rgb(161 255 236 / 72%);
  box-shadow: 0 0 0.8rem rgb(85 255 220 / 72%), inset 0 0 0.7rem rgb(105 255 226 / 52%);
}

.xiaohei-scene__energy-mote {
  left: 33%;
  top: 52%;
  width: 0.34rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #A8FFEB;
  box-shadow: 0 0 0.55rem rgb(91 255 219 / 92%);
  opacity: 0;
  will-change: transform, opacity;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__energy-aura--outer {
  animation: xiaohei-energy-outer 1.5s ease-in-out infinite;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__energy-aura--inner {
  animation: xiaohei-energy-inner 1.5s ease-out infinite;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__energy-mote--one {
  animation: xiaohei-energy-mote-one 1.35s ease-in infinite;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__energy-mote--two {
  animation: xiaohei-energy-mote-two 1.35s ease-in -0.45s infinite;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__energy-mote--three {
  animation: xiaohei-energy-mote-three 1.35s ease-in -0.9s infinite;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__mascot-sheet--open {
  opacity: 0;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__mascot-sheet--blink {
  opacity: 0;
  animation: none;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__mascot-energy,
html[data-xiaohei-state='thinking'] .xiaohei-scene__energy-fx {
  opacity: 1;
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

@keyframes xiaohei-mascot-blink {
  0%, 91.9% { opacity: 0; }
  92%, 94.5% { opacity: 1; }
  94.6%, 100% { opacity: 0; }
}

@keyframes xiaohei-energy-outer {
  0%, 100% { transform: translate(-50%, -50%) scale(0.82); opacity: 0.42; }
  50% { transform: translate(-50%, -50%) scale(1.14); opacity: 0.9; }
}

@keyframes xiaohei-energy-inner {
  from { transform: translate(-50%, -50%) scale(1.35); opacity: 0; }
  34% { opacity: 0.88; }
  to { transform: translate(-50%, -50%) scale(0.72); opacity: 0; }
}

@keyframes xiaohei-energy-mote-one {
  from { transform: translate3d(-2.8rem, -2.1rem, 0) scale(0.55); opacity: 0; }
  24% { opacity: 0.95; }
  to { transform: translate3d(-0.1rem, -0.1rem, 0) scale(0.18); opacity: 0; }
}

@keyframes xiaohei-energy-mote-two {
  from { transform: translate3d(3.1rem, -1.45rem, 0) scale(0.48); opacity: 0; }
  24% { opacity: 0.86; }
  to { transform: translate3d(0.1rem, -0.05rem, 0) scale(0.18); opacity: 0; }
}

@keyframes xiaohei-energy-mote-three {
  from { transform: translate3d(-2.35rem, 2.55rem, 0) scale(0.52); opacity: 0; }
  24% { opacity: 0.9; }
  to { transform: translate3d(-0.08rem, 0.08rem, 0) scale(0.18); opacity: 0; }
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
  .xiaohei-scene__mascot-sheet--blink,
  .xiaohei-scene__energy-fx > span {
    animation: none;
    will-change: auto;
  }

  .xiaohei-scene__spirit { display: none; }
  .xiaohei-scene__energy-mote { display: none; }

  html[data-xiaohei-state='thinking'] .xiaohei-scene__energy-fx > span {
    animation: none;
    will-change: auto;
  }
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
        mascot.append(
          createIdleSheet(doc, 7, 'xiaohei-scene__mascot-sheet--open'),
          createIdleSheet(doc, 6, 'xiaohei-scene__mascot-sheet--blink'),
          createEnergyImage(doc),
          createEnergyEffects(doc),
        )
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

function createIdleSheet(doc: Document, frame: number, modifier: string): HTMLImageElement {
  const sheet = doc.createElement('img')
  sheet.className = `xiaohei-scene__mascot-sheet ${modifier}`
  sheet.alt = ''
  sheet.decoding = 'async'
  sheet.fetchPriority = 'low'
  sheet.src = XIAOHEI_IDLE_SHEET
  setIdleFrame(sheet, frame)
  return sheet
}

function setIdleFrame(sheet: HTMLImageElement, frame: number): void {
  const column = frame % 4
  const row = Math.floor(frame / 4)
  sheet.style.transform = `translate3d(${-column * 25}%, ${-row * 50}%, 0)`
}

function createEnergyImage(doc: Document): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = 'xiaohei-scene__mascot-energy'
  image.alt = ''
  image.decoding = 'async'
  image.fetchPriority = 'low'
  image.src = XIAOHEI_ENERGY
  return image
}

function createEnergyEffects(doc: Document): HTMLSpanElement {
  const effects = doc.createElement('span')
  effects.className = 'xiaohei-scene__energy-fx'
  for (const className of [
    'xiaohei-scene__energy-aura xiaohei-scene__energy-aura--outer',
    'xiaohei-scene__energy-aura xiaohei-scene__energy-aura--inner',
    'xiaohei-scene__energy-mote xiaohei-scene__energy-mote--one',
    'xiaohei-scene__energy-mote xiaohei-scene__energy-mote--two',
    'xiaohei-scene__energy-mote xiaohei-scene__energy-mote--three',
  ]) {
    const part = doc.createElement('span')
    part.className = className
    effects.append(part)
  }
  return effects
}
