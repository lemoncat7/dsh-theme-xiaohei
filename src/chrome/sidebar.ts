/** Sidebar shell, primary action, and footer navigation. */
export const XIAOHEI_SIDEBAR_CSS = `
#root [data-slot='sidebar'] > div {
  position: relative;
  background:
    linear-gradient(
      180deg,
      var(--xiaohei-sidebar-top) 0%,
      var(--xiaohei-sidebar-middle) 52%,
      var(--xiaohei-sidebar-bottom) 100%
    ) !important;
  border-right: 0;
  box-shadow:
    inset -1px 0 var(--xiaohei-sidebar-edge),
    12px 0 32px rgb(1 8 11 / 10%);
}

/* A narrow material falloff joins the foreground rail to the forest behind it. */
#root [data-slot='sidebar'] > div::after {
  content: '';
  position: absolute;
  z-index: 0;
  top: 0;
  right: -24px;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  background: linear-gradient(90deg, var(--xiaohei-sidebar-fade), transparent);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child {
  min-height: 62px;
  padding-inline: 14px;
  border-bottom: 1px solid var(--xiaohei-sidebar-edge);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
  border: 1px solid transparent;
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-base) ease,
    border-color var(--xiaohei-motion-base) ease,
    box-shadow var(--xiaohei-motion-base) ease,
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child {
  min-width: 30px;
  min-height: 30px;
  border-radius: var(--xiaohei-radius-small);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child:hover {
  color: var(--xiaohei-spirit-strong);
  border-color: var(--xiaohei-edge);
  background: var(--xiaohei-spirit-soft);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
  width: auto;
  min-height: 40px;
  margin: 10px 12px 12px;
  padding-inline: 14px;
  justify-content: flex-start;
  gap: 10px;
  border-color: var(--xiaohei-edge);
  border-radius: var(--xiaohei-radius-control);
  color: var(--dsw-alias-label-primary);
  background: linear-gradient(180deg, rgb(255 255 255 / 5%), var(--xiaohei-spirit-faint)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 7%),
    0 8px 24px rgb(1 8 11 / 7%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:hover,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']:hover {
  color: var(--xiaohei-spirit-strong);
  border-color: var(--xiaohei-edge-strong);
  background: linear-gradient(180deg, var(--xiaohei-spirit-soft), var(--xiaohei-spirit-faint)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 8%),
    inset 3px 0 var(--xiaohei-spirit),
    0 7px 18px var(--xiaohei-shadow);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:active,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']:active {
  transform: translateY(1px);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:last-child {
  gap: 2px;
  margin: 8px 12px 10px;
  padding: 9px 0 2px;
  border: 0;
  border-top: 1px solid var(--xiaohei-sidebar-edge);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

#root [data-slot='sidebar.footer.action'] > button,
#root [data-slot='sidebar.settings'] > button {
  min-height: 36px;
  padding-inline: 10px;
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-small);
  color: var(--dsw-alias-label-secondary);
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease;
}

#root [data-slot='sidebar.footer.action'] > button:hover,
#root [data-slot='sidebar.settings'] > button:hover,
#root [data-slot='sidebar.footer.action'] > button[aria-expanded='true'],
#root [data-slot='sidebar.settings'] > button[aria-expanded='true'] {
  color: var(--xiaohei-spirit-strong);
  border-color: var(--xiaohei-edge);
  background: var(--xiaohei-spirit-soft);
}

#root [data-slot='sidebar'] button:focus-visible {
  outline: 2px solid var(--xiaohei-spirit-strong);
  outline-offset: 2px;
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div {
  box-shadow:
    inset -1px 0 var(--xiaohei-sidebar-edge),
    12px 0 30px rgb(35 62 67 / 7%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child {
  border-bottom-color: var(--xiaohei-edge);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
  color: var(--xiaohei-ink);
  background: linear-gradient(180deg, rgb(255 255 255 / 64%), var(--xiaohei-spirit-faint)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 78%), 0 8px 22px rgb(35 62 67 / 6%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:hover,
html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']:hover {
  color: var(--xiaohei-spirit-strong);
  background: linear-gradient(180deg, rgb(255 255 255 / 88%), var(--xiaohei-spirit-soft)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 92%), inset 3px 0 var(--xiaohei-spirit), 0 7px 18px var(--xiaohei-shadow);
}

@media (prefers-reduced-transparency: reduce) {
  #root [data-slot='sidebar'] > div {
    background: #102A34 !important;
  }
  html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div { background: #E9EEEA !important; }
}
`
