/** Visual hierarchy for DSH's native workspace tree. No behaviour is replaced. */
export const XIAOHEI_WORKSPACE_CSS = `
/* Keep the official workspace root in charge of scrolling and sizing. */
#root [data-slot='sidebar.workspaces'] > div {
  min-width: 0;
}

/* Header and tree fragments form one quiet inset surface. */
#root [data-slot='sidebar.workspaces'] > div > div:first-child {
  min-height: 36px;
  margin: 2px 2px 0;
  color: var(--dsw-alias-label-secondary);
  border-radius: calc(var(--xiaohei-radius-control) + 3px)
    calc(var(--xiaohei-radius-control) + 3px) 0 0;
  background: var(--xiaohei-space-frame-fill);
  box-shadow:
    inset 1px 0 var(--xiaohei-space-frame-edge),
    inset -1px 0 var(--xiaohei-space-frame-edge),
    inset 0 1px var(--xiaohei-space-frame-edge),
    inset 0 2px var(--xiaohei-space-frame-highlight);
}

#root [data-slot='sidebar.workspaces'] > div > div:first-child > span:first-child {
  color: var(--xiaohei-workspace-label);
  font-size: 0;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* Xiaohei's visual vocabulary calls an official Workspace a “Space”. The
 * original node remains in place, preserving layout and accessibility data. */
#root [data-slot='sidebar.workspaces'] > div > div:first-child > span:first-child::after {
  content: '空间';
  font-size: 12px;
  letter-spacing: 0.01em;
}

#root [data-slot='sidebar.workspaces'] > div > div:first-child button {
  color: var(--xiaohei-sidebar-icon);
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-small);
  transition:
    color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    box-shadow var(--xiaohei-motion-fast) ease;
}

#root [data-slot='sidebar.workspaces'] > div > div:first-child button:hover,
#root [data-slot='sidebar.workspaces'] > div > div:first-child button[aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-workspace-control-edge);
  background: var(--xiaohei-workspace-action-hover);
  box-shadow: inset 0 1px var(--xiaohei-workspace-row-highlight);
}

/* Workspace groups remain in the native tree flow. Their stitched surface
 * stops at the last rendered Space rather than filling the sidebar. */
#root [data-slot='sidebar.workspaces'] [role='tree'] > :has([role='treeitem'][aria-expanded]) {
  position: relative;
  min-width: 0;
  margin-block: 0;
  margin-inline: 2px;
  overflow: visible;
  background: var(--xiaohei-space-frame-fill);
  box-shadow:
    inset 1px 0 var(--xiaohei-space-frame-edge),
    inset -1px 0 var(--xiaohei-space-frame-edge);
}

#root [data-slot='sidebar.workspaces'] [role='tree']
  > :has(> [role='treeitem'][aria-expanded]):not(:first-child) {
  padding-top: 2px;
}

#root [data-slot='sidebar.workspaces'] [role='tree']
  > :has(> [role='treeitem'][aria-expanded]):last-child {
  padding-bottom: 3px;
  border-radius: 0 0 calc(var(--xiaohei-radius-control) + 3px)
    calc(var(--xiaohei-radius-control) + 3px);
  box-shadow:
    inset 1px 0 var(--xiaohei-space-frame-edge),
    inset -1px 0 var(--xiaohei-space-frame-edge),
    inset 0 -1px var(--xiaohei-space-frame-edge);
}

/* A neutral hairline quietly links an open folder with its sessions. */
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
    var(--xiaohei-workspace-path) 14%,
    var(--xiaohei-workspace-path) 80%,
    transparent
  );
}

/* Folder and session rows share one material language. Native text, drag
 * targets, actions, selection and accessible state remain untouched. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'] {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-control);
  background: transparent;
  box-shadow: none;
  font-weight: 400;
  transition:
    color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-base) var(--xiaohei-motion-curve),
    background-color var(--xiaohei-motion-base) var(--xiaohei-motion-curve),
    box-shadow var(--xiaohei-motion-base) var(--xiaohei-motion-curve),
    transform var(--xiaohei-motion-base) var(--xiaohei-motion-curve);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem']:hover {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-workspace-row-hover-edge);
  background: var(--xiaohei-workspace-row-hover);
  box-shadow: inset 0 1px var(--xiaohei-workspace-row-highlight);
}

/* Only interactive and selected rows own a local glass pass. Keeping default
 * rows filter-free avoids a permanent compositor layer for every session. */
#root [data-slot='sidebar.workspaces'] [role='treeitem']:hover,
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'],
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
  -webkit-backdrop-filter:
    blur(var(--xiaohei-workspace-glass-blur))
    saturate(var(--xiaohei-workspace-glass-saturation));
  backdrop-filter:
    blur(var(--xiaohei-workspace-glass-blur))
    saturate(var(--xiaohei-workspace-glass-saturation));
}

html[data-xiaohei-sidebar-resizing]
  #root [data-slot='sidebar.workspaces'] [role='treeitem']:hover,
html[data-xiaohei-sidebar-resizing]
  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'],
html[data-xiaohei-sidebar-resizing]
  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

/* The open folder reads as a lightly raised glass control, without spatial
 * rifts, accent glows or geometry shifts. */
#root [data-slot='sidebar.workspaces'] [role='tree']
  > :has([role='treeitem'][aria-expanded])
  > span:first-child
  > [role='treeitem'][aria-expanded] {
  width: calc(100% - 4px);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-workspace-folder-edge);
  background: var(--xiaohei-workspace-folder-open);
  box-shadow:
    inset 0 1px var(--xiaohei-workspace-row-highlight),
    0 4px 12px var(--xiaohei-workspace-folder-shadow);
  font-weight: 500;
  transform: translateY(-1px);
}

/* Sessions sit one step deeper on the tree path. This changes only their
 * visual box and leaves host event handlers and drag geometry untouched. */
#root [data-slot='sidebar.workspaces'] [role='tree']
  > :has([role='treeitem'][aria-expanded])
  > span:not(:first-child)
  > [role='treeitem'] {
  width: calc(100% - 16px);
  margin-inline-start: 12px;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-workspace-row-active-edge);
  background: var(--xiaohei-workspace-row-active);
  box-shadow:
    inset 0 1px var(--xiaohei-workspace-row-highlight),
    0 3px 9px var(--xiaohei-workspace-row-shadow);
  font-weight: 500;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'] button {
  border-radius: 7px;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'] button:hover,
#root [data-slot='sidebar.workspaces'] [role='treeitem'] button[aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-workspace-action-hover);
  box-shadow: inset 0 1px var(--xiaohei-workspace-row-highlight);
}

@media (prefers-reduced-transparency: reduce) {
  #root [data-slot='sidebar.workspaces'] [role='treeitem']:hover {
    background: var(--xiaohei-workspace-hover-solid);
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
    background: var(--xiaohei-workspace-folder-solid);
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
    background: var(--xiaohei-workspace-active-solid);
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem']:hover,
  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'],
  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  #root [data-slot='sidebar.workspaces'] [role='treeitem']:hover {
    background: var(--xiaohei-workspace-hover-solid);
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
    background: var(--xiaohei-workspace-folder-solid);
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
    background: var(--xiaohei-workspace-active-solid);
  }
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
  #root [data-slot='sidebar.workspaces'] > div > div:first-child,
  #root [data-slot='sidebar.workspaces'] [role='tree']
    > :has(> [role='treeitem'][aria-expanded]) {
    background: Canvas;
    box-shadow: inset 0 0 0 1px CanvasText;
  }

  #root [data-slot='sidebar.workspaces'] [role='tree'] > :has([role='treeitem'][aria-expanded='true'])::before {
    background: CanvasText;
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'],
  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
    border-color: Highlight;
    background: Canvas;
    box-shadow: none;
  }
}
`
