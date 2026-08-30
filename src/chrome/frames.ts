/**
 * Public frame contract for first-party chrome and future Xiaohei-aware tools.
 * Feature plugins opt in with data attributes; this layer never guesses their DOM.
 */
export const XIAOHEI_FRAME_SYSTEM_CSS = `
:where([data-xiaohei-surface='plugin-workspace']) {
  isolation: isolate;
  background-color: var(--xiaohei-plugin-workspace-fill) !important;
  -webkit-backdrop-filter:
    blur(var(--xiaohei-plugin-surface-blur))
    saturate(var(--xiaohei-plugin-surface-saturation));
  backdrop-filter:
    blur(var(--xiaohei-plugin-surface-blur))
    saturate(var(--xiaohei-plugin-surface-saturation));
}

:where([data-xiaohei-workspace-close]) {
  -webkit-appearance: none;
  appearance: none;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  flex: none;
  width: 30px;
  height: 30px;
  margin: 0;
  padding: 0;
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-small);
  color: var(--dsw-alias-label-secondary);
  background: transparent;
  font: inherit;
  line-height: 1;
  text-align: center;
  -webkit-tap-highlight-color: transparent;
  cursor: pointer;
  transition:
    color var(--xiaohei-motion-fast) ease,
    background var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve);
}

:where([data-xiaohei-workspace-close]) > svg {
  display: block;
  flex: none;
  pointer-events: none;
}

:where([data-xiaohei-workspace-close]):hover {
  border-color: var(--xiaohei-workspace-control-edge);
  color: var(--dsw-alias-label-primary);
  background: var(--xiaohei-plugin-control-fill);
}

:where([data-xiaohei-workspace-close]):active {
  transform: scale(.96);
}

:where([data-xiaohei-workspace-close]):focus-visible {
  outline: 2px solid var(--xiaohei-spirit);
  outline-offset: 2px;
}

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
  :where([data-xiaohei-frame], [data-xiaohei-surface='plugin-workspace']) {
    border-color: currentColor;
    background: Canvas;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    box-shadow: none;
  }

}

@media (max-width: 700px) {
  :where([data-xiaohei-surface='plugin-workspace']) {
    --xiaohei-plugin-surface-blur: 22px;
  }
}

@media (prefers-reduced-transparency: reduce) {
  :where([data-xiaohei-surface='plugin-workspace']) {
    background-color: var(--xiaohei-surface-raised) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :where([data-xiaohei-surface='plugin-workspace']) {
    background-color: var(--xiaohei-surface-raised) !important;
  }
}
`
