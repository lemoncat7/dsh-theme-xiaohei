/** One glass surface over DSH's native sidebar geometry and controls. */
export const XIAOHEI_SIDEBAR_CSS = `
/* The layout column and SidebarRoot both consume the native sidebar fill.
 * The theme token makes those surfaces transparent; this stable slot
 * relationship removes the layout column's remaining straight divider. */
#root :has(> [data-slot='sidebar']) {
  background: transparent !important;
  border-right-color: transparent !important;
}

#root [data-slot='sidebar'] {
  position: relative;
}

/* The host shell remains paint- and filter-free because Settings is a fixed
 * descendant. The glass itself lives outside #root in the scene layer. */
#root [data-slot='sidebar'] > div {
  position: relative;
  background: transparent !important;
  border-right: 0;
  box-shadow: none;
}

#dsh-theme-xiaohei\\/sidebar-glass {
  position: absolute;
  box-sizing: border-box;
  left: var(--xiaohei-sidebar-glass-left, 7px);
  top: var(--xiaohei-sidebar-glass-top, 8px);
  width: var(--xiaohei-sidebar-glass-width, 0px);
  height: var(--xiaohei-sidebar-glass-height, 0px);
  pointer-events: none;
  border: 1px solid var(--xiaohei-sidebar-glass-edge);
  border-radius: var(--xiaohei-radius-panel);
  background:
    linear-gradient(180deg, var(--xiaohei-sidebar-glass-highlight), transparent 15%),
    linear-gradient(145deg, var(--xiaohei-sidebar-glass-refraction), transparent 40%),
    var(--xiaohei-sidebar-glass-fill);
  box-shadow:
    inset 0 0 0 1px var(--xiaohei-sidebar-glass-inner-edge),
    0 16px 38px -28px var(--xiaohei-sidebar-shadow),
    0 1px 2px -1px var(--xiaohei-sidebar-shadow);
  -webkit-backdrop-filter: blur(22px) saturate(108%);
  backdrop-filter: blur(22px) saturate(108%);
}

/* Header toggle and the primary action keep the host's dimensions. */
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
  color: var(--xiaohei-sidebar-icon);
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-base) ease,
    border-color var(--xiaohei-motion-base) ease;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child:hover {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-sidebar-hover);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
  border-color: var(--xiaohei-sidebar-control-edge);
  background: var(--xiaohei-sidebar-control) !important;
  box-shadow: inset 0 1px 0 var(--xiaohei-sidebar-control-highlight);
  justify-content: flex-start;
  gap: 8px;
  padding-inline: 12px;
  text-align: start;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:hover,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']:hover {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-sidebar-control-edge-hover);
  background: var(--xiaohei-sidebar-hover) !important;
}

/* Footer occupants keep their native layout. Only their interaction surface
 * is shaded, avoiding a second card inside the sidebar glass. */
#root [data-slot='sidebar'] > div:not([class*='_collapsed'])
  > :has(> div > [data-slot='sidebar.footer.action']) {
  border-radius: calc(var(--xiaohei-radius-control) + 2px);
  background: var(--xiaohei-sidebar-control);
  box-shadow:
    inset 0 0 0 1px var(--xiaohei-sidebar-control-edge),
    inset 0 1px 0 var(--xiaohei-sidebar-control-highlight);
}

#root [data-slot='sidebar.footer.action'] > button,
#root [data-slot='sidebar.settings'] > button {
  color: var(--dsw-alias-label-secondary);
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease;
}

#root [data-slot='sidebar.footer.action'] > button:hover,
#root [data-slot='sidebar.settings'] > button:hover,
#root [data-slot='sidebar.footer.action'] > button[aria-expanded='true'],
#root [data-slot='sidebar.settings'] > button[aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-sidebar-hover);
}

#root [data-slot='sidebar'] button:focus-visible {
  outline: 2px solid var(--xiaohei-sidebar-emphasis);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  #root [data-slot='sidebar'] button {
    transition-duration: 0ms !important;
  }
}

@media (prefers-reduced-transparency: reduce) {
  #dsh-theme-xiaohei\\/sidebar-glass {
    background: var(--xiaohei-sidebar-glass-solid);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  #dsh-theme-xiaohei\\/sidebar-glass {
    background: var(--xiaohei-sidebar-glass-solid);
  }
}

@media (forced-colors: active) {
  #dsh-theme-xiaohei\\/sidebar-glass {
    border-color: CanvasText;
    background: Canvas;
    box-shadow: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}
`
