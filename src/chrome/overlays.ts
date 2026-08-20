/** Dialog, menu, listbox, focus, and separator surfaces. */
export const XIAOHEI_OVERLAY_CSS = `
#root [role='dialog'],
#root [role='menu'],
#root [role='listbox'] {
  border: 1px solid var(--xiaohei-edge) !important;
  color: var(--dsw-alias-label-primary);
  background-color: var(--xiaohei-surface) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 7%),
    0 22px 64px var(--xiaohei-shadow) !important;
}

#root [role='dialog'] {
  border-radius: calc(var(--xiaohei-radius-panel) + 2px) !important;
  background-image: linear-gradient(145deg, rgb(255 255 255 / 3%), transparent 34%) !important;
}

#root [role='dialog'] > nav {
  border-right: 1px solid var(--xiaohei-edge);
  background: linear-gradient(180deg, var(--xiaohei-spirit-faint), transparent 46%);
}

#root [role='menu'],
#root [role='listbox'] {
  border-radius: var(--xiaohei-radius-control) !important;
}

#root [role='menuitem'],
#root [role='option'],
#root [role='dialog'] button,
#root [role='menu'] button,
#root [role='listbox'] button {
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-small);
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve);
}

#root [role='menuitem']:hover,
#root [role='option']:hover,
#root [role='dialog'] button:not(:disabled):hover,
#root [role='menu'] button:not(:disabled):hover,
#root [role='listbox'] button:not(:disabled):hover {
  color: var(--xiaohei-spirit-strong);
  border-color: var(--xiaohei-edge);
  background: var(--xiaohei-spirit-soft);
}

#root [role='menuitem']:active,
#root [role='option']:active,
#root [role='dialog'] button:not(:disabled):active,
#root [role='menu'] button:not(:disabled):active,
#root [role='listbox'] button:not(:disabled):active {
  transform: translateY(1px) scale(0.99);
}

#root [role='dialog'] button[aria-current='true'],
#root [role='menu'] [aria-current='true'],
#root [role='listbox'] [aria-selected='true'] {
  color: var(--xiaohei-spirit-strong);
  background: var(--xiaohei-spirit-soft);
  box-shadow: inset 3px 0 var(--xiaohei-spirit);
}

#root button:focus-visible,
#root input:focus-visible,
#root textarea:focus-visible,
#root select:focus-visible,
#root [tabindex]:focus-visible {
  outline: 2px solid var(--xiaohei-spirit-strong) !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 5px var(--xiaohei-focus-shadow);
}

#root [role='separator'] {
  border-color: transparent !important;
  background: linear-gradient(90deg, transparent, var(--xiaohei-edge), transparent) !important;
  opacity: 0.82;
}
`
