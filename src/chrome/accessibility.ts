/** Reduced-motion, reduced-transparency, unsupported-browser, and forced-color fallbacks. */
export const XIAOHEI_CHROME_ACCESSIBILITY_CSS = `
@media (prefers-reduced-motion: reduce) {
  #root [data-composer-card='true'],
  #root [data-composer-card='true']::before,
  #root [data-composer-card='true']::after,
  #root button[aria-label='发送消息'],
  #root button[aria-label='Send message'],
  #root button[aria-label='发送消息']::after,
  #root button[aria-label='Send message']::after,
  #root [data-slot='conversation.composer'] button,
  #root [data-slot='sidebar'] button,
  #root [role='dialog']::before,
  #root [role='dialog']::after,
  #root [role='dialog'] button,
  #root [role='menu'] button,
  #root [role='listbox'] button {
    transition-duration: 0.01ms !important;
    animation: none !important;
  }
}

@media (prefers-reduced-transparency: reduce) {
  #root [data-composer-card='true'],
  #root [role='dialog'],
  #root [role='menu'],
  #root [role='listbox'] {
    background: var(--xiaohei-surface-raised) !important;
  }

  #root [data-composer-card='true']::before,
  #root [role='dialog']::before {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
    background: transparent !important;
    border: 1px solid var(--xiaohei-edge-strong);
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  #root [data-composer-card='true']::before,
  #root [role='dialog']::before {
    background: transparent;
    border: 1px solid var(--xiaohei-edge-strong);
  }
}

@media (forced-colors: active) {
  #root [data-composer-card='true'],
  #root [role='dialog'],
  #root [role='menu'],
  #root [role='listbox'],
  #root button[aria-label='发送消息'],
  #root button[aria-label='Send message'] {
    border: 1px solid CanvasText !important;
    background: Canvas !important;
    box-shadow: none !important;
  }

  #root [data-composer-card='true']::before,
  #root [data-composer-card='true']::after,
  #root [role='dialog']::before,
  #root [role='dialog']::after,
  #root button[aria-label='发送消息']::after,
  #root button[aria-label='Send message']::after {
    display: none;
  }
}
`
