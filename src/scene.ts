import {
  XIAOHEI_COMPLETE,
  XIAOHEI_DAWN_KEY_ART,
  XIAOHEI_THINKING,
  XIAOHEI_ERROR,
  XIAOHEI_HEIXIU_BLINK,
  XIAOHEI_HEIXIU_OPEN,
  XIAOHEI_IDLE_BLINK,
  XIAOHEI_IDLE_SHEET,
  XIAOHEI_NIGHT_KEY_ART,
  XIAOHEI_STREAMING,
  XIAOHEI_TOOL,
  XIAOHEI_WAITING,
} from './generated-keyart.js'
import { XIAOHEI_HEIXIU_FEEDBACK_CSS } from './scene/heixiu-feedback.js'
import { XIAOHEI_HEIXIU_INTERACTION_CSS } from './scene/heixiu-interactions.js'
import { XIAOHEI_STATE_TRANSITION_CSS } from './scene/state-transitions.js'

/** DOM ids are exported so lifecycle and browser tests can detect leaks. */
export const XIAOHEI_SCENE_STYLE_ID = 'dsh-theme-xiaohei/scene-style'
export const XIAOHEI_SCENE_LAYER_ID = 'dsh-theme-xiaohei/scene-layer'

/**
 * The generated key art is a real raster asset. CSS supplies only atmosphere
 * and motion, never a shape-built substitute for the character.
 */
const XIAOHEI_SCENE_BASE_CSS = `
body {
  background: #19424A;
}

html[data-xiaohei-appearance='light'] body {
  background: #E6ECE6;
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

html[data-xiaohei-appearance='light'] #${cssEscape(XIAOHEI_SCENE_LAYER_ID)} {
  background: #E6ECE6;
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
  transform: scale(1.015);
  transition: opacity 320ms ease-out;
}

.xiaohei-scene__keyart--night {
  opacity: 0.9;
  filter: brightness(1.16) contrast(1.12) saturate(0.78);
}

.xiaohei-scene__keyart--dawn {
  opacity: 0;
  filter: brightness(0.96) contrast(0.92) saturate(0.7);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__keyart--night {
  opacity: 0;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__keyart--dawn {
  opacity: 0.94;
}

.xiaohei-scene__veil {
  inset: 0;
  background:
    linear-gradient(90deg, rgb(3 10 12 / 10%) 0%, rgb(3 10 12 / 5%) 48%, rgb(3 10 12 / 17%) 100%),
    radial-gradient(ellipse at 82% 22%, rgb(3 10 12 / 12%) 0%, rgb(3 10 12 / 5%) 28%, transparent 56%),
    linear-gradient(180deg, rgb(3 10 12 / 4%) 0%, transparent 54%, rgb(3 10 12 / 13%) 100%);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__veil {
  background:
    linear-gradient(90deg, rgb(226 233 226 / 30%) 0%, rgb(233 237 231 / 18%) 42%, rgb(219 228 220 / 24%) 100%),
    radial-gradient(ellipse at 57% 43%, rgb(226 232 224 / 32%) 0%, rgb(226 232 224 / 14%) 34%, transparent 68%),
    linear-gradient(180deg, rgb(229 234 227 / 14%) 0%, transparent 52%, rgb(205 216 207 / 22%) 100%);
}

.xiaohei-scene__aura {
  width: 48vmax;
  aspect-ratio: 1.28;
  right: -9vmax;
  bottom: -18vmax;
  border-radius: 50%;
  background: radial-gradient(ellipse at 56% 54%, rgb(117 228 208 / 35%) 0%, rgb(58 161 151 / 15%) 36%, transparent 70%);
  mix-blend-mode: screen;
  opacity: 0.46;
  transform: scale(0.96);
  will-change: transform, opacity;
  animation: xiaohei-scene-aura 7.5s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__aura {
  background: radial-gradient(ellipse at 56% 54%, rgb(73 143 119 / 18%) 0%, rgb(87 137 116 / 9%) 38%, transparent 70%);
  mix-blend-mode: multiply;
  opacity: 0.28;
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

html[data-xiaohei-appearance='light'] .xiaohei-scene__spirit {
  background: #4D927C;
  box-shadow: 0 0 0.45rem rgb(67 133 111 / 54%), 0 0 1.4rem rgb(106 151 132 / 28%);
  mix-blend-mode: multiply;
}

.xiaohei-scene__spirit--one {
  right: 22%;
  bottom: 20%;
  animation: xiaohei-spirit-one 6.8s cubic-bezier(0.37, 0, 0.63, 1) infinite;
}

.xiaohei-scene__spirit--two {
  right: 34%;
  bottom: 30%;
  animation: xiaohei-spirit-two 8.4s cubic-bezier(0.37, 0, 0.63, 1) -2.2s infinite;
}

.xiaohei-scene__spirit--three {
  right: 13%;
  bottom: 45%;
  animation: xiaohei-spirit-three 7.7s cubic-bezier(0.37, 0, 0.63, 1) -4.1s infinite;
}

.xiaohei-scene__sidebar-aura {
  left: -7rem;
  top: 30%;
  width: 24rem;
  height: 32rem;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 44% 52%,
    rgb(108 239 215 / 78%) 0%,
    rgb(43 154 143 / 38%) 34%,
    transparent 70%
  );
  mix-blend-mode: screen;
  opacity: 0.88;
  will-change: opacity;
  animation: xiaohei-sidebar-aura 9.5s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate;
}

.xiaohei-scene__sidebar-current {
  left: 2.2rem;
  top: 35%;
  width: 11rem;
  height: 21rem;
  border-left: 1px solid rgb(169 255 236 / 92%);
  border-radius: 56% 0 0 48%;
  box-shadow: -0.45rem 0 1.55rem rgb(88 229 203 / 48%);
  opacity: 0.62;
  transform: rotate(-9deg);
  will-change: opacity;
  -webkit-mask-image: linear-gradient(180deg, transparent, black 18%, black 76%, transparent);
  mask-image: linear-gradient(180deg, transparent, black 18%, black 76%, transparent);
  animation: xiaohei-sidebar-current 8.8s ease-in-out infinite;
}

.xiaohei-scene__sidebar-spirit {
  width: 0.48rem;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #D0FFF4;
  box-shadow:
    0 0 0.55rem rgb(159 255 235 / 100%),
    0 0 1.5rem rgb(70 217 194 / 90%);
  mix-blend-mode: screen;
  opacity: 0;
  will-change: transform, opacity;
}

.xiaohei-scene__sidebar-spirit::after {
  content: '';
  position: absolute;
  inset: -0.48rem;
  border: 1px solid rgb(151 255 233 / 58%);
  border-radius: 50%;
  box-shadow: 0 0 0.8rem rgb(86 229 203 / 32%);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__sidebar-aura {
  background: radial-gradient(
    ellipse at 44% 52%,
    rgb(75 139 116 / 24%) 0%,
    rgb(91 137 117 / 11%) 34%,
    transparent 70%
  );
  mix-blend-mode: multiply;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__sidebar-current {
  border-left-color: rgb(49 114 94 / 46%);
  box-shadow: -0.45rem 0 1.55rem rgb(75 130 108 / 18%);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__sidebar-spirit {
  background: #397E69;
  box-shadow:
    0 0 0.45rem rgb(67 126 106 / 52%),
    0 0 1.2rem rgb(91 139 120 / 30%);
  mix-blend-mode: multiply;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__sidebar-spirit::after {
  border-color: rgb(49 114 94 / 38%);
  box-shadow: 0 0 0.7rem rgb(75 130 108 / 18%);
}

.xiaohei-scene__sidebar-signature {
  position: absolute;
  display: block;
  z-index: 1;
  left: 3.9rem;
  top: 45%;
  width: 11rem;
  color: var(--xiaohei-signature-ink);
  font-family: 'AR PL UKai CN', STKaiti, KaiTi, FangSong, serif;
  font-size: 4.15rem;
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: -0.18em;
  text-align: center;
  text-shadow:
    0.04em 0.025em 0 rgb(5 19 23 / 28%),
    -0.025em 0.04em 0 rgb(111 211 196 / 14%);
  mix-blend-mode: screen;
  opacity: 0.16;
  transform: rotate(-9deg) skewX(-3deg) scaleY(1.06);
  pointer-events: none;
  user-select: none;
}

.xiaohei-scene__sidebar-signature::after {
  content: '';
  position: absolute;
  left: 1.8rem;
  right: 0.9rem;
  bottom: -0.38rem;
  height: 0.34rem;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  opacity: 0.72;
  transform: rotate(-4deg) skewX(-18deg);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__sidebar-signature {
  text-shadow:
    0.04em 0.025em 0 rgb(25 61 58 / 16%),
    -0.025em 0.04em 0 rgb(255 255 255 / 34%);
  mix-blend-mode: multiply;
  opacity: 0.17;
}

.xiaohei-scene__sidebar-spirit--one {
  left: 4.1rem;
  top: 46%;
  animation: xiaohei-sidebar-spirit-one 10.5s ease-in-out infinite;
}

.xiaohei-scene__sidebar-spirit--two {
  left: 9.2rem;
  top: 57%;
  width: 0.38rem;
  animation: xiaohei-sidebar-spirit-two 12.4s ease-in-out -4.3s infinite;
}

.xiaohei-scene__sidebar-spirit--three {
  left: 5.8rem;
  top: 67%;
  width: 0.32rem;
  animation: xiaohei-sidebar-spirit-three 11.6s ease-in-out -7.1s infinite;
}

html:has(#root [data-slot='sidebar'] > div[class*='_collapsed']) .xiaohei-scene__sidebar-aura,
html:has(#root [data-slot='sidebar'] > div[class*='_collapsed']) .xiaohei-scene__sidebar-current,
html:has(#root [data-slot='sidebar'] > div[class*='_collapsed']) .xiaohei-scene__sidebar-spirit,
html:has(#root [data-slot='sidebar'] > div[class*='_collapsed']) .xiaohei-scene__sidebar-signature {
  display: none;
}

.xiaohei-scene__mascot {
  right: clamp(4.5rem, 8vw, 9rem);
  bottom: clamp(5rem, 10vh, 7rem);
  width: clamp(11.5rem, 19vw, 19rem);
  aspect-ratio: 1;
  overflow: visible;
  isolation: isolate;
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

#root [data-slot='sidebar'] > div,
#root [data-slot='conversation.composer.bar'] > div {
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
  z-index: 3;
  left: 7.15rem;
  right: auto;
  top: 8.05rem;
  width: 2.5rem;
  --heixiu-opacity: 0.64;
  --heixiu-blink-duration: 8.9s;
  --heixiu-blink-delay: -4.7s;
  animation: xiaohei-heixiu-drift-two 16.2s cubic-bezier(0.37, 0, 0.63, 1) -5.2s infinite;
}

.xiaohei-scene__heixiu--composer {
  z-index: 3;
  left: 54%;
  right: auto;
  top: -1.7rem;
  width: 3.45rem;
  --heixiu-opacity: 0.6;
  --heixiu-blink-duration: 9.4s;
  --heixiu-blink-delay: -6.2s;
  animation: xiaohei-heixiu-drift-three 17.2s cubic-bezier(0.37, 0, 0.63, 1) -8.1s infinite;
}

.xiaohei-scene__heixiu--sidebar::before,
.xiaohei-scene__heixiu--composer::before {
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

#root [data-slot='sidebar'] > div[class*='_collapsed'] .xiaohei-scene__heixiu--sidebar {
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

@keyframes xiaohei-scene-aura {
  from { transform: scale(0.94); opacity: 0.44; }
  to { transform: scale(1.05); opacity: 0.78; }
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

@keyframes xiaohei-heixiu-drift-three {
  0%, 100% { transform: translate3d(0.25rem, 0.15rem, 0); }
  37% { transform: translate3d(-0.65rem, 0.72rem, 0); }
  72% { transform: translate3d(0.48rem, -0.55rem, 0); }
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

@keyframes xiaohei-sidebar-aura {
  from { opacity: 0.58; }
  to { opacity: 0.88; }
}

@keyframes xiaohei-sidebar-current {
  0%, 100% { opacity: 0.24; }
  48% { opacity: 0.62; }
}

@keyframes xiaohei-sidebar-spirit-one {
  0%, 100% { transform: translate3d(0, 1.1rem, 0) scale(0.72); opacity: 0.12; }
  42% { transform: translate3d(0.75rem, -1.15rem, 0) scale(1); opacity: 0.92; }
  68% { transform: translate3d(0.35rem, -2.15rem, 0) scale(0.82); opacity: 0.38; }
}

@keyframes xiaohei-sidebar-spirit-two {
  0%, 100% { transform: translate3d(0.6rem, 0.9rem, 0) scale(0.68); opacity: 0.08; }
  46% { transform: translate3d(-0.55rem, -1.35rem, 0) scale(0.94); opacity: 0.78; }
  72% { transform: translate3d(-0.15rem, -2.35rem, 0) scale(0.78); opacity: 0.3; }
}

@keyframes xiaohei-sidebar-spirit-three {
  0%, 100% { transform: translate3d(-0.35rem, 0.8rem, 0) scale(0.66); opacity: 0.06; }
  38% { transform: translate3d(0.5rem, -1.2rem, 0) scale(0.9); opacity: 0.68; }
  66% { transform: translate3d(0.15rem, -2rem, 0) scale(0.74); opacity: 0.24; }
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
  .xiaohei-scene__keyart--night {
    object-position: 68% center;
    opacity: 0.82;
  }

  .xiaohei-scene__keyart--dawn { opacity: 0; }

  html[data-xiaohei-appearance='light'] .xiaohei-scene__keyart--night { opacity: 0; }

  html[data-xiaohei-appearance='light'] .xiaohei-scene__keyart--dawn {
    object-position: 62% center;
    opacity: 0.9;
  }

  .xiaohei-scene__veil {
    background: linear-gradient(180deg, rgb(5 12 15 / 16%), rgb(5 12 15 / 40%));
  }

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

  .xiaohei-scene__heixiu--composer {
    left: 52%;
    right: auto;
    top: -1.45rem;
    width: 2.8rem;
  }

  .xiaohei-scene__sidebar-aura,
  .xiaohei-scene__sidebar-current,
  .xiaohei-scene__sidebar-spirit {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .xiaohei-scene__aura,
  .xiaohei-scene__spirit,
  .xiaohei-scene__sidebar-aura,
  .xiaohei-scene__sidebar-current,
  .xiaohei-scene__sidebar-spirit,
  .xiaohei-scene__heixiu,
  .xiaohei-scene__heixiu-open,
  .xiaohei-scene__heixiu-blink,
  .xiaohei-scene__thinking-dot,
  .xiaohei-scene__state-fx > span {
    animation: none;
    will-change: auto;
  }

  .xiaohei-scene__spirit { display: none; }
  .xiaohei-scene__sidebar-current,
  .xiaohei-scene__sidebar-spirit { display: none; }
  .xiaohei-scene__state-fx { display: none; }

  html[data-xiaohei-state='thinking'] .xiaohei-scene__thinking-dot {
    animation: none;
    will-change: auto;
    opacity: 0.72;
  }
}

@media (update: slow) {
  .xiaohei-scene__sidebar-current,
  .xiaohei-scene__sidebar-spirit {
    display: none;
  }

  .xiaohei-scene__sidebar-aura {
    animation: none;
    will-change: auto;
    opacity: 0.58;
  }
}

@media (prefers-contrast: more) {
  .xiaohei-scene__keyart--night { opacity: 0.48; }
  .xiaohei-scene__keyart--dawn { opacity: 0; }
  html[data-xiaohei-appearance='light'] .xiaohei-scene__keyart--night { opacity: 0; }
  html[data-xiaohei-appearance='light'] .xiaohei-scene__keyart--dawn { opacity: 0.5; }
  .xiaohei-scene__veil { background: rgb(5 12 15 / 48%); }
  html[data-xiaohei-appearance='light'] .xiaohei-scene__veil { background: rgb(235 240 235 / 58%); }
  .xiaohei-scene__aura,
  .xiaohei-scene__spirit,
  .xiaohei-scene__sidebar-aura,
  .xiaohei-scene__sidebar-current,
  .xiaohei-scene__sidebar-spirit,
  .xiaohei-scene__sidebar-signature,
  .xiaohei-scene__heixiu-field,
  .xiaohei-scene__heixiu--sidebar,
  .xiaohei-scene__heixiu--composer { display: none; }
}

@media (forced-colors: active), print {
  #${cssEscape(XIAOHEI_SCENE_LAYER_ID)},
  .xiaohei-scene__heixiu--sidebar,
  .xiaohei-scene__heixiu--composer { display: none; }
}
`

export const XIAOHEI_SCENE_CSS = [
  XIAOHEI_SCENE_BASE_CSS,
  XIAOHEI_STATE_TRANSITION_CSS,
  XIAOHEI_HEIXIU_FEEDBACK_CSS,
  XIAOHEI_HEIXIU_INTERACTION_CSS,
].join('\n')

const PARTS = [
  'xiaohei-scene__keyart xiaohei-scene__keyart--night',
  'xiaohei-scene__keyart xiaohei-scene__keyart--dawn',
  'xiaohei-scene__veil',
  'xiaohei-scene__aura',
  'xiaohei-scene__spirit xiaohei-scene__spirit--one',
  'xiaohei-scene__spirit xiaohei-scene__spirit--two',
  'xiaohei-scene__spirit xiaohei-scene__spirit--three',
  'xiaohei-scene__sidebar-aura',
  'xiaohei-scene__sidebar-current',
  'xiaohei-scene__sidebar-spirit xiaohei-scene__sidebar-spirit--one',
  'xiaohei-scene__sidebar-spirit xiaohei-scene__sidebar-spirit--two',
  'xiaohei-scene__sidebar-spirit xiaohei-scene__sidebar-spirit--three',
  'xiaohei-scene__mascot',
  'xiaohei-scene__heixiu-field',
] as const

/** Number of top-level decorative parts installed into the ambient layer. */
export const XIAOHEI_SCENE_PART_COUNT = PARTS.length

/** Skip host lookups while every companion remains attached to the document. */
export function shouldRestoreXiaoheiHeixiuCompanions(
  creatures: readonly Pick<Node, 'isConnected'>[],
): boolean {
  return creatures.some(creature => !creature.isConnected)
}

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
  let removeHeixiuCompanions = (): void => {}

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

    const keyArtSources = [XIAOHEI_NIGHT_KEY_ART, XIAOHEI_DAWN_KEY_ART] as const
    for (const [index, source] of keyArtSources.entries()) {
      const keyArt = doc.createElement('img')
      keyArt.className = PARTS[index]!
      keyArt.alt = ''
      keyArt.decoding = 'async'
      keyArt.fetchPriority = 'low'
      keyArt.src = source
      layer.append(keyArt)
    }

    for (const className of PARTS.slice(keyArtSources.length)) {
      if (className === 'xiaohei-scene__mascot') {
        const mascot = doc.createElement('div')
        mascot.className = className
        const idleViewport = doc.createElement('span')
        idleViewport.className = 'xiaohei-scene__mascot-idle-viewport'
        idleViewport.append(
          createIdleSheet(doc, 7, 'xiaohei-scene__mascot-sheet--open'),
          createIdleBlink(doc),
        )
        mascot.append(
          idleViewport,
          createStateImage(doc, 'thinking', XIAOHEI_THINKING),
          createStateImage(doc, 'streaming', XIAOHEI_STREAMING),
          createStateImage(doc, 'tool', XIAOHEI_TOOL),
          createStateImage(doc, 'waiting', XIAOHEI_WAITING),
          createStateImage(doc, 'complete', XIAOHEI_COMPLETE),
          createStateImage(doc, 'error', XIAOHEI_ERROR),
          createThinkingEffects(doc),
          createStateEffects(doc, 'streaming', [
            'xiaohei-scene__tail-write xiaohei-scene__tail-write--one',
            'xiaohei-scene__tail-write xiaohei-scene__tail-write--two',
            'xiaohei-scene__tail-write xiaohei-scene__tail-write--three',
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

      if (className === 'xiaohei-scene__heixiu-field') {
        layer.append(createHeixiuField(doc))
        continue
      }

      const part = doc.createElement('span')
      part.className = className
      layer.append(part)
    }

    doc.body.prepend(layer)
    removeHeixiuCompanions()
    removeHeixiuCompanions = installHeixiuCompanions(doc, layer)
    removeMountedScene = () => {
      removeHeixiuCompanions()
      removeHeixiuCompanions = () => {}
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

function createIdleBlink(doc: Document): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = 'xiaohei-scene__mascot-blink'
  image.alt = ''
  image.decoding = 'async'
  image.fetchPriority = 'low'
  image.src = XIAOHEI_IDLE_BLINK
  return image
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

function createHeixiuField(doc: Document): HTMLDivElement {
  const field = doc.createElement('div')
  field.className = 'xiaohei-scene__heixiu-field'

  field.append(
    createHeixiuCreature(doc, 'mascot'),
  )

  return field
}

function createHeixiuCreature(doc: Document, name: string): HTMLSpanElement {
  const creature = doc.createElement('span')
  creature.className = `xiaohei-scene__heixiu xiaohei-scene__heixiu--${name}`
  creature.setAttribute('aria-hidden', 'true')
  const body = doc.createElement('span')
  body.className = 'xiaohei-scene__heixiu-body'
  body.append(
    createHeixiuImage(doc, XIAOHEI_HEIXIU_OPEN, 'xiaohei-scene__heixiu-open'),
    createHeixiuImage(doc, XIAOHEI_HEIXIU_BLINK, 'xiaohei-scene__heixiu-blink'),
  )
  creature.append(body)
  return creature
}

function installHeixiuCompanions(doc: Document, layer: HTMLDivElement): () => void {
  const sidebarSignature = createSidebarSignature(doc)
  const companions = [
    { slot: 'sidebar', creature: createHeixiuCreature(doc, 'sidebar') },
    { slot: 'conversation.composer.bar', creature: createHeixiuCreature(doc, 'composer') },
  ] as const
  const companionCreatures = companions.map(({ creature }) => creature)
  let attachQueued = false

  const attach = (): void => {
    attachQueued = false
    const sidebarHost = doc.querySelector<HTMLElement>("[data-slot='sidebar']")?.firstElementChild
    if (sidebarHost !== null && sidebarHost !== undefined && sidebarSignature.parentElement !== sidebarHost) {
      sidebarHost.append(sidebarSignature)
    }
    for (const { slot, creature } of companions) {
      const host = doc.querySelector<HTMLElement>(`[data-slot='${slot}']`)?.firstElementChild
      if (host !== null && host !== undefined && creature.parentElement !== host) host.append(creature)
    }
  }

  const queueAttach = (): void => {
    if (attachQueued) return
    attachQueued = true
    queueMicrotask(attach)
  }

  const restoreDetachedCompanions = (): void => {
    if (sidebarSignature.isConnected && !shouldRestoreXiaoheiHeixiuCompanions(companionCreatures)) return
    queueAttach()
  }

  attach()
  const Observer = doc.defaultView?.MutationObserver
  const observer = Observer === undefined ? undefined : new Observer(restoreDetachedCompanions)
  observer?.observe(doc.body, { childList: true, subtree: true })

  return () => {
    observer?.disconnect()
    sidebarSignature.remove()
    for (const { creature } of companions) creature.remove()
  }
}

function createSidebarSignature(doc: Document): HTMLSpanElement {
  const signature = doc.createElement('span')
  signature.className = 'xiaohei-scene__sidebar-signature'
  signature.setAttribute('aria-hidden', 'true')
  signature.textContent = '小黑'
  return signature
}

function createHeixiuImage(doc: Document, source: string, className: string): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = className
  image.alt = ''
  image.decoding = 'async'
  image.fetchPriority = 'low'
  image.src = source
  return image
}

function createThinkingEffects(doc: Document): HTMLSpanElement {
  const effects = doc.createElement('span')
  effects.className = 'xiaohei-scene__thinking-fx'
  const bubble = doc.createElement('span')
  bubble.className = 'xiaohei-scene__thinking-bubble'
  for (const suffix of ['one', 'two', 'three']) {
    const dot = doc.createElement('span')
    dot.className = `xiaohei-scene__thinking-dot xiaohei-scene__thinking-dot--${suffix}`
    bubble.append(dot)
  }
  effects.append(bubble)
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
