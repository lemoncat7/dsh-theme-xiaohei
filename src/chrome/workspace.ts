/** Workspace navigation hierarchy and folder-owned spirit framing. */
export const XIAOHEI_WORKSPACE_CSS = `
#root [data-slot='sidebar.workspaces'] > div > div:first-child {
  min-height: 38px;
  margin-inline: 8px;
  padding-inline: 4px;
  border-bottom: 1px solid var(--xiaohei-sidebar-edge);
  border-radius: 0;
  background: transparent;
}

#root [data-slot='sidebar.workspaces'] > div > div:first-child > span:first-child {
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

#root [data-slot='sidebar.workspaces'] button {
  min-width: 28px;
  min-height: 28px;
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-small);
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease;
}

#root [data-slot='sidebar.workspaces'] button:hover,
#root [data-slot='sidebar.workspaces'] button[aria-expanded='true'] {
  color: var(--xiaohei-spirit-strong);
  border-color: var(--xiaohei-edge);
  background: var(--xiaohei-spirit-soft);
}

#root [data-slot='sidebar.workspaces'] [role='tree'] {
  padding-top: 6px;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded] {
  position: relative;
  box-sizing: border-box;
  min-height: 34px;
  margin-inline: 2px;
  overflow: hidden;
  border: 1px solid var(--xiaohei-edge);
  border-radius: var(--xiaohei-radius-control);
  background: linear-gradient(100deg, var(--xiaohei-spirit-faint), rgb(255 255 255 / 2%) 72%, transparent) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 5%);
  transition:
    border-color var(--xiaohei-motion-base) ease,
    background-color var(--xiaohei-motion-base) ease,
    box-shadow var(--xiaohei-motion-base) ease;
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]:hover,
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
  border-color: var(--xiaohei-edge-strong);
  background: linear-gradient(100deg, var(--xiaohei-spirit-soft), var(--xiaohei-spirit-faint) 72%, transparent) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 7%), 0 7px 18px var(--xiaohei-shadow);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'],
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-current='true'] {
  color: var(--xiaohei-spirit-strong);
  background: linear-gradient(90deg, var(--xiaohei-spirit-soft), var(--xiaohei-spirit-faint));
  box-shadow: inset 3px 0 var(--xiaohei-spirit), inset 0 1px rgb(255 255 255 / 5%);
}

#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true']::after,
#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-current='true']::after {
  content: '';
  position: absolute;
  top: -1px;
  right: 10px;
  width: 36px;
  height: 2px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--xiaohei-spirit-strong), transparent);
  box-shadow: 0 0 8px var(--xiaohei-focus-shadow);
  pointer-events: none;
}

#root [data-slot='sidebar.workspaces'] [role='tree'] > [class*='_empty'] {
  margin: 2px 4px 0;
  padding: 14px 12px 15px;
  border: 0;
  border-left: 1px solid var(--xiaohei-sidebar-edge);
  border-radius: 0;
  color: var(--dsw-alias-label-tertiary);
  background: transparent;
  font-size: 12px;
  line-height: 1.5;
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded] {
  background: linear-gradient(100deg, rgb(255 255 255 / 46%), var(--xiaohei-spirit-faint) 76%, transparent) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 68%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]:hover,
html[data-xiaohei-appearance='light'] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
  background: linear-gradient(100deg, rgb(255 255 255 / 78%), var(--xiaohei-spirit-soft) 76%, transparent) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 88%), 0 7px 18px var(--xiaohei-shadow);
}

@media (prefers-contrast: more), (forced-colors: active) {
  #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded] {
    border-color: currentColor;
    box-shadow: none;
  }
}
`
