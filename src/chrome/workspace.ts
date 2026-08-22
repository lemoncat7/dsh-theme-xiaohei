/** Visual hierarchy for DSH's native workspace tree. No behaviour is replaced. */
export const XIAOHEI_WORKSPACE_CSS = `
/* Keep the official workspace root in charge of scrolling and sizing. */
#root [data-slot='sidebar.workspaces'] > div {
  min-width: 0;
}

/* The section heading belongs to the sidebar, not to a nested card. */
#root [data-slot='sidebar.workspaces'] > div > div:first-child {
  min-height: 38px;
  color: var(--dsw-alias-label-secondary);
}

#root [data-slot='sidebar.workspaces'] > div > div:first-child > span:first-child {
  color: var(--xiaohei-workspace-label);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.012em;
}

#root [data-slot='sidebar.workspaces'] > div > div:first-child button {
  color: var(--xiaohei-sidebar-icon);
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-small);
  transition:
    color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease;
}

#root [data-slot='sidebar.workspaces'] > div > div:first-child button:hover,
#root [data-slot='sidebar.workspaces'] > div > div:first-child button[aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-workspace-control-edge);
  background: var(--xiaohei-workspace-row-hover);
}

/* A workspace group stays flat. When open, a quiet ink path links the folder
 * to its sessions without changing the official tree geometry. */
#root [data-slot='sidebar.workspaces'] [role='tree'] > :has([role='treeitem'][aria-expanded]) {
  position: relative;
  min-width: 0;
  margin-block-end: 3px;
  overflow: visible;
}

#root [data-slot='sidebar.workspaces'] [role='tree'] > :has([role='treeitem'][aria-expanded='true'])::before {
  content: '';
  position: absolute;
  z-index: 0;
  left: 19px;
  top: 31px;
  bottom: 10px;
  width: 1px;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--xiaohei-workspace-path) 12%,
    var(--xiaohei-workspace-path-active) 72%,
    transparent
  );
}

/* Folder and session rows share one rhythm. Native text, drag targets, action
 * buttons, selection and accessible state remain untouched. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'] {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-control);
  transition:
    color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-base) var(--xiaohei-motion-curve),
    background-color var(--xiaohei-motion-base) var(--xiaohei-motion-curve),
    transform var(--xiaohei-motion-base) var(--xiaohei-motion-curve);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem']:hover {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-workspace-row-hover);
}

/* The expanded folder is lifted only enough to read as the path owner. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-workspace-folder-open);
  transform: translateX(2px);
}

/* Session rows sit one step deeper on the ink path. This adjusts only their
 * visual box and leaves the host tree and event handlers intact. */
#root [data-slot='sidebar.workspaces'] [role='tree']
  > :has([role='treeitem'][aria-expanded])
  > span:not(:first-child)
  > [role='treeitem'] {
  width: calc(100% - 12px);
  margin-inline-start: 12px;
}

/* The selected session is the strongest navigation state. Most of the fill
 * remains neutral; the narrow spirit line carries the theme accent. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-workspace-row-active-edge);
  background: var(--xiaohei-workspace-row-active);
  box-shadow: inset 2px 0 var(--xiaohei-workspace-active-line);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'] button {
  border-radius: 7px;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'] button:hover,
#root [data-slot='sidebar.workspaces'] [role='treeitem'] button[aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-workspace-action-hover);
}

@media (prefers-reduced-motion: reduce) {
  #root [data-slot='sidebar.workspaces'] [role='treeitem'],
  #root [data-slot='sidebar.workspaces'] > div > div:first-child button {
    transition-duration: 0ms !important;
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
    transform: none;
  }
}

@media (forced-colors: active) {
  #root [data-slot='sidebar.workspaces'] [role='tree'] > :has([role='treeitem'][aria-expanded='true'])::before {
    background: CanvasText;
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
    border-color: Highlight;
    background: Canvas;
    box-shadow: inset 2px 0 Highlight;
  }
}
`
