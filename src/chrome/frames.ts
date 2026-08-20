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

:where([data-xiaohei-frame-label])::before {
  content: attr(data-xiaohei-frame-label);
  position: absolute;
  z-index: 2;
  top: -9px;
  left: 14px;
  min-width: 42px;
  height: 17px;
  padding-inline: 8px;
  border: 1px solid var(--xiaohei-frame-line);
  border-radius: 3px 8px 8px 3px;
  color: var(--xiaohei-frame-label);
  background: var(--xiaohei-frame-plaque);
  box-shadow: inset 0 1px var(--xiaohei-frame-inner), 0 4px 10px var(--xiaohei-shadow);
  font-size: 9px;
  font-weight: 650;
  line-height: 15px;
  letter-spacing: 0.12em;
  white-space: nowrap;
  pointer-events: none;
}

:where([data-xiaohei-frame-ornament='spirit-knot'])::after {
  content: '';
  position: absolute;
  z-index: 2;
  top: -6px;
  right: 16px;
  width: 13px;
  height: 13px;
  border: 1px solid var(--xiaohei-frame-line-strong);
  border-radius: 50%;
  background:
    radial-gradient(circle at 38% 35%, rgb(255 255 255 / 32%) 0 8%, transparent 10%),
    radial-gradient(circle, var(--xiaohei-frame-ink) 0 55%, var(--xiaohei-spirit) 58% 68%, transparent 72%);
  box-shadow: 0 0 10px var(--xiaohei-focus-shadow), 0 4px 8px var(--xiaohei-shadow);
  pointer-events: none;
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

  :where([data-xiaohei-frame-label])::before,
  :where([data-xiaohei-frame-ornament])::after {
    display: none;
  }
}
`
