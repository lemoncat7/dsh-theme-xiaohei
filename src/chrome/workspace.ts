/** Native tree geometry and scroll ownership; one sidebar glass, flat rows. */
export const XIAOHEI_WORKSPACE_CSS = `
#root [data-slot='sidebar.workspaces'] > div {
  min-width: 0;
}

/* The native header and independently scrolling tree own their geometry.
 * No stitched frame: scrollbar reservation must not split its right edge. */
#root [data-slot='sidebar.workspaces'] > div > div:first-child {
  color: var(--xiaohei-workspace-label);
  background: transparent;
  box-shadow: none;
}

#root [data-slot='sidebar.workspaces'] > div > div:first-child > span:first-child {
  font-size: 0;
  font-weight: 600;
}

#root [data-slot='sidebar.workspaces'] > div > div:first-child > span:first-child::after {
  content: '空间';
  font-size: 12px;
  letter-spacing: .01em;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'] {
  position: relative;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-control);
  background: transparent;
  box-shadow: none;
  font-weight: 400;
  transition:
    color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease;
}

/* Expansion is a browsing state, not the current conversation selection. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-workspace-folder-open);
  font-weight: 500;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem']:hover {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-workspace-row-hover);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-workspace-row-active-edge);
  background: var(--xiaohei-workspace-row-active);
  font-weight: 600;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true']:hover {
  background: var(--xiaohei-workspace-row-active-hover);
}

/* Preserve native tooltip wrappers and indentation. Group pseudo-elements
 * belong to the host's drag/drop insertion markers, not theme decoration. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'] button,
#root [data-slot='sidebar.workspaces'] > div > div:first-child button {
  color: var(--xiaohei-sidebar-icon);
  border-radius: var(--xiaohei-radius-small);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'] button:hover,
#root [data-slot='sidebar.workspaces'] [role='treeitem'] button[aria-expanded='true'],
#root [data-slot='sidebar.workspaces'] > div > div:first-child button:hover,
#root [data-slot='sidebar.workspaces'] > div > div:first-child button[aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-workspace-action-hover);
  border-color: transparent;
}

@media (prefers-reduced-motion: reduce) {
  #root [data-slot='sidebar.workspaces'] [role='treeitem'] {
    transition: none;
  }
}

@media (forced-colors: active) {
  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
    color: HighlightText;
    background: Highlight;
    border-color: Highlight;
  }
}
`
