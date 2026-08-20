/** Stable, opacity-only handoff between persistent character state layers. */
export const XIAOHEI_STATE_TRANSITION_CSS = `
.xiaohei-scene__mascot-sheet--open,
.xiaohei-scene__mascot-state {
  transition-property: opacity;
  transition-duration: 220ms;
  transition-timing-function: cubic-bezier(0.22, 0.72, 0.24, 1);
}

.xiaohei-scene__thinking-fx,
.xiaohei-scene__state-fx {
  transition-property: opacity;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
  transition-delay: 0ms;
}

html[data-xiaohei-state='thinking'] .xiaohei-scene__thinking-fx,
html[data-xiaohei-state='streaming'] .xiaohei-scene__state-fx--streaming,
html[data-xiaohei-state='tool'] .xiaohei-scene__state-fx--tool,
html[data-xiaohei-state='waiting'] .xiaohei-scene__state-fx--waiting,
html[data-xiaohei-state='complete'] .xiaohei-scene__state-fx--complete,
html[data-xiaohei-state='error'] .xiaohei-scene__state-fx--error {
  transition-delay: 70ms;
}

@media (prefers-reduced-motion: reduce) {
  .xiaohei-scene__mascot-sheet--open,
  .xiaohei-scene__mascot-state,
  .xiaohei-scene__thinking-fx,
  .xiaohei-scene__state-fx {
    transition-duration: 0.01ms;
    transition-delay: 0ms;
  }
}
`
