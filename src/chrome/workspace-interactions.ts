/** Pointer-following glow and one-shot spirit release for workspace folder rows. */
export const XIAOHEI_WORKSPACE_INTERACTION_CSS = `
#root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded] {
  position: relative;
}

#root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::before,
#root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::after {
  content: '';
  position: absolute;
  pointer-events: none;
  opacity: 0;
}

#root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::before {
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    circle 42px at var(--xiaohei-workspace-pointer-x, 18px) var(--xiaohei-workspace-pointer-y, 17px),
    rgb(156 235 249 / 22%),
    rgb(93 191 211 / 8%) 46%,
    transparent 74%
  );
  transition: opacity 140ms ease-out;
}

#root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded][data-xiaohei-workspace-hover='true']::before {
  opacity: 0.86;
}

#root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::after {
  inset: -4px -3px;
  border-radius: 11px;
  background:
    radial-gradient(circle at 16% 4px, rgb(214 249 255 / 94%) 0 1.2px, transparent 1.8px),
    radial-gradient(circle at 54% calc(100% - 3px), rgb(125 218 237 / 82%) 0 1px, transparent 1.7px),
    radial-gradient(circle at 88% 5px, rgb(166 236 249 / 72%) 0 0.9px, transparent 1.6px);
  transform: translateX(-5px);
}

#root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded][data-xiaohei-workspace-release='true']::after {
  animation: xiaohei-workspace-spirit-release 680ms cubic-bezier(0.2, 0.72, 0.24, 1) both;
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::before {
  background: radial-gradient(
    circle 42px at var(--xiaohei-workspace-pointer-x, 18px) var(--xiaohei-workspace-pointer-y, 17px),
    rgb(45 116 136 / 16%),
    rgb(45 116 136 / 6%) 46%,
    transparent 74%
  );
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::after {
  background:
    radial-gradient(circle at 16% 4px, rgb(38 99 116 / 76%) 0 1.2px, transparent 1.8px),
    radial-gradient(circle at 54% calc(100% - 3px), rgb(52 128 147 / 64%) 0 1px, transparent 1.7px),
    radial-gradient(circle at 88% 5px, rgb(70 145 164 / 56%) 0 0.9px, transparent 1.6px);
}

@keyframes xiaohei-workspace-spirit-release {
  0% { opacity: 0; transform: translateX(-5px); }
  28% { opacity: 0.9; }
  100% { opacity: 0; transform: translateX(7px); }
}

@media (prefers-reduced-motion: reduce) {
  #root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::before {
    transition: none;
  }

  #root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded][data-xiaohei-workspace-release='true']::after {
    animation: none;
  }
}

@media (forced-colors: active) {
  #root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::before,
  #root [data-slot='sidebar'] [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]::after {
    display: none;
  }
}
`
