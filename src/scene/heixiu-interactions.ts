/** Direct pointer attention and synchronized Heixiu-to-Xiaohei greetings. */
export const XIAOHEI_HEIXIU_INTERACTION_CSS = `
.xiaohei-scene__heixiu-body {
  transition: transform 150ms ease-out, opacity 150ms ease-out;
}

.xiaohei-scene__heixiu-body::after {
  content: '';
  position: absolute;
  inset: 8%;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, rgb(126 239 219 / 20%), transparent 68%);
  opacity: 0;
  transition: opacity 150ms ease-out;
}

.xiaohei-scene__heixiu[data-xiaohei-heixiu-attention='true'] {
  opacity: 0.92;
  filter:
    drop-shadow(0 0.32rem 0.68rem rgb(109 233 211 / 32%))
    drop-shadow(0 0.68rem 1.15rem rgb(1 9 10 / 20%));
}

.xiaohei-scene__heixiu[data-xiaohei-heixiu-attention='true'] .xiaohei-scene__heixiu-body {
  transform: translate3d(
    var(--xiaohei-heixiu-attention-x, 0px),
    var(--xiaohei-heixiu-attention-y, 0px),
    0
  );
}

.xiaohei-scene__heixiu[data-xiaohei-heixiu-attention='true'] .xiaohei-scene__heixiu-body::after {
  opacity: 1;
}

.xiaohei-scene__heixiu[data-xiaohei-heixiu-greeting='true'] .xiaohei-scene__heixiu-body {
  animation: xiaohei-heixiu-greet-xiaohei 760ms cubic-bezier(0.2, 0.72, 0.24, 1) both;
}

.xiaohei-scene__heixiu[data-xiaohei-heixiu-greeting='true'] .xiaohei-scene__heixiu-open {
  animation: xiaohei-heixiu-greeting-open 760ms step-end both;
}

.xiaohei-scene__heixiu[data-xiaohei-heixiu-greeting='true'] .xiaohei-scene__heixiu-blink {
  animation: xiaohei-heixiu-greeting-blink 760ms step-end both;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__heixiu-body::after {
  background: radial-gradient(circle, rgb(44 135 113 / 14%), transparent 68%);
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__heixiu[data-xiaohei-heixiu-attention='true'] {
  filter:
    drop-shadow(0 0.3rem 0.62rem rgb(47 133 118 / 22%))
    drop-shadow(0 0.62rem 1rem rgb(45 64 56 / 10%));
}

@keyframes xiaohei-heixiu-greet-xiaohei {
  0%, 100% { transform: translate3d(0, 0, 0); }
  30% { transform: translate3d(0.42rem, -0.28rem, 0); }
  62% { transform: translate3d(0.16rem, -0.08rem, 0); }
}

@keyframes xiaohei-heixiu-greeting-open {
  0%, 20%, 40%, 62%, 80%, 100% { opacity: 1; }
  21%, 39%, 63%, 79% { opacity: 0; }
}

@keyframes xiaohei-heixiu-greeting-blink {
  0%, 20%, 40%, 62%, 80%, 100% { opacity: 0; }
  21%, 39%, 63%, 79% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse) {
  .xiaohei-scene__heixiu-body,
  .xiaohei-scene__heixiu-body::after {
    transition: none;
  }

  .xiaohei-scene__heixiu[data-xiaohei-heixiu-greeting='true'] .xiaohei-scene__heixiu-body,
  .xiaohei-scene__heixiu[data-xiaohei-heixiu-greeting='true'] .xiaohei-scene__heixiu-open,
  .xiaohei-scene__heixiu[data-xiaohei-heixiu-greeting='true'] .xiaohei-scene__heixiu-blink {
    animation: none;
  }
}

@media (forced-colors: active) {
  .xiaohei-scene__heixiu-body::after { display: none; }
}
`
