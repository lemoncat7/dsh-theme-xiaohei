/**
 * Public frame contract for first-party chrome and future Xiaohei-aware tools.
 * Feature plugins opt in with data attributes; this layer never guesses their DOM.
 */
export const XIAOHEI_FRAME_SYSTEM_CSS = `
:where([data-xiaohei-frame='module'], [data-xiaohei-frame='compact']) {
  position: relative;
  box-sizing: border-box;
  border: 1px solid var(--xiaohei-frame-line);
  color: var(--dsw-alias-label-primary);
  background:
    linear-gradient(var(--xiaohei-frame-line-strong), var(--xiaohei-frame-line-strong)) 12px 0 / 28px 1px no-repeat,
    linear-gradient(var(--xiaohei-frame-line), var(--xiaohei-frame-line)) 0 12px / 1px 22px no-repeat,
    linear-gradient(var(--xiaohei-frame-line), var(--xiaohei-frame-line)) 100% calc(100% - 12px) / 1px 22px no-repeat,
    var(--xiaohei-frame-fill);
  box-shadow:
    inset 0 0 0 1px var(--xiaohei-frame-inner),
    0 12px 30px var(--xiaohei-shadow);
}

:where([data-xiaohei-frame='module']) {
  border-radius: var(--xiaohei-radius-panel);
}

:where([data-xiaohei-frame='compact']) {
  border-radius: var(--xiaohei-radius-control);
}

:where([data-xiaohei-frame-header]) {
  min-height: 38px;
  border-bottom: 1px solid var(--xiaohei-frame-line);
}

:where([data-xiaohei-frame-actions]) {
  display: flex;
  align-items: center;
  gap: 4px;
}

:where([data-xiaohei-module-kind]) {
  --xiaohei-module-accent: var(--xiaohei-spirit);
}

@media (forced-colors: active) {
  :where([data-xiaohei-frame]) {
    border-color: currentColor;
    background: Canvas;
    box-shadow: none;
  }

}
`
