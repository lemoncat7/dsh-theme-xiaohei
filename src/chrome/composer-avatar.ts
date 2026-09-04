import { XIAOHEI_SPIRIT_DOORWAY_RING } from '../generated-keyart.js'

/**
 * Layered break-frame portrait.
 *
 * The character is rendered from authored raster poses. Only the body layer is
 * clipped by the doorway. Hair, ears and action hands are repeated through
 * dedicated masks above the front rim. Keeping one renderer and one state
 * machine avoids the pose jumps caused by handing off between DOM and WebGL.
 */
export const XIAOHEI_COMPOSER_AVATAR_CSS = `
.xiaohei-composer-avatar {
  --xiaohei-composer-avatar-x: 0px;
  --xiaohei-composer-avatar-y: 0px;
  --xiaohei-composer-avatar-scale: 1;
  --xiaohei-avatar-look-x: 0px;
  --xiaohei-avatar-look-y: 0px;
  --xiaohei-avatar-look-rotation: 0deg;
  --xiaohei-avatar-stage-x: 0px;
  --xiaohei-avatar-stage-y: 0px;
  --xiaohei-avatar-stage-scale: 1;
  --xiaohei-avatar-ring-scale-x: 1;
  --xiaohei-avatar-ring-scale-y: 1;
  position: fixed;
  inset: 0 auto auto 0;
  z-index: 4;
  display: block;
  box-sizing: border-box;
  inline-size: 172px;
  block-size: 184px;
  opacity: 0;
  cursor: pointer;
  pointer-events: auto;
  touch-action: manipulation;
  contain: layout style;
  transform:
    translate3d(
      var(--xiaohei-composer-avatar-x),
      var(--xiaohei-composer-avatar-y),
      0
    )
    scale(var(--xiaohei-composer-avatar-scale));
  transform-origin: 50% 100%;
  transition:
    opacity 180ms ease,
    transform 440ms cubic-bezier(.2, .82, .2, 1);
  will-change: transform;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-ready='true'] {
  opacity: 1;
}

.xiaohei-composer-avatar__effects-back,
.xiaohei-composer-avatar__ring-back,
.xiaohei-composer-avatar__circle,
.xiaohei-composer-avatar__overflow,
.xiaohei-composer-avatar__ring-front,
.xiaohei-composer-avatar__breakout-right,
.xiaohei-composer-avatar__effects-front {
  position: absolute;
  display: block;
  box-sizing: border-box;
  pointer-events: none;
}

.xiaohei-composer-avatar__effects-back {
  z-index: 0;
  inset: auto 3px -4px;
  inline-size: 166px;
  block-size: 166px;
  border-radius: 50%;
  opacity: .46;
  background:
    radial-gradient(ellipse at 50% 87%, rgb(17 23 22 / 24%), transparent 47%),
    conic-gradient(
      from 205deg,
      transparent 0 18%,
      rgb(133 164 126 / 12%) 24% 31%,
      transparent 37% 79%,
      rgb(184 204 169 / 10%) 85% 90%,
      transparent 95%
    );
  filter: blur(5px);
  transform: scale(.97);
  transition:
    opacity 300ms ease,
    transform 500ms cubic-bezier(.2, .82, .2, 1);
}

.xiaohei-composer-avatar__ring-back,
.xiaohei-composer-avatar__ring-front {
  inset-inline-start: 14px;
  inset-block-end: 3px;
  inline-size: 144px;
  block-size: 144px;
  border-radius: 50%;
  border: 0;
  background: url("${XIAOHEI_SPIRIT_DOORWAY_RING}") center / contain no-repeat;
  transform:
    scaleX(var(--xiaohei-avatar-ring-scale-x))
    scaleY(var(--xiaohei-avatar-ring-scale-y));
  transition:
    filter 220ms ease,
    transform 260ms cubic-bezier(.16, 1, .3, 1);
}

.xiaohei-composer-avatar__ring-back {
  z-index: 1;
  opacity: .94;
  filter:
    saturate(.82)
    contrast(1.02)
    drop-shadow(0 7px 9px rgb(9 13 12 / 19%));
}

.xiaohei-composer-avatar__circle,
.xiaohei-composer-avatar__overflow,
.xiaohei-composer-avatar__breakout-right {
  inset-inline-start: 20px;
  inset-block-end: 9px;
  inline-size: 132px;
  block-size: 132px;
  border-radius: 50%;
}

.xiaohei-composer-avatar__circle {
  z-index: 2;
  overflow: hidden;
  background: transparent;
}

.xiaohei-composer-avatar__overflow {
  z-index: 3;
  overflow: visible;
}

.xiaohei-composer-avatar__ring-front {
  z-index: 4;
  clip-path: inset(67% -8px -8px -8px);
  filter:
    saturate(.9)
    contrast(1.05)
    drop-shadow(0 2px 2px rgb(6 10 9 / 22%));
}

.xiaohei-composer-avatar__ring-front::after {
  content: '';
  position: absolute;
  inset: auto 18px 3px;
  block-size: 15px;
  border-radius: 50%;
  opacity: .34;
  background: radial-gradient(ellipse, rgb(173 194 157 / 26%), transparent 69%);
  filter: blur(4px);
}

.xiaohei-composer-avatar__breakout-right {
  z-index: 6;
  overflow: visible;
}

.xiaohei-composer-avatar__effects-front {
  z-index: 7;
  inset: auto 6px -1px;
  inline-size: 160px;
  block-size: 160px;
  border-radius: 50%;
  opacity: 0;
  border: 1px solid rgb(173 194 157 / 42%);
  border-inline-start-color: transparent;
  border-block-start-color: transparent;
  transform: scale(.78);
}

.xiaohei-composer-avatar__image {
  --xiaohei-portrait-size: 244px;
  --xiaohei-portrait-bottom: -76px;
  --xiaohei-portrait-x: 0px;
  position: absolute;
  inset-inline-start: 50%;
  inset-block-end: var(--xiaohei-portrait-bottom);
  z-index: 1;
  display: block;
  inline-size: auto;
  block-size: var(--xiaohei-portrait-size);
  max-inline-size: none;
  opacity: 0;
  transform:
    translate3d(
      calc(
        -50%
        + var(--xiaohei-avatar-look-x)
        + var(--xiaohei-portrait-x)
        + var(--xiaohei-avatar-stage-x)
      ),
      calc(var(--xiaohei-avatar-look-y) + var(--xiaohei-avatar-stage-y)),
      0
    )
    rotate(var(--xiaohei-avatar-look-rotation))
    scale(var(--xiaohei-avatar-stage-scale));
  transform-origin: 50% 58%;
  transition:
    opacity 150ms cubic-bezier(.22, .72, .24, 1),
    transform 260ms cubic-bezier(.16, 1, .3, 1);
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
  will-change: opacity, transform;
}

.xiaohei-composer-avatar__image--inside-brace,
.xiaohei-composer-avatar__image--overflow-brace,
.xiaohei-composer-avatar__image--breakout-right-brace {
  --xiaohei-portrait-size: 202px;
  --xiaohei-portrait-bottom: -43px;
  --xiaohei-portrait-x: -3px;
}

.xiaohei-composer-avatar__image--inside-reach,
.xiaohei-composer-avatar__image--overflow-reach,
.xiaohei-composer-avatar__image--breakout-right-reach {
  --xiaohei-portrait-size: 202px;
  --xiaohei-portrait-bottom: -43px;
  --xiaohei-portrait-x: -2px;
}

.xiaohei-composer-avatar__image--inside-working,
.xiaohei-composer-avatar__image--overflow-working,
.xiaohei-composer-avatar__image--inside-complete,
.xiaohei-composer-avatar__image--overflow-complete {
  --xiaohei-portrait-size: 216px;
  --xiaohei-portrait-bottom: -54px;
}

.xiaohei-composer-avatar__image--inside-error,
.xiaohei-composer-avatar__image--overflow-error {
  --xiaohei-portrait-size: 260px;
  --xiaohei-portrait-bottom: -84px;
}

.xiaohei-composer-avatar__overflow > .xiaohei-composer-avatar__image {
  z-index: 1;
}

.xiaohei-composer-avatar__image--overflow-idle,
.xiaohei-composer-avatar__image--overflow-thinking,
.xiaohei-composer-avatar__image--overflow-working,
.xiaohei-composer-avatar__image--overflow-complete,
.xiaohei-composer-avatar__image--overflow-error {
  clip-path: polygon(8% 0, 92% 0, 92% 47%, 77% 56%, 23% 56%, 8% 47%);
}

/* Blink is an eye patch, not a full portrait swap. The idle artwork remains
   perfectly still underneath, so WebP compression differences cannot flash
   the character's hair, clothes or silhouette. */
.xiaohei-composer-avatar__image--inside-blink {
  display: none;
}

.xiaohei-composer-avatar__image--overflow-blink {
  clip-path: none;
  -webkit-mask-image: radial-gradient(
    ellipse 28% 13% at 50% 40%,
    #000 52%,
    rgb(0 0 0 / 84%) 70%,
    transparent 100%
  );
  mask-image: radial-gradient(
    ellipse 28% 13% at 50% 40%,
    #000 52%,
    rgb(0 0 0 / 84%) 70%,
    transparent 100%
  );
  transition: opacity 52ms ease-out;
}

.xiaohei-composer-avatar__image--overflow-brace {
  clip-path: polygon(3% 0, 72% 0, 72% 52%, 60% 61%, 10% 61%, 3% 52%);
}

.xiaohei-composer-avatar__image--overflow-reach {
  clip-path: polygon(0 0, 66% 0, 66% 54%, 58% 62%, 7% 62%, 0 54%);
}

.xiaohei-composer-avatar__breakout-right > .xiaohei-composer-avatar__image {
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.xiaohei-composer-avatar__image--breakout-right-brace {
  -webkit-mask-image: radial-gradient(ellipse 20% 23% at 79% 60%, #000 0 69%, transparent 82%);
  mask-image: radial-gradient(ellipse 20% 23% at 79% 60%, #000 0 69%, transparent 82%);
}

.xiaohei-composer-avatar__image--breakout-right-reach {
  -webkit-mask-image: radial-gradient(ellipse 25% 30% at 81% 58%, #000 0 70%, transparent 83%);
  mask-image: radial-gradient(ellipse 25% 30% at 81% 58%, #000 0 70%, transparent 83%);
}

.xiaohei-composer-avatar[data-xiaohei-portrait='idle'] :is(
  .xiaohei-composer-avatar__image--inside-idle,
  .xiaohei-composer-avatar__image--overflow-idle
),
.xiaohei-composer-avatar[data-xiaohei-portrait='thinking'] :is(
  .xiaohei-composer-avatar__image--inside-thinking,
  .xiaohei-composer-avatar__image--overflow-thinking
),
.xiaohei-composer-avatar[data-xiaohei-portrait='working'] :is(
  .xiaohei-composer-avatar__image--inside-working,
  .xiaohei-composer-avatar__image--overflow-working
),
.xiaohei-composer-avatar[data-xiaohei-portrait='complete'] :is(
  .xiaohei-composer-avatar__image--inside-complete,
  .xiaohei-composer-avatar__image--overflow-complete
),
.xiaohei-composer-avatar[data-xiaohei-portrait='error'] :is(
  .xiaohei-composer-avatar__image--inside-error,
  .xiaohei-composer-avatar__image--overflow-error
),
.xiaohei-composer-avatar[data-xiaohei-portrait='brace'] :is(
  .xiaohei-composer-avatar__image--inside-brace,
  .xiaohei-composer-avatar__image--overflow-brace,
  .xiaohei-composer-avatar__image--breakout-right-brace
),
.xiaohei-composer-avatar[data-xiaohei-portrait='reach'] :is(
  .xiaohei-composer-avatar__image--inside-reach,
  .xiaohei-composer-avatar__image--overflow-reach,
  .xiaohei-composer-avatar__image--breakout-right-reach
) {
  opacity: 1;
}

.xiaohei-composer-avatar[data-xiaohei-portrait='idle'][data-xiaohei-avatar-blink='true']
  .xiaohei-composer-avatar__image--overflow-blink {
  opacity: 1;
}

.xiaohei-composer-avatar:hover,
.xiaohei-composer-avatar[data-xiaohei-avatar-aware] {
  --xiaohei-avatar-stage-y: -2px;
  --xiaohei-avatar-stage-scale: 1.018;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-near] {
  --xiaohei-avatar-stage-y: -4px;
  --xiaohei-avatar-stage-scale: 1.028;
}

.xiaohei-composer-avatar:hover .xiaohei-composer-avatar__effects-back,
.xiaohei-composer-avatar[data-xiaohei-avatar-aware] .xiaohei-composer-avatar__effects-back {
  opacity: .72;
  transform: scale(1.025) rotate(-1deg);
}

.xiaohei-composer-avatar:hover .xiaohei-composer-avatar__ring-back {
  filter:
    saturate(.9)
    contrast(1.04)
    drop-shadow(0 8px 11px rgb(9 13 12 / 23%));
}

.xiaohei-composer-avatar[data-xiaohei-avatar-reaction] {
  --xiaohei-avatar-look-x: 0px;
  --xiaohei-avatar-look-y: 0px;
  --xiaohei-avatar-look-rotation: 0deg;
  --xiaohei-avatar-stage-x: 0px;
  --xiaohei-avatar-stage-y: 0px;
  --xiaohei-avatar-stage-scale: 1;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-reaction='touch'] .xiaohei-composer-avatar__image {
  animation: xiaohei-avatar-touch-motion 1340ms cubic-bezier(.22, .72, .24, 1) both;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-reaction='touch'] :is(
  .xiaohei-composer-avatar__ring-back,
  .xiaohei-composer-avatar__ring-front
) {
  animation: xiaohei-avatar-touch-ring 1340ms cubic-bezier(.22, .72, .24, 1) both;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-reaction='touch'] .xiaohei-composer-avatar__effects-back {
  animation: xiaohei-avatar-touch-shadow 1340ms cubic-bezier(.22, .72, .24, 1) both;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-reaction='touch'] .xiaohei-composer-avatar__effects-front,
.xiaohei-composer-avatar[data-xiaohei-portrait='complete'] .xiaohei-composer-avatar__effects-front {
  animation: xiaohei-avatar-ring-response 1340ms ease-out 1;
}

.xiaohei-composer-avatar:not([data-xiaohei-avatar-reaction]) :is(
  .xiaohei-composer-avatar__circle,
  .xiaohei-composer-avatar__overflow
) > .xiaohei-composer-avatar__image {
  animation: xiaohei-avatar-breathe 4.8s ease-in-out infinite;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='glance-left']:not([data-xiaohei-avatar-aware]) {
  --xiaohei-avatar-look-x: -2px;
  --xiaohei-avatar-look-rotation: -1deg;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='glance-right']:not([data-xiaohei-avatar-aware]) {
  --xiaohei-avatar-look-x: 2px;
  --xiaohei-avatar-look-rotation: 1deg;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='glance-left']:not([data-xiaohei-avatar-aware]) .xiaohei-composer-avatar__image {
  animation: xiaohei-avatar-glance-left 1760ms cubic-bezier(.22, .72, .24, 1) both;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='glance-right']:not([data-xiaohei-avatar-aware]) .xiaohei-composer-avatar__image {
  animation: xiaohei-avatar-glance-right 1760ms cubic-bezier(.22, .72, .24, 1) both;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='nod']:not([data-xiaohei-avatar-aware]) .xiaohei-composer-avatar__image {
  animation: xiaohei-avatar-nod 1520ms cubic-bezier(.22, .72, .24, 1) both;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='perk']:not([data-xiaohei-avatar-aware]) {
  --xiaohei-avatar-stage-y: -4px;
  --xiaohei-avatar-stage-scale: 1.02;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='perk']:not([data-xiaohei-avatar-aware]) .xiaohei-composer-avatar__image {
  animation: xiaohei-avatar-perk 1640ms cubic-bezier(.16, 1, .3, 1) both;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='peek']:not([data-xiaohei-avatar-aware]) {
  --xiaohei-avatar-stage-x: 2px;
  --xiaohei-avatar-stage-y: -5px;
  --xiaohei-avatar-stage-scale: 1.024;
  --xiaohei-avatar-look-rotation: 1.1deg;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='peek']:not([data-xiaohei-avatar-aware]) .xiaohei-composer-avatar__image {
  animation: xiaohei-avatar-peek 1860ms cubic-bezier(.22, .72, .24, 1) both;
}

.xiaohei-composer-avatar[data-xiaohei-avatar-idle='ponder']:not([data-xiaohei-avatar-aware]) .xiaohei-composer-avatar__image {
  animation: xiaohei-avatar-ponder 2260ms cubic-bezier(.22, .72, .24, 1) both;
}

.xiaohei-composer-avatar[data-xiaohei-portrait='idle'][data-xiaohei-avatar-idle='double-blink']
  .xiaohei-composer-avatar__image--overflow-blink {
  animation: xiaohei-avatar-double-blink-closed 760ms linear both;
}

.xiaohei-composer-avatar[data-xiaohei-portrait='working'] .xiaohei-composer-avatar__effects-back {
  opacity: .68;
  animation: xiaohei-avatar-focus 2.6s ease-in-out infinite;
}

.xiaohei-composer-avatar[data-xiaohei-portrait='complete'] :is(
  .xiaohei-composer-avatar__image,
  .xiaohei-composer-avatar__ring-back,
  .xiaohei-composer-avatar__ring-front
) {
  animation: xiaohei-avatar-complete 880ms cubic-bezier(.16, 1, .3, 1) 1;
}

.xiaohei-composer-avatar[data-xiaohei-portrait='error'] :is(
  .xiaohei-composer-avatar__image
) {
  animation: xiaohei-avatar-error 420ms ease-out 1;
}

html[data-xiaohei-appearance='light'] .xiaohei-composer-avatar__ring-back {
  filter:
    saturate(.78)
    brightness(.97)
    contrast(1.02)
    drop-shadow(0 7px 9px rgb(42 47 44 / 14%));
}

html[data-xiaohei-appearance='light'] .xiaohei-composer-avatar__ring-front {
  filter:
    saturate(.84)
    brightness(.98)
    contrast(1.04)
    drop-shadow(0 2px 2px rgb(42 47 44 / 16%));
}

@keyframes xiaohei-avatar-breathe {
  0%, 100% { translate: 0 0; }
  48% { translate: 0 -1.5px; }
}

@keyframes xiaohei-avatar-touch-motion {
  0%, 100% { translate: 0 0; scale: 1; rotate: 0deg; }
  10% { translate: 0 3px; scale: .982; rotate: 0deg; }
  27% { translate: -1px -5px; scale: 1.018; rotate: -0.4deg; }
  43% { translate: 0 -10px; scale: 1.058; rotate: 0.35deg; }
  58% { translate: 1px -7px; scale: 1.04; rotate: 0deg; }
  75% { translate: -1px -4px; scale: 1.016; rotate: -0.25deg; }
  89% { translate: 0 1px; scale: .994; rotate: 0deg; }
}

@keyframes xiaohei-avatar-touch-ring {
  0%, 100% { translate: 0 0; scale: 1 1; }
  10% { translate: 0 1px; scale: .96 1.018; }
  43% { translate: 0 -1px; scale: 1.065 1.035; }
  72% { translate: 0 0; scale: 1.018 1.01; }
  89% { translate: 0 1px; scale: .994 1.004; }
}

@keyframes xiaohei-avatar-touch-shadow {
  0%, 100% { opacity: .46; transform: scale(.97); }
  10% { opacity: .38; transform: scale(.93); }
  43% { opacity: .76; transform: scale(1.07); }
  72% { opacity: .58; transform: scale(1.015); }
}

@keyframes xiaohei-avatar-glance-left {
  0%, 100% { translate: 0 0; rotate: 0deg; }
  22%, 68% { translate: -1.5px 0; rotate: -1.15deg; }
  80% { translate: -1px .5px; rotate: -.65deg; }
}

@keyframes xiaohei-avatar-glance-right {
  0%, 100% { translate: 0 0; rotate: 0deg; }
  22%, 68% { translate: 1.5px 0; rotate: 1.15deg; }
  80% { translate: 1px .5px; rotate: .65deg; }
}

@keyframes xiaohei-avatar-nod {
  0%, 100% { translate: 0 0; rotate: 0deg; }
  24% { translate: 0 1px; rotate: 0deg; }
  43% { translate: 0 3px; rotate: .35deg; }
  61% { translate: 0 -1px; rotate: -.25deg; }
  78% { translate: 0 .4px; rotate: 0deg; }
}

@keyframes xiaohei-avatar-perk {
  0%, 100% { translate: 0 0; scale: 1; }
  24% { translate: 0 1px; scale: .992; }
  43%, 68% { translate: 0 -3px; scale: 1.018; }
  82% { translate: 0 -1px; scale: 1.006; }
}

@keyframes xiaohei-avatar-peek {
  0%, 100% { translate: 0 0; rotate: 0deg; }
  22% { translate: 1px -1px; rotate: .4deg; }
  42%, 70% { translate: 3px -3px; rotate: 1.15deg; }
  84% { translate: 1px -1px; rotate: .45deg; }
}

@keyframes xiaohei-avatar-ponder {
  0%, 100% { translate: 0 0; rotate: 0deg; }
  18% { translate: 0 1px; rotate: 0deg; }
  36%, 72% { translate: -1px -1px; rotate: -1deg; }
  84% { translate: -.5px 0; rotate: -.45deg; }
}

@keyframes xiaohei-avatar-double-blink-closed {
  0%, 12%, 29%, 45%, 100% { opacity: 0; }
  18%, 23%, 35%, 40% { opacity: 1; }
}

@keyframes xiaohei-avatar-ring-response {
  0%, 24% { opacity: 0; transform: scale(.78); }
  42% { opacity: .52; transform: scale(.96) rotate(1deg); }
  72%, 100% { opacity: 0; transform: scale(1.14) rotate(8deg); }
}

@keyframes xiaohei-avatar-focus {
  0%, 100% { opacity: .52; transform: scale(.98); }
  50% { opacity: .72; transform: scale(1.025); }
}

@keyframes xiaohei-avatar-complete {
  0%, 100% { translate: 0 0; scale: 1; }
  35% { translate: 0 -4px; scale: 1.025; }
  64% { translate: 0 -1px; scale: 1.01; }
}

@keyframes xiaohei-avatar-error {
  0%, 100% { translate: 0 0; }
  34% { translate: -2px 1px; }
  68% { translate: 2px 1px; }
}

@media (prefers-reduced-motion: reduce) {
  .xiaohei-composer-avatar,
  .xiaohei-composer-avatar *,
  .xiaohei-composer-avatar *::before,
  .xiaohei-composer-avatar *::after {
    animation: none !important;
    transition-duration: .01ms !important;
  }
}

@media (forced-colors: active) {
  .xiaohei-composer-avatar {
    display: none;
  }
}
`
