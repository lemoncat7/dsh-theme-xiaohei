/** Session feedback runs on an inner plane so ambient drifting stays untouched. */
export const XIAOHEI_HEIXIU_FEEDBACK_CSS = `
.xiaohei-scene__heixiu-body {
  position: absolute;
  inset: 0;
  display: block;
  transform: translate3d(0, 0, 0);
  opacity: 1;
}

html[data-xiaohei-state='complete'] .xiaohei-scene__heixiu--mascot .xiaohei-scene__heixiu-body,
html[data-xiaohei-state='complete'] .xiaohei-scene__heixiu--sidebar .xiaohei-scene__heixiu-body {
  animation: xiaohei-heixiu-feedback-complete 760ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

html[data-xiaohei-state='complete'] .xiaohei-scene__heixiu--sidebar .xiaohei-scene__heixiu-body {
  animation-delay: 140ms;
}

html[data-xiaohei-state='error'] .xiaohei-scene__heixiu .xiaohei-scene__heixiu-body {
  animation: xiaohei-heixiu-feedback-error 880ms cubic-bezier(0.22, 0.72, 0.24, 1) both;
}

html[data-xiaohei-state='complete'] .xiaohei-scene__heixiu .xiaohei-scene__heixiu-open,
html[data-xiaohei-state='error'] .xiaohei-scene__heixiu .xiaohei-scene__heixiu-open {
  animation: xiaohei-heixiu-feedback-eyes-open 620ms step-end both;
}

html[data-xiaohei-state='complete'] .xiaohei-scene__heixiu .xiaohei-scene__heixiu-blink,
html[data-xiaohei-state='error'] .xiaohei-scene__heixiu .xiaohei-scene__heixiu-blink {
  animation: xiaohei-heixiu-feedback-eyes-blink 620ms step-end both;
}

@keyframes xiaohei-heixiu-feedback-complete {
  0%, 100% { transform: translate3d(0, 0, 0); opacity: 1; }
  38% { transform: translate3d(0, -0.42rem, 0); opacity: 1; }
  68% { transform: translate3d(0, -0.12rem, 0); opacity: 0.96; }
}

@keyframes xiaohei-heixiu-feedback-error {
  0%, 100% { transform: translate3d(0, 0, 0); opacity: 1; }
  30% { transform: translate3d(0, 0.2rem, 0); opacity: 0.52; }
  62% { transform: translate3d(0, 0.08rem, 0); opacity: 0.72; }
}

@keyframes xiaohei-heixiu-feedback-eyes-open {
  0%, 24%, 48%, 100% { opacity: 1; }
  25%, 47% { opacity: 0; }
}

@keyframes xiaohei-heixiu-feedback-eyes-blink {
  0%, 24%, 48%, 100% { opacity: 0; }
  25%, 47% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  html[data-xiaohei-state] .xiaohei-scene__heixiu .xiaohei-scene__heixiu-body,
  html[data-xiaohei-state] .xiaohei-scene__heixiu .xiaohei-scene__heixiu-open,
  html[data-xiaohei-state] .xiaohei-scene__heixiu .xiaohei-scene__heixiu-blink {
    animation: none;
  }
}
`
