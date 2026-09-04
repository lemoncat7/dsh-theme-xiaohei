import { XIAOHEI_HEIXIU_FEEDBACK_CSS } from './heixiu-feedback.js'
import { XIAOHEI_HEIXIU_INTERACTION_CSS } from './heixiu-interactions.js'
import { XIAOHEI_STATE_TRANSITION_CSS } from './state-transitions.js'
import { XIAOHEI_HOST_SELECTORS } from '../host-contract.js'

/** DOM ids are exported so lifecycle and browser tests can detect leaks. */
export const XIAOHEI_SCENE_STYLE_ID = 'dsh-theme-xiaohei/scene-style'
export const XIAOHEI_SCENE_LAYER_ID = 'dsh-theme-xiaohei/scene-layer'
export const XIAOHEI_SCENE_WORLD_CLASS = 'xiaohei-scene__world'

/** Quiet ink-and-silver atmosphere behind the application chrome. */
const XIAOHEI_SCENE_BASE_CSS = `
body {
  background: #111315;
}

html[data-xiaohei-appearance='light'] body {
  background: #E8EAEC;
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
  background:
    linear-gradient(148deg, #1D2022 0%, #151719 46%, #101214 100%);
}

html[data-xiaohei-appearance='light'] #${cssEscape(XIAOHEI_SCENE_LAYER_ID)} {
  background:
    linear-gradient(148deg, #F3F4F4 0%, #E8EAEC 48%, #D9DDE0 100%);
}

#${cssEscape(XIAOHEI_SCENE_LAYER_ID)}::before,
#${cssEscape(XIAOHEI_SCENE_LAYER_ID)}::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  pointer-events: none;
}

#${cssEscape(XIAOHEI_SCENE_LAYER_ID)}::before {
  inset: -16%;
  background:
    radial-gradient(ellipse 54% 48% at 8% 4%, rgb(232 235 236 / 8%), transparent 74%),
    radial-gradient(ellipse 52% 62% at 96% 82%, rgb(91 98 99 / 9%), transparent 76%),
    radial-gradient(ellipse 38% 32% at 76% 8%, rgb(207 211 212 / 3%), transparent 72%);
  filter: blur(36px);
}

html[data-xiaohei-appearance='light'] #${cssEscape(XIAOHEI_SCENE_LAYER_ID)}::before {
  background:
    radial-gradient(ellipse 58% 52% at 7% 0%, rgb(255 255 255 / 62%), transparent 74%),
    radial-gradient(ellipse 50% 62% at 98% 76%, rgb(177 183 187 / 16%), transparent 76%),
    radial-gradient(ellipse 48% 42% at 20% 108%, rgb(207 211 212 / 18%), transparent 78%);
}

#${cssEscape(XIAOHEI_SCENE_LAYER_ID)}::after {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.72'/%3E%3C/svg%3E");
  background-size: 180px 180px;
  mix-blend-mode: soft-light;
  opacity: 0.025;
}

html[data-xiaohei-appearance='light'] #${cssEscape(XIAOHEI_SCENE_LAYER_ID)}::after {
  mix-blend-mode: multiply;
  opacity: 0.018;
}

#${cssEscape(XIAOHEI_SCENE_LAYER_ID)} > * {
  position: absolute;
  display: block;
  pointer-events: none;
}

.${XIAOHEI_SCENE_WORLD_CLASS} {
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse 76% 64% at 16% 8%, rgb(75 80 83 / 22%), transparent 72%),
    radial-gradient(ellipse 66% 58% at 92% 84%, rgb(28 33 31 / 24%), transparent 76%),
    radial-gradient(ellipse 46% 36% at 72% 16%, rgb(111 117 119 / 5%), transparent 74%),
    linear-gradient(148deg, #24272A 0%, #17191B 45%, #101214 100%);
}

html[data-xiaohei-appearance='light'] .${XIAOHEI_SCENE_WORLD_CLASS} {
  background:
    radial-gradient(ellipse 76% 64% at 14% 6%, rgb(255 255 255 / 66%), transparent 72%),
    radial-gradient(ellipse 64% 58% at 94% 84%, rgb(184 190 193 / 24%), transparent 76%),
    radial-gradient(ellipse 44% 34% at 70% 14%, rgb(255 255 255 / 20%), transparent 74%),
    linear-gradient(148deg, #F3F4F4 0%, #E8EAEC 48%, #D9DDE0 100%);
}

.${XIAOHEI_SCENE_WORLD_CLASS} > * {
  width: 100%;
  height: 100%;
}

.xiaohei-scene__mascot {
  right: clamp(4.5rem, 8vw, 9rem);
  bottom: clamp(5rem, 10vh, 7rem);
  width: clamp(11.5rem, 19vw, 19rem);
  aspect-ratio: 1;
  overflow: visible;
  isolation: isolate;
  z-index: 3;
  filter:
    drop-shadow(0 0.6rem 1.45rem rgb(83 218 193 / 35%))
    drop-shadow(0 1.25rem 2.6rem rgb(1 9 10 / 30%));
}

.xiaohei-scene__mascot-idle-viewport {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
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
  opacity: 0.66;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__mascot {
  filter:
    drop-shadow(0 0.55rem 0.9rem rgb(40 58 51 / 22%))
    drop-shadow(0 1.15rem 2.2rem rgb(45 64 56 / 14%));
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__mascot::before {
  background: radial-gradient(
    circle at 50% 58%,
    rgb(236 242 230 / 72%) 0%,
    rgb(198 219 202 / 34%) 40%,
    transparent 72%
  );
  opacity: 0.42;
}

.xiaohei-scene__heixiu-field {
  inset: 0;
  z-index: 3;
  overflow: hidden;
}

.xiaohei-scene__heixiu {
  position: absolute;
  display: block;
  aspect-ratio: 1;
  opacity: var(--heixiu-opacity, 0.58);
  filter:
    drop-shadow(0 0.32rem 0.58rem rgb(109 233 211 / 18%))
    drop-shadow(0 0.68rem 1.15rem rgb(1 9 10 / 20%));
  will-change: transform;
}

${XIAOHEI_HOST_SELECTORS.sidebarShell} {
  position: relative !important;
}

.xiaohei-scene__heixiu-body > img {
  position: absolute;
  display: block;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: contain;
  filter: brightness(1.12) contrast(1.04) saturate(0.82);
}

.xiaohei-scene__heixiu-open {
  opacity: 1;
  will-change: opacity;
  animation: xiaohei-heixiu-open var(--heixiu-blink-duration, 7.6s) step-end var(--heixiu-blink-delay, 0s) infinite;
}

.xiaohei-scene__heixiu-blink {
  opacity: 0;
  will-change: opacity;
  animation: xiaohei-heixiu-blink var(--heixiu-blink-duration, 7.6s) step-end var(--heixiu-blink-delay, 0s) infinite;
}

.xiaohei-scene__heixiu--mascot {
  right: clamp(19rem, 25vw, 30rem);
  bottom: clamp(9.5rem, 16vh, 13rem);
  width: clamp(4.2rem, 5.4vw, 5.5rem);
  --heixiu-opacity: 0.72;
  --heixiu-blink-duration: 7.2s;
  --heixiu-blink-delay: -1.1s;
  animation: xiaohei-heixiu-drift-one 13.6s cubic-bezier(0.37, 0, 0.63, 1) infinite;
}

.xiaohei-scene__heixiu--sidebar {
  z-index: 6;
  left: 7.15rem;
  right: auto;
  top: 8.05rem;
  width: 2.5rem;
  --heixiu-opacity: 0.76;
  --heixiu-blink-duration: 8.9s;
  --heixiu-blink-delay: -4.7s;
  animation: xiaohei-heixiu-drift-two 16.2s cubic-bezier(0.37, 0, 0.63, 1) -5.2s infinite;
}

.xiaohei-scene__heixiu--sidebar .xiaohei-scene__heixiu-body > img {
  filter: brightness(1.18) contrast(1.09) saturate(0.86);
}

.xiaohei-scene__heixiu--sidebar::before {
  content: '';
  position: absolute;
  z-index: -1;
  left: 50%;
  top: -0.72rem;
  width: 1px;
  height: 0.85rem;
  background: linear-gradient(180deg, transparent, var(--xiaohei-frame-line-strong));
  box-shadow: 0 0 0.35rem var(--xiaohei-focus-shadow);
  transform: translateX(-50%);
}

${XIAOHEI_HOST_SELECTORS.sidebarShell}[class*='_collapsed'] .xiaohei-scene__heixiu--sidebar {
  display: none;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__heixiu {
  filter:
    drop-shadow(0 0.28rem 0.5rem rgb(52 83 71 / 13%))
    drop-shadow(0 0.62rem 1rem rgb(45 64 56 / 10%));
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__heixiu-body > img {
  filter: brightness(1.02) contrast(1.05) saturate(0.74);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__heixiu--sidebar .xiaohei-scene__heixiu-body > img {
  filter: brightness(1.03) contrast(1.1) saturate(0.78);
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

.xiaohei-scene__mascot-blink {
  position: absolute;
  display: block;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: contain;
  opacity: 0;
  z-index: 3;
  filter: brightness(1.32) contrast(1.02) saturate(1.04);
  will-change: opacity;
}

.xiaohei-scene__mascot-state {
  position: absolute;
  display: block;
  left: 50%;
  bottom: 0;
  width: 100%;
  height: auto;
  max-width: none;
  max-height: none;
  object-fit: contain;
  opacity: 0;
  z-index: 1;
  filter: brightness(1.32) contrast(1.02) saturate(1.04);
  transform: translateX(-50%);
  transform-origin: 50% 100%;
  transition: opacity 120ms ease-out;
}

.xiaohei-scene__mascot-state--thinking {
  filter: brightness(1.34) contrast(1.02) saturate(1.03);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__mascot-sheet,
html[data-xiaohei-appearance='light'] .xiaohei-scene__mascot-blink,
html[data-xiaohei-appearance='light'] .xiaohei-scene__mascot-state {
  filter: brightness(1.02) contrast(1.07) saturate(0.9);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__mascot-state--thinking {
  filter: brightness(1.04) contrast(1.06) saturate(0.91);
}

html:not([data-xiaohei-state='idle']) .xiaohei-scene__mascot-sheet--open {
  opacity: 0;
}

html:not([data-xiaohei-state='idle']) .xiaohei-scene__mascot-blink {
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

.xiaohei-scene__thinking-fx,
.xiaohei-scene__thinking-bubble,
.xiaohei-scene__thinking-dot {
  position: absolute;
  display: block;
  pointer-events: none;
}

.xiaohei-scene__thinking-fx {
  inset: 0;
  z-index: 3;
  opacity: 0;
  transition: opacity 160ms ease-out;
}

.xiaohei-scene__thinking-bubble {
  left: 56%;
  top: -4%;
  width: 36%;
  height: 18%;
  border: 1px solid rgb(210 242 235 / 44%);
  border-radius: 999px;
  background: rgb(226 242 238 / 88%);
  box-shadow:
    0 0.45rem 1.15rem rgb(1 9 10 / 18%),
    inset 0 1px rgb(255 255 255 / 68%);
}

.xiaohei-scene__thinking-bubble::before,
.xiaohei-scene__thinking-bubble::after {
  position: absolute;
  display: block;
  content: '';
  aspect-ratio: 1;
  border-radius: 50%;
  background: inherit;
  box-shadow: inherit;
}

.xiaohei-scene__thinking-bubble::before {
  left: 12%;
  bottom: -31%;
  width: 15%;
}

.xiaohei-scene__thinking-bubble::after {
  left: 2%;
  bottom: -51%;
  width: 8%;
}

.xiaohei-scene__thinking-dot {
  top: 50%;
  width: 9%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #526B66;
  opacity: 0.28;
  transform: translateY(-50%);
}

.xiaohei-scene__thinking-dot--one { left: 25%; }
.xiaohei-scene__thinking-dot--two { left: 46%; }
.xiaohei-scene__thinking-dot--three { left: 67%; }

html[data-xiaohei-state='thinking'] .xiaohei-scene__thinking-fx {
  opacity: 1;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__thinking-dot--one {
  animation: xiaohei-thinking-dot 1.8s ease-in-out infinite;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__thinking-dot--two {
  animation: xiaohei-thinking-dot 1.8s ease-in-out 0.3s infinite;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__thinking-dot--three {
  animation: xiaohei-thinking-dot 1.8s ease-in-out 0.6s infinite;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__thinking-bubble {
  border-color: rgb(46 94 83 / 20%);
  background: rgb(247 250 247 / 92%);
  box-shadow:
    0 0.45rem 1.1rem rgb(44 73 60 / 12%),
    inset 0 1px rgb(255 255 255 / 86%);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__thinking-dot {
  background: #45635C;
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

.xiaohei-scene__tail-write {
  left: var(--tail-write-left);
  top: var(--tail-write-top);
  width: var(--tail-write-width);
  height: 7%;
  border-top: 2px solid #A8FFEB;
  border-radius: 50%;
  filter: drop-shadow(0 0 0.34rem rgb(91 255 219 / 78%));
  transform: rotate(var(--tail-write-angle)) scaleX(0.08);
  transform-origin: 100% 50%;
}

.xiaohei-scene__tail-write--one {
  --tail-write-left: 67%;
  --tail-write-top: 34%;
  --tail-write-width: 16%;
  --tail-write-angle: -18deg;
}

.xiaohei-scene__tail-write--two {
  --tail-write-left: 59%;
  --tail-write-top: 27%;
  --tail-write-width: 19%;
  --tail-write-angle: -12deg;
}

.xiaohei-scene__tail-write--three {
  --tail-write-left: 50%;
  --tail-write-top: 21%;
  --tail-write-width: 21%;
  --tail-write-angle: -6deg;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__tail-write {
  border-top-color: #2F8576;
  filter: drop-shadow(0 0 0.28rem rgb(47 133 118 / 34%));
}

html[data-xiaohei-state='streaming'] .xiaohei-scene__tail-write--one {
  animation: xiaohei-tail-write 1.9s ease-in-out infinite;
}

html[data-xiaohei-state='streaming'] .xiaohei-scene__tail-write--two {
  animation: xiaohei-tail-write 1.9s ease-in-out 0.3s infinite;
}

html[data-xiaohei-state='streaming'] .xiaohei-scene__tail-write--three {
  animation: xiaohei-tail-write 1.9s ease-in-out 0.6s infinite;
}

.xiaohei-scene__tool-key {
  top: 84%;
  width: 0.3rem;
  aspect-ratio: 0.7;
  background: #70F2D9;
  box-shadow: 0 0 0.7rem rgb(72 238 208 / 90%);
}

.xiaohei-scene__tool-key--one { left: 29%; }
.xiaohei-scene__tool-key--two { left: 38%; }
.xiaohei-scene__tool-key--three { left: 47%; }

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
  left: 61%;
  top: 34%;
  width: 13%;
  aspect-ratio: 1;
  border: 1px solid rgb(255 207 126 / 88%);
  box-shadow: 0 0 0.8rem rgb(255 188 93 / 42%);
}

html[data-xiaohei-state='waiting'] .xiaohei-scene__waiting-ring {
  animation: xiaohei-waiting-ring 1.8s ease-out infinite;
}

.xiaohei-scene__complete-spark {
  width: 0.35rem;
  aspect-ratio: 1;
  background: #B6FFED;
  box-shadow: 0 0 0.8rem rgb(91 255 219 / 92%);
}

.xiaohei-scene__complete-spark--one { left: 36%; top: 70%; }
.xiaohei-scene__complete-spark--two { left: 62%; top: 67%; }

html[data-xiaohei-state='complete'] .xiaohei-scene__complete-spark--one {
  animation: xiaohei-complete-spark-one 0.8s ease-out infinite;
}

html[data-xiaohei-state='complete'] .xiaohei-scene__complete-spark--two {
  animation: xiaohei-complete-spark-two 0.8s ease-out -0.4s infinite;
}

.xiaohei-scene__error-glow {
  left: 41%;
  top: 82%;
  width: 7%;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgb(255 112 82 / 90%) 0%, rgb(224 58 46 / 28%) 48%, transparent 72%);
  mix-blend-mode: screen;
}

html[data-xiaohei-state='error'] .xiaohei-scene__error-glow {
  animation: xiaohei-error-glow 2.2s ease-in-out infinite;
}

@keyframes xiaohei-heixiu-blink {
  0%, 87.9% { opacity: 0; }
  88%, 90.4% { opacity: 1; }
  90.5%, 100% { opacity: 0; }
}

@keyframes xiaohei-heixiu-open {
  0%, 87.9% { opacity: 1; }
  88%, 90.4% { opacity: 0; }
  90.5%, 100% { opacity: 1; }
}

@keyframes xiaohei-heixiu-drift-one {
  0%, 100% { transform: translate3d(0, 0.4rem, 0); }
  28% { transform: translate3d(0.7rem, -0.2rem, 0); }
  61% { transform: translate3d(-0.45rem, -0.9rem, 0); }
  82% { transform: translate3d(0.28rem, -0.48rem, 0); }
}

@keyframes xiaohei-heixiu-drift-two {
  0%, 100% { transform: translate3d(-0.35rem, 0.25rem, 0); }
  34% { transform: translate3d(0.5rem, -0.72rem, 0); }
  68% { transform: translate3d(-0.6rem, -1.15rem, 0); }
}

@keyframes xiaohei-thinking-dot {
  0%, 18%, 100% { opacity: 0.28; }
  42%, 62% { opacity: 0.96; }
}

@keyframes xiaohei-tail-write {
  0%, 12% { transform: rotate(var(--tail-write-angle)) scaleX(0.08); opacity: 0; }
  38%, 68% { transform: rotate(var(--tail-write-angle)) scaleX(1); opacity: 0.94; }
  88%, 100% { transform: rotate(var(--tail-write-angle)) scaleX(1); opacity: 0; }
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
  .xiaohei-scene__mascot {
    right: -1.5rem;
    bottom: 5rem;
    width: clamp(10rem, 42vw, 14rem);
  }

  .xiaohei-scene__heixiu--mascot {
    right: 8.5rem;
    bottom: 7.5rem;
    width: 3.8rem;
  }

  .xiaohei-scene__heixiu--sidebar { display: none; }

}

@media (prefers-reduced-motion: reduce) {
  .xiaohei-scene__heixiu,
  .xiaohei-scene__heixiu-open,
  .xiaohei-scene__heixiu-blink,
  .xiaohei-scene__thinking-dot,
  .xiaohei-scene__state-fx > span {
    animation: none;
    transition: none;
    will-change: auto;
  }

  .xiaohei-scene__state-fx { display: none; }

  html[data-xiaohei-state='thinking'] .xiaohei-scene__thinking-dot {
    animation: none;
    will-change: auto;
    opacity: 0.72;
  }
}

@media (prefers-contrast: more) {
  .xiaohei-scene__heixiu-field,
  .xiaohei-scene__heixiu--sidebar { display: none; }
}

@media (forced-colors: active), print {
  #${cssEscape(XIAOHEI_SCENE_LAYER_ID)},
  .xiaohei-scene__heixiu--sidebar { display: none; }
}
`

export const XIAOHEI_SCENE_CSS = [
  XIAOHEI_SCENE_BASE_CSS,
  XIAOHEI_STATE_TRANSITION_CSS,
  XIAOHEI_HEIXIU_FEEDBACK_CSS,
  XIAOHEI_HEIXIU_INTERACTION_CSS,
].join('\n')

/** CSS id escaping for the slash in stable plugin-owned DOM ids. */
function cssEscape(value: string): string {
  return value.replaceAll('/', '\\/')
}
