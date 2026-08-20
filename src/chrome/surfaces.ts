/** Dialog, menu, focus, and separator surfaces. */
export const XIAOHEI_SURFACE_CSS = `
#root [role='dialog'],
#root [role='menu'],
#root [role='listbox'] {
  border: 1px solid var(--xiaohei-chrome-edge) !important;
  background-color: var(--xiaohei-chrome-surface) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 6%),
    inset 1px 0 rgb(101 209 190 / 3%),
    0 22px 64px var(--xiaohei-chrome-shadow) !important;
}

#root [role='dialog'] {
  position: relative;
  border-radius: 18px !important;
  background-image:
    radial-gradient(circle at 0% 100%, var(--xiaohei-chrome-accent-soft), transparent 24%),
    linear-gradient(145deg, rgb(255 255 255 / 3%), transparent 34%) !important;
}

#root [role='dialog']::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-top: 1px solid rgb(255 255 255 / 5%);
  border-left: 1px solid rgb(101 209 190 / 5%);
  border-radius: 14px;
  pointer-events: none;
}

#root [role='dialog'] > nav {
  border-right: 1px solid var(--xiaohei-chrome-edge);
  background:
    radial-gradient(120% 62% at 4% 92%, var(--xiaohei-chrome-accent-soft), transparent 70%),
    linear-gradient(180deg, rgb(101 209 190 / 3%), transparent 48%);
}

#root [role='menu'],
#root [role='listbox'] {
  border-radius: 12px !important;
}

#root [role='dialog'] button,
#root [role='menu'] button,
#root [role='listbox'] button {
  border: 1px solid transparent;
  transition: color 160ms ease, background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease, transform 120ms ease;
}

#root [role='dialog'] button:not(:disabled):hover,
#root [role='menu'] button:not(:disabled):hover,
#root [role='listbox'] button:not(:disabled):hover {
  border-color: var(--xiaohei-chrome-edge);
  box-shadow: inset 0 1px rgb(255 255 255 / 5%);
}

#root [role='dialog'] button:not(:disabled):active,
#root [role='menu'] button:not(:disabled):active,
#root [role='listbox'] button:not(:disabled):active {
  transform: translateY(1px);
}

#root [role='dialog'] button[aria-current='true'],
#root [role='menu'] [aria-current='true'],
#root [role='listbox'] [aria-selected='true'] {
  box-shadow:
    inset 2px 0 var(--xiaohei-chrome-accent),
    inset 0 1px rgb(255 255 255 / 5%);
}

#root button:focus-visible,
#root input:focus-visible,
#root textarea:focus-visible,
#root select:focus-visible,
#root [tabindex]:focus-visible {
  outline: 2px solid var(--xiaohei-chrome-accent-strong) !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 5px var(--xiaohei-chrome-focus-shadow);
}

#root [role='separator'] {
  border-color: transparent !important;
  background: linear-gradient(90deg, transparent, var(--xiaohei-chrome-edge), transparent) !important;
  opacity: 0.8;
}
`
