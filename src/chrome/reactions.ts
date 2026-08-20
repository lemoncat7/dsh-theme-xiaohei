/** Complete-frame reaction strips. Timing and triggers live in ../reactions.ts. */
export const XIAOHEI_REACTION_CSS = `
.xiaohei-scene__idle-reaction {
  position: absolute;
  display: block;
  inset: 0 auto auto 0;
  width: 900%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: fill;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  filter: brightness(1.32) contrast(1.02) saturate(1.04);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__idle-reaction {
  filter: brightness(1.02) contrast(1.07) saturate(0.9);
}

.xiaohei-scene__mascot[data-xiaohei-reaction='ear-left'] .xiaohei-scene__idle-reaction,
.xiaohei-scene__mascot[data-xiaohei-reaction='ear-right'] .xiaohei-scene__idle-reaction {
  opacity: 1;
  animation: xiaohei-idle-ear-reaction 560ms steps(8, end) both;
}

.xiaohei-scene__mascot[data-xiaohei-ear-loop='true'] .xiaohei-scene__idle-reaction {
  animation-iteration-count: infinite;
}

.xiaohei-scene__mascot[data-xiaohei-reaction='tail-slow'] .xiaohei-scene__idle-reaction,
.xiaohei-scene__mascot[data-xiaohei-reaction='tail-complete'] .xiaohei-scene__idle-reaction {
  width: 1000%;
  opacity: 1;
  animation-name: xiaohei-idle-tail-reaction;
  animation-timing-function: steps(9, end);
  animation-fill-mode: both;
  animation-iteration-count: 1;
}

.xiaohei-scene__mascot[data-xiaohei-reaction='tail-slow'] .xiaohei-scene__idle-reaction {
  animation-duration: 1280ms;
}

.xiaohei-scene__mascot[data-xiaohei-reaction='tail-complete'] .xiaohei-scene__idle-reaction {
  animation-duration: 700ms;
}

/* Keep the live pupils while the pupil-free complete frame supplies motion. */
.xiaohei-scene__mascot[data-xiaohei-reaction] .xiaohei-gaze {
  z-index: 3;
  opacity: 1;
}

.xiaohei-scene__mascot[data-xiaohei-reaction] .xiaohei-gaze__base {
  opacity: 0;
}

/* Blink remains the highest character frame and naturally covers the pupils. */
.xiaohei-scene__mascot-blink {
  z-index: 4;
}

html:not([data-xiaohei-state='idle']) .xiaohei-scene__idle-reaction {
  opacity: 0;
  animation: none;
}

@keyframes xiaohei-idle-ear-reaction {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-88.888889%, 0, 0); }
}

@keyframes xiaohei-idle-tail-reaction {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-90%, 0, 0); }
}

@media (prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse) {
  .xiaohei-scene__idle-reaction { display: none; }
}
`
