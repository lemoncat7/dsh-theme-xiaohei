/** Atomic blink rendering: one state hides live eyes and reveals the complete closed frame. */
export const XIAOHEI_BLINK_CSS = `
.xiaohei-scene__mascot-blink {
  animation: none;
}

.xiaohei-scene__mascot[data-xiaohei-blink='closed'] .xiaohei-scene__mascot-blink {
  opacity: 1;
}

.xiaohei-scene__mascot[data-xiaohei-blink='closed'] .xiaohei-gaze__eye {
  visibility: hidden;
}
`
