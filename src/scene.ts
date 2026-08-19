import {
  XIAOHEI_COMPLETE,
  XIAOHEI_ENERGY,
  XIAOHEI_ERROR,
  XIAOHEI_IDLE_SHEET,
  XIAOHEI_KEY_ART,
  XIAOHEI_STREAMING,
  XIAOHEI_TOOL,
  XIAOHEI_WAITING,
} from './generated-keyart.js'

/** DOM ids are exported so lifecycle and browser tests can detect leaks. */
export const XIAOHEI_SCENE_STYLE_ID = 'dsh-theme-xiaohei/scene-style'
export const XIAOHEI_SCENE_LAYER_ID = 'dsh-theme-xiaohei/scene-layer'

/**
 * The generated key art is a real raster asset. CSS supplies only atmosphere
 * and motion, never a shape-built substitute for the character.
 */
export const XIAOHEI_SCENE_CSS = `
body {
  background: #19424A;
}

#root {
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
  background: #19424A;
}

#${cssEscape(XIAOHEI_SCENE_LAYER_ID)} > * {
  position: absolute;
  display: block;
  pointer-events: none;
}

/*
 * DSH keeps the sidebar structure and behavior. Xiaohei only strengthens its
 * native hierarchy, focus treatment, and translucent control material.
 */
#root [data-slot='sidebar'] > div {
  background:
    radial-gradient(130% 48% at 12% 90%, rgb(51 138 126 / 18%) 0%, transparent 68%),
    linear-gradient(180deg, rgb(5 18 22 / 70%) 0%, rgb(6 20 23 / 62%) 58%, rgb(6 22 24 / 78%) 100%) !important;
  border-right: 1px solid rgb(139 229 213 / 14%);
  box-shadow: inset -1px 0 rgb(255 255 255 / 2%), 16px 0 36px rgb(1 9 10 / 14%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child {
  min-height: 62px;
  padding-inline: 14px;
  border-bottom: 1px solid rgb(139 229 213 / 8%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child {
  min-width: 30px;
  min-height: 30px;
  border-radius: 8px;
  transition: color 180ms ease, background-color 180ms ease;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child:hover {
  color: #E7F3F0;
  background: rgb(101 209 190 / 10%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'] {
  width: auto;
  min-height: 40px;
  margin: 10px 12px 12px;
  padding-inline: 14px;
  justify-content: flex-start;
  gap: 10px;
  border: 1px solid rgb(101 209 190 / 22%);
  border-radius: 11px;
  background: linear-gradient(180deg, rgb(101 209 190 / 15%), rgb(101 209 190 / 9%)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 5%);
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:hover {
  border-color: rgb(123 224 206 / 36%);
  background: linear-gradient(180deg, rgb(101 209 190 / 21%), rgb(101 209 190 / 13%)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 7%), 0 6px 18px rgb(1 9 10 / 12%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div > div:first-child {
  min-height: 38px;
  margin-inline: 4px;
  padding-inline: 8px;
  border-radius: 9px;
  background: rgb(3 14 17 / 18%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div > div:first-child > span:first-child {
  color: #A9C3BD;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] button {
  min-width: 28px;
  min-height: 28px;
  border-radius: 7px;
  transition: color 180ms ease, background-color 180ms ease;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] button:hover {
  color: #E7F3F0;
  background: rgb(101 209 190 / 10%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] [role='tree'] {
  padding-top: 6px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] [role='tree'] > div:only-child:not([role]) {
  margin: 2px 4px 0;
  padding: 16px 14px 17px;
  border: 1px solid rgb(139 229 213 / 9%);
  border-radius: 11px;
  color: #91AAA5;
  background:
    radial-gradient(circle at 88% 22%, rgb(101 209 190 / 10%), transparent 34%),
    rgb(3 14 17 / 22%);
  font-size: 12px;
  line-height: 1.5;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:last-child {
  gap: 2px;
  margin: 8px 12px 12px;
  padding: 4px;
  border: 1px solid rgb(139 229 213 / 10%);
  border-radius: 12px;
  background: rgb(3 14 17 / 34%);
  box-shadow: inset 0 1px rgb(255 255 255 / 3%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.footer.action'] > button,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.settings'] > button {
  min-height: 36px;
  padding-inline: 10px;
  border-radius: 8px;
  color: #B9D0CB;
  transition: color 180ms ease, background-color 180ms ease;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.footer.action'] > button:hover,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.settings'] > button:hover,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.footer.action'] > button[aria-expanded='true'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.settings'] > button[aria-expanded='true'] {
  color: #E7F3F0;
  background: rgb(101 209 190 / 10%);
}

#root [data-slot='sidebar'] button:focus-visible {
  outline: 2px solid #78DDCB;
  outline-offset: 2px;
}

.xiaohei-scene__keyart {
  inset: -2.5%;
  width: 105%;
  height: 105%;
  max-width: none;
  object-fit: cover;
  object-position: center;
  opacity: 0.98;
  filter: brightness(1.36) contrast(1.1) saturate(1.06);
}

.xiaohei-scene__veil {
  inset: 0;
  background:
    radial-gradient(ellipse at 58% 48%, rgb(3 10 12 / 18%) 0%, rgb(3 10 12 / 8%) 34%, transparent 68%),
    linear-gradient(180deg, transparent 66%, rgb(3 10 12 / 10%) 100%);
}

.xiaohei-scene__aura {
  width: 58vmax;
  aspect-ratio: 1;
  right: -16vmax;
  bottom: -23vmax;
  border-radius: 50%;
  background: radial-gradient(circle, rgb(117 228 208 / 42%) 0%, rgb(58 161 151 / 19%) 38%, transparent 70%);
  mix-blend-mode: screen;
  opacity: 0.78;
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
  isolation: isolate;
  filter:
    drop-shadow(0 0.6rem 1.45rem rgb(83 218 193 / 35%))
    drop-shadow(0 1.25rem 2.6rem rgb(1 9 10 / 30%));
}

.xiaohei-scene__mascot::before {
  content: '';
  position: absolute;
  z-index: 0;
  inset: 4%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 50% 55%,
    rgb(190 255 242 / 68%) 0%,
    rgb(90 228 202 / 48%) 38%,
    rgb(34 144 132 / 18%) 58%,
    transparent 74%
  );
  opacity: 0.94;
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
  z-index: 1;
  filter: brightness(1.32) contrast(1.02) saturate(1.04);
}

.xiaohei-scene__mascot-sheet--open {
  opacity: 1;
  transition: opacity 120ms ease-out;
}

.xiaohei-scene__mascot-sheet--blink {
  will-change: opacity;
  animation: xiaohei-mascot-blink 5.2s step-end infinite;
}

.xiaohei-scene__mascot-state {
  position: absolute;
  display: block;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: fill;
  opacity: 0;
  z-index: 1;
  filter: brightness(1.32) contrast(1.02) saturate(1.04);
  transition: opacity 120ms ease-out;
}

html:not([data-xiaohei-state='idle']) .xiaohei-scene__mascot-sheet--open {
  opacity: 0;
}

html:not([data-xiaohei-state='idle']) .xiaohei-scene__mascot-sheet--blink {
  opacity: 0;
  animation: none;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__mascot-state--thinking,
html[data-xiaohei-state='streaming'] .xiaohei-scene__mascot-state--streaming,
html[data-xiaohei-state='tool'] .xiaohei-scene__mascot-state--tool,
html[data-xiaohei-state='waiting'] .xiaohei-scene__mascot-state--waiting,
html[data-xiaohei-state='complete'] .xiaohei-scene__mascot-state--complete,
html[data-xiaohei-state='error'] .xiaohei-scene__mascot-state--error {
  opacity: 1;
}

.xiaohei-scene__energy-fx,
.xiaohei-scene__energy-fx > span {
  position: absolute;
  display: block;
  pointer-events: none;
}

.xiaohei-scene__energy-fx {
  inset: 0;
  z-index: 2;
  opacity: 0;
  transition: opacity 120ms ease-out;
}

.xiaohei-scene__state-fx,
.xiaohei-scene__state-fx > span {
  position: absolute;
  display: block;
  pointer-events: none;
}

.xiaohei-scene__state-fx {
  inset: 0;
  z-index: 2;
  opacity: 0;
  transition: opacity 120ms ease-out;
}

.xiaohei-scene__state-fx > span {
  border-radius: 50%;
  opacity: 0;
  will-change: transform, opacity;
}

html[data-xiaohei-state='streaming'] .xiaohei-scene__state-fx--streaming,
html[data-xiaohei-state='tool'] .xiaohei-scene__state-fx--tool,
html[data-xiaohei-state='waiting'] .xiaohei-scene__state-fx--waiting,
html[data-xiaohei-state='complete'] .xiaohei-scene__state-fx--complete,
html[data-xiaohei-state='error'] .xiaohei-scene__state-fx--error {
  opacity: 1;
}

.xiaohei-scene__stream-mote {
  left: 18%;
  top: 51%;
  width: 0.3rem;
  aspect-ratio: 1;
  background: #A8FFEB;
  box-shadow: 0 0 0.65rem rgb(91 255 219 / 92%);
}

html[data-xiaohei-state='streaming'] .xiaohei-scene__stream-mote--one {
  animation: xiaohei-stream-mote 1.25s ease-out infinite;
}

html[data-xiaohei-state='streaming'] .xiaohei-scene__stream-mote--two {
  animation: xiaohei-stream-mote 1.25s ease-out -0.42s infinite;
}

html[data-xiaohei-state='streaming'] .xiaohei-scene__stream-mote--three {
  animation: xiaohei-stream-mote 1.25s ease-out -0.84s infinite;
}

.xiaohei-scene__tool-key {
  top: 68%;
  width: 0.3rem;
  aspect-ratio: 0.7;
  background: #70F2D9;
  box-shadow: 0 0 0.7rem rgb(72 238 208 / 90%);
}

.xiaohei-scene__tool-key--one { left: 35%; }
.xiaohei-scene__tool-key--two { left: 42%; }
.xiaohei-scene__tool-key--three { left: 49%; }

html[data-xiaohei-state='tool'] .xiaohei-scene__tool-key--one {
  animation: xiaohei-tool-key 0.9s ease-in-out infinite;
}

html[data-xiaohei-state='tool'] .xiaohei-scene__tool-key--two {
  animation: xiaohei-tool-key 0.9s ease-in-out -0.3s infinite;
}

html[data-xiaohei-state='tool'] .xiaohei-scene__tool-key--three {
  animation: xiaohei-tool-key 0.9s ease-in-out -0.6s infinite;
}

.xiaohei-scene__waiting-ring {
  left: 28%;
  top: 37%;
  width: 13%;
  aspect-ratio: 1;
  border: 1px solid rgb(255 207 126 / 88%);
  box-shadow: 0 0 0.8rem rgb(255 188 93 / 42%);
}

html[data-xiaohei-state='waiting'] .xiaohei-scene__waiting-ring {
  animation: xiaohei-waiting-ring 1.8s ease-out infinite;
}

.xiaohei-scene__complete-spark {
  left: 50%;
  top: 57%;
  width: 0.35rem;
  aspect-ratio: 1;
  background: #B6FFED;
  box-shadow: 0 0 0.8rem rgb(91 255 219 / 92%);
}

html[data-xiaohei-state='complete'] .xiaohei-scene__complete-spark--one {
  animation: xiaohei-complete-spark-one 0.8s ease-out infinite;
}

html[data-xiaohei-state='complete'] .xiaohei-scene__complete-spark--two {
  animation: xiaohei-complete-spark-two 0.8s ease-out -0.4s infinite;
}

.xiaohei-scene__error-glow {
  left: 50%;
  top: 58%;
  width: 7%;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgb(255 112 82 / 90%) 0%, rgb(224 58 46 / 28%) 48%, transparent 72%);
  mix-blend-mode: screen;
}

html[data-xiaohei-state='error'] .xiaohei-scene__error-glow {
  animation: xiaohei-error-glow 2.2s ease-in-out infinite;
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

@keyframes xiaohei-stream-mote {
  from { transform: translate3d(0, 0.55rem, 0) scale(0.45); opacity: 0; }
  28% { opacity: 0.92; }
  to { transform: translate3d(-2.1rem, -1.05rem, 0) scale(1); opacity: 0; }
}

@keyframes xiaohei-tool-key {
  0%, 100% { transform: translate3d(0, 0, 0) scale(0.7); opacity: 0.18; }
  45% { transform: translate3d(0, -0.15rem, 0) scale(1); opacity: 1; }
}

@keyframes xiaohei-waiting-ring {
  from { transform: translate3d(-50%, -50%, 0) scale(0.55); opacity: 0.72; }
  to { transform: translate3d(-50%, -50%, 0) scale(1.45); opacity: 0; }
}

@keyframes xiaohei-complete-spark-one {
  from { transform: translate3d(-0.4rem, 0.4rem, 0) scale(0.45); opacity: 0; }
  35% { opacity: 1; }
  to { transform: translate3d(-2.5rem, -2rem, 0) scale(1.15); opacity: 0; }
}

@keyframes xiaohei-complete-spark-two {
  from { transform: translate3d(0.4rem, 0.3rem, 0) scale(0.45); opacity: 0; }
  35% { opacity: 0.95; }
  to { transform: translate3d(2.5rem, -1.75rem, 0) scale(1.1); opacity: 0; }
}

@keyframes xiaohei-error-glow {
  0%, 100% { transform: translate3d(-50%, -50%, 0) scale(0.78); opacity: 0.34; }
  50% { transform: translate3d(-50%, -50%, 0) scale(1.12); opacity: 0.9; }
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
  .xiaohei-scene__energy-fx > span,
  .xiaohei-scene__state-fx > span {
    animation: none;
    will-change: auto;
  }

  .xiaohei-scene__spirit { display: none; }
  .xiaohei-scene__energy-mote { display: none; }
  .xiaohei-scene__state-fx { display: none; }

  html[data-xiaohei-state='thinking'] .xiaohei-scene__energy-fx > span {
    animation: none;
    will-change: auto;
  }
}

@media (prefers-reduced-transparency: reduce) {
  #root [data-slot='sidebar'] > div {
    background: #07181B !important;
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
          createStateImage(doc, 'thinking', XIAOHEI_ENERGY),
          createStateImage(doc, 'streaming', XIAOHEI_STREAMING),
          createStateImage(doc, 'tool', XIAOHEI_TOOL),
          createStateImage(doc, 'waiting', XIAOHEI_WAITING),
          createStateImage(doc, 'complete', XIAOHEI_COMPLETE),
          createStateImage(doc, 'error', XIAOHEI_ERROR),
          createEnergyEffects(doc),
          createStateEffects(doc, 'streaming', [
            'xiaohei-scene__stream-mote xiaohei-scene__stream-mote--one',
            'xiaohei-scene__stream-mote xiaohei-scene__stream-mote--two',
            'xiaohei-scene__stream-mote xiaohei-scene__stream-mote--three',
          ]),
          createStateEffects(doc, 'tool', [
            'xiaohei-scene__tool-key xiaohei-scene__tool-key--one',
            'xiaohei-scene__tool-key xiaohei-scene__tool-key--two',
            'xiaohei-scene__tool-key xiaohei-scene__tool-key--three',
          ]),
          createStateEffects(doc, 'waiting', ['xiaohei-scene__waiting-ring']),
          createStateEffects(doc, 'complete', [
            'xiaohei-scene__complete-spark xiaohei-scene__complete-spark--one',
            'xiaohei-scene__complete-spark xiaohei-scene__complete-spark--two',
          ]),
          createStateEffects(doc, 'error', ['xiaohei-scene__error-glow']),
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

function createStateImage(doc: Document, state: string, source: string): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = `xiaohei-scene__mascot-state xiaohei-scene__mascot-state--${state}`
  image.alt = ''
  image.decoding = 'async'
  image.fetchPriority = 'low'
  image.src = source
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

function createStateEffects(doc: Document, state: string, classNames: readonly string[]): HTMLSpanElement {
  const effects = doc.createElement('span')
  effects.className = `xiaohei-scene__state-fx xiaohei-scene__state-fx--${state}`
  for (const className of classNames) {
    const part = doc.createElement('span')
    part.className = className
    effects.append(part)
  }
  return effects
}
