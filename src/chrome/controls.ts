/**
 * Browser-independent control primitives.
 *
 * This layer owns only the shared native-control contract. Feature chrome is
 * composed after it and remains free to define geometry or stronger states.
 */
export const XIAOHEI_CONTROL_PRIMITIVES_CSS = `
html {
  color-scheme: dark;
  accent-color: var(--xiaohei-spirit);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC",
    "Microsoft YaHei", "Segoe UI", sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html[data-xiaohei-appearance='light'] {
  color-scheme: light;
}

#root,
:where(#root) :where(button, input, textarea, select) {
  font: inherit;
  letter-spacing: inherit;
}

:where(#root) :where(button, input, textarea, select) {
  box-sizing: border-box;
  color: inherit;
  -webkit-tap-highlight-color: transparent;
}

:where(#root) :where(button, select, input[type='button'], input[type='submit'], input[type='reset']) {
  -webkit-appearance: none;
  appearance: none;
}

:where(#root) :where(button, input[type='button'], input[type='submit'], input[type='reset']) {
  margin: 0;
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-small);
  color: var(--dsw-alias-label-primary);
  background: transparent;
  cursor: pointer;
  transition:
    color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve);
}

:where(#root) :where(button, input[type='button'], input[type='submit'], input[type='reset']):not(:disabled):hover {
  border-color: var(--xiaohei-edge);
  background-color: var(--xiaohei-spirit-soft);
}

:where(#root) :where(button, input[type='button'], input[type='submit'], input[type='reset']):not(:disabled):active {
  transform: translateY(1px) scale(.98);
}

:where(#root) :where(button, input[type='button'], input[type='submit'], input[type='reset']):disabled {
  cursor: not-allowed;
  opacity: .48;
}

:where(#root) :where(input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='file']), textarea, select) {
  border: 1px solid var(--xiaohei-edge);
  border-radius: var(--xiaohei-radius-control);
  color: var(--dsw-alias-label-primary);
  background-color: var(--xiaohei-plugin-control-fill);
  box-shadow: inset 0 1px var(--xiaohei-layer-content-highlight);
  transition:
    border-color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    box-shadow var(--xiaohei-motion-fast) ease;
}

:where(#root) :where(input, textarea)::placeholder {
  color: var(--dsw-alias-label-tertiary);
  opacity: 1;
}

:where(#root) :where(input[type='search'])::-webkit-search-cancel-button,
:where(#root) :where(input[type='search'])::-webkit-search-decoration {
  -webkit-appearance: none;
  appearance: none;
}

:where(#root) :where(input[type='number']) {
  -moz-appearance: textfield;
}

:where(#root) :where(input[type='number'])::-webkit-inner-spin-button,
:where(#root) :where(input[type='number'])::-webkit-outer-spin-button {
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
}

:where(#root) :where(textarea) {
  resize: vertical;
}

:where(#root) :where(select) {
  padding-inline-end: 30px;
  background-image:
    linear-gradient(45deg, transparent 50%, currentColor 50%),
    linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position:
    calc(100% - 15px) 50%,
    calc(100% - 10px) 50%;
  background-repeat: no-repeat;
  background-size: 5px 5px, 5px 5px;
}

:where(#root) :where(select)::-ms-expand {
  display: none;
}

:where(#root) :where(option, optgroup) {
  color: var(--dsw-alias-label-primary);
  background: var(--xiaohei-surface-raised);
}

:where(#root) :where(input[type='checkbox'], input[type='radio']) {
  -webkit-appearance: none;
  appearance: none;
  display: inline-grid;
  place-content: center;
  width: 16px;
  height: 16px;
  margin: 0;
  border: 1px solid var(--xiaohei-edge-strong);
  color: var(--xiaohei-frame-ink);
  background: var(--xiaohei-plugin-control-fill);
  box-shadow: inset 0 1px var(--xiaohei-layer-content-highlight);
  cursor: pointer;
  transition:
    border-color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    box-shadow var(--xiaohei-motion-fast) ease;
}

:where(#root) :where(input[type='checkbox']) {
  border-radius: 5px;
}

:where(#root) :where(input[type='radio']) {
  border-radius: 50%;
}

:where(#root) :where(input[type='checkbox'], input[type='radio'])::before {
  content: '';
  width: 8px;
  height: 8px;
  background: currentColor;
  opacity: 0;
  transform: scale(.5);
  transition:
    opacity var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve);
}

:where(#root) :where(input[type='checkbox'])::before {
  clip-path: polygon(14% 44%, 0 62%, 40% 100%, 100% 20%, 82% 5%, 38% 70%);
}

:where(#root) :where(input[type='radio'])::before {
  border-radius: 50%;
}

:where(#root) :where(input[type='checkbox'], input[type='radio']):checked {
  border-color: var(--xiaohei-spirit-strong);
  background: var(--xiaohei-spirit);
  box-shadow: 0 0 0 3px var(--xiaohei-spirit-faint);
}

:where(#root) :where(input[type='checkbox'], input[type='radio']):checked::before {
  opacity: 1;
  transform: scale(1);
}

:where(#root) :where(input[type='checkbox'], input[type='radio']):disabled {
  cursor: not-allowed;
  opacity: .48;
}

:where(#root) :where(input[type='range']) {
  -webkit-appearance: none;
  appearance: none;
  height: 16px;
  margin: 0;
  background: transparent;
  cursor: pointer;
}

:where(#root) :where(input[type='range'])::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 999px;
  background: var(--xiaohei-surface-muted);
  box-shadow: inset 0 0 0 1px var(--xiaohei-edge);
}

:where(#root) :where(input[type='range'])::-webkit-slider-thumb {
  width: 14px;
  height: 14px;
  margin-top: -5px;
  border: 2px solid var(--xiaohei-surface-raised);
  border-radius: 50%;
  background: var(--xiaohei-spirit);
  box-shadow: 0 2px 6px var(--xiaohei-shadow);
  -webkit-appearance: none;
  appearance: none;
}

:where(#root) :where(input[type='range'])::-moz-range-track {
  height: 4px;
  border: 0;
  border-radius: 999px;
  background: var(--xiaohei-surface-muted);
  box-shadow: inset 0 0 0 1px var(--xiaohei-edge);
}

:where(#root) :where(input[type='range'])::-moz-range-progress {
  height: 4px;
  border-radius: 999px;
  background: var(--xiaohei-spirit);
}

:where(#root) :where(input[type='range'])::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border: 2px solid var(--xiaohei-surface-raised);
  border-radius: 50%;
  background: var(--xiaohei-spirit);
  box-shadow: 0 2px 6px var(--xiaohei-shadow);
}

:where(#root) :where(input[type='range']):disabled {
  cursor: not-allowed;
  opacity: .48;
}

:where(#root) :where(input[type='file'])::file-selector-button {
  margin-inline-end: 10px;
  padding: 6px 10px;
  border: 1px solid var(--xiaohei-edge);
  border-radius: var(--xiaohei-radius-small);
  color: var(--dsw-alias-label-primary);
  background: var(--xiaohei-plugin-control-fill);
  font: inherit;
  cursor: pointer;
}

:where(#root) :where(progress) {
  overflow: hidden;
  border: 0;
  border-radius: 999px;
  color: var(--xiaohei-spirit);
  background: var(--xiaohei-surface-muted);
  accent-color: var(--xiaohei-spirit);
}

:where(#root) :where(progress)::-webkit-progress-bar {
  background: var(--xiaohei-surface-muted);
}

:where(#root) :where(progress)::-webkit-progress-value {
  background: var(--xiaohei-spirit);
}

:where(#root) :where(progress)::-moz-progress-bar {
  background: var(--xiaohei-spirit);
}

:where(#root) :where(fieldset) {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

:where(#root) :where(legend) {
  padding: 0;
  color: var(--dsw-alias-label-secondary);
}

:where(#root) :where(summary) {
  cursor: pointer;
}

:where(#root) :where(a) {
  color: var(--xiaohei-spirit-strong);
  text-decoration-color: var(--xiaohei-edge-strong);
  text-underline-offset: .18em;
}

:where(#root) :where(a):hover {
  text-decoration-color: currentColor;
}

#root {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

#root:hover,
#root:focus-within {
  scrollbar-color: var(--dsw-alias-scrollbar-bg-l1) transparent;
}

#root ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

#root ::-webkit-scrollbar-track,
#root ::-webkit-scrollbar-corner {
  background: transparent;
}

#root ::-webkit-scrollbar-thumb {
  min-width: 28px;
  min-height: 28px;
  border: 2px solid transparent;
  border-radius: 999px;
  background: transparent;
  background-clip: padding-box;
}

#root:hover ::-webkit-scrollbar-thumb,
#root:focus-within ::-webkit-scrollbar-thumb {
  background-color: var(--dsw-alias-scrollbar-bg-l1);
}

#root ::-webkit-scrollbar-thumb:hover {
  background-color: var(--dsw-alias-scrollbar-hover-l1);
}

@media (forced-colors: active) {
  :where(#root) :where(input, textarea, select, button, progress) {
    forced-color-adjust: auto;
  }
}
`
