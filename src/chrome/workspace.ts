import { XIAOHEI_WORKSPACE_RIFT_COLOR } from '../generated-sidebar-assets.js'

/** Visual hierarchy for DSH's native workspace tree. No behaviour is replaced. */
export const XIAOHEI_WORKSPACE_CSS = `
/* Keep the official workspace root in charge of scrolling and sizing. */
#root [data-slot='sidebar.workspaces'] > div {
  min-width: 0;
}

/* The module frame is stitched from the header and the actual tree fragments.
 * It therefore ends at the last rendered Space instead of following the
 * official flex seat to the bottom of the sidebar. */
#root [data-slot='sidebar.workspaces'] > div > div:first-child {
  min-height: 36px;
  margin: 2px 2px 0;
  color: var(--dsw-alias-label-secondary);
  border-radius: calc(var(--xiaohei-radius-control) + 3px)
    calc(var(--xiaohei-radius-control) + 3px) 0 0;
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
  margin-block: 0;
  margin-inline: 2px;
  overflow: visible;
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
  font-weight: 400;
  transition:
    color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-base) var(--xiaohei-motion-curve),
    background-color var(--xiaohei-motion-base) var(--xiaohei-motion-curve),
    transform var(--xiaohei-motion-base) var(--xiaohei-motion-curve);
}

/* The folder row owns both spatial overlays. They follow the host's native
 * aria-expanded state and never participate in layout or hit testing. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded] {
  overflow: visible;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded] > * {
  position: relative;
  z-index: 1;
}

/* A narrow spirit mark identifies only the open Space. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::before {
  content: '';
  position: absolute;
  z-index: 2;
  left: -1px;
  top: 9px;
  bottom: 9px;
  width: 3px;
  border-radius: 999px;
  pointer-events: none;
  background: var(--xiaohei-workspace-active-line);
  box-shadow:
    0 0 6px var(--xiaohei-workspace-active-line-glow),
    0 0 14px color-mix(
      in srgb,
      var(--xiaohei-workspace-active-line-glow) 30%,
      transparent
    );
  opacity: 0;
  transform: scaleY(.72);
  transition:
    opacity var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-base) var(--xiaohei-motion-curve);
}

/* The supplied vertical artwork owns the rift's ink, jade depth and feathered
 * edge. It keeps its original narrow ratio instead of widening across the row. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::after {
  content: '';
  position: absolute;
  z-index: 2;
  right: 0;
  top: 50%;
  width: 20px;
  height: 52px;
  pointer-events: none;
  background: center / contain no-repeat url("${XIAOHEI_WORKSPACE_RIFT_COLOR}");
  filter:
    saturate(.72)
    contrast(1.04)
    drop-shadow(0 0 2px var(--xiaohei-workspace-rift-glow));
  opacity: 0;
  transform: translateY(-50%) scaleX(.58) scaleY(.9);
  transform-origin: right center;
  transition:
    opacity var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-base) var(--xiaohei-motion-curve);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem']:hover {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-workspace-row-hover);
}

#root [data-slot='sidebar.workspaces']
  [role='treeitem'][aria-expanded]:not([aria-expanded='true']):hover {
  background: radial-gradient(
    circle at 20% 50%,
    var(--xiaohei-workspace-folder-open),
    var(--xiaohei-workspace-row-hover) 55%,
    transparent 85%
  );
}

#root [data-slot='sidebar.workspaces']
  [role='treeitem'][aria-expanded]:not([aria-expanded='true']):hover::after {
  opacity: .26;
  transform: translateY(-50%) scaleX(.72) scaleY(.94);
}

/* The expanded folder is lifted only enough to read as the path owner. */
#root [data-slot='sidebar.workspaces'] [role='tree']
  > :has([role='treeitem'][aria-expanded])
  > span:first-child
  > [role='treeitem'][aria-expanded] {
  width: calc(100% - 4px);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-workspace-folder-edge);
  background: linear-gradient(
    90deg,
    var(--xiaohei-workspace-folder-open),
    var(--xiaohei-workspace-row-active) 72%,
    transparent 100%
  );
  box-shadow:
    0 2px 6px var(--xiaohei-workspace-folder-shadow),
    0 7px 18px var(--xiaohei-workspace-folder-shadow);
  font-weight: 500;
  transform: translateX(2px);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true']::before {
  opacity: 1;
  transform: scaleY(1);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true']::after {
  filter:
    saturate(1.18)
    contrast(1.08)
    drop-shadow(0 0 3px var(--xiaohei-workspace-rift-glow));
  opacity: .98;
  transform: translateY(-50%) scaleX(1) scaleY(1);
}

/* Session rows sit one step deeper on the ink path. This adjusts only their
 * visual box and leaves the host tree and event handlers intact. */
#root [data-slot='sidebar.workspaces'] [role='tree']
  > :has([role='treeitem'][aria-expanded])
  > span:not(:first-child)
  > [role='treeitem'] {
  width: calc(100% - 16px);
  margin-inline-start: 12px;
}

/* The selected session is the strongest navigation state. Most of the fill
 * remains neutral; the narrow spirit line carries the theme accent. */
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: var(--xiaohei-workspace-row-active-edge);
  background: var(--xiaohei-workspace-row-active);
  font-weight: 500;
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
  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::before,
  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::after,
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
    box-shadow: inset 0 0 0 1px CanvasText;
  }

  #root [data-slot='sidebar.workspaces'] [role='tree'] > :has([role='treeitem'][aria-expanded='true'])::before {
    background: CanvasText;
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
    border-color: Highlight;
    background: Canvas;
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
    border-color: Highlight;
    box-shadow: none;
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::before {
    background: Highlight;
    box-shadow: none;
  }

  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::after {
    display: none;
  }
}
`
