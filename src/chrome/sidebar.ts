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

/* The rail itself is the outer mount; feature regions own their inner frames. */
#root [data-slot='sidebar'] > div::before {
  content: '';
  position: absolute;
  z-index: 0;
  inset: 7px 6px;
  border-inline: 1px solid var(--xiaohei-frame-line);
  border-radius: 5px;
  opacity: 0.72;
  pointer-events: none;
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
  position: relative;
  min-height: 72px;
  padding: 0 14px 15px;
  border-bottom: 1px solid var(--xiaohei-sidebar-edge);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child::after {
  content: '小黑 · 灵域';
  position: absolute;
  left: 24px;
  bottom: 5px;
  color: var(--xiaohei-spirit-strong);
  font-size: 9px;
  font-weight: 650;
  line-height: 1;
  letter-spacing: 0.18em;
  opacity: 0.78;
  pointer-events: none;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
  position: relative;
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
    inset 0 0 0 1px var(--xiaohei-frame-inner),
    inset 0 1px rgb(255 255 255 / 7%),
    0 8px 24px rgb(1 8 11 / 7%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']::after {
  content: '灵启';
  position: absolute;
  right: 10px;
  top: 50%;
  color: var(--xiaohei-spirit-strong);
  font-size: 9px;
  font-weight: 650;
  letter-spacing: 0.12em;
  opacity: 0.66;
  pointer-events: none;
  transform: translateY(-50%);
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

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action']) {
  position: relative;
  box-sizing: border-box;
  gap: 2px;
  margin: 9px 0 0;
  padding: 5px 4px 3px;
  border: 1px solid var(--xiaohei-frame-line);
  border-radius: 12px;
  background:
    linear-gradient(var(--xiaohei-frame-line-strong), var(--xiaohei-frame-line-strong)) 14px 0 / 30px 1px no-repeat,
    var(--xiaohei-frame-fill);
  box-shadow: inset 0 0 0 1px var(--xiaohei-frame-inner);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::before {
  content: '小黑工具';
  position: absolute;
  z-index: 2;
  top: -8px;
  left: 13px;
  height: 16px;
  padding-inline: 7px;
  border: 1px solid var(--xiaohei-frame-line);
  border-radius: 3px 7px 7px 3px;
  color: var(--xiaohei-frame-label);
  background: var(--xiaohei-frame-plaque);
  font-size: 9px;
  font-weight: 650;
  line-height: 14px;
  letter-spacing: 0.12em;
  pointer-events: none;
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

/* Collapsed rail geometry is explicit so every current and future tool shares one axis. */
#root [data-slot='sidebar'] > div[class*='_collapsed'] {
  align-items: center;
}

#root [data-slot='sidebar'] > div[class*='_collapsed'] > div:first-child,
#root [data-slot='sidebar'] > div[class*='_collapsed'] > button[aria-label='新建会话'],
#root [data-slot='sidebar'] > div[class*='_collapsed'] > button[aria-label='New session'],
#root [data-slot='sidebar'] > div[class*='_collapsed'] [data-slot='sidebar.workspaces'] > div,
#root [data-slot='sidebar'] > div[class*='_collapsed'] > div:has([data-slot='sidebar.footer.action']) {
  width: 35px;
  margin-inline: auto;
}

#root [data-slot='sidebar'] > div[class*='_collapsed'] button {
  flex: 0 0 36px;
  width: 36px;
  min-width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  align-items: center;
  justify-content: center;
}

#root [data-slot='sidebar'] > div[class*='_collapsed'] > div:has([data-slot='sidebar.footer.action']) {
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}

@media (prefers-reduced-transparency: reduce) {
  #root [data-slot='sidebar'] > div {
    background: #102A34 !important;
  }
  html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div { background: #E9EEEA !important; }
}
`
