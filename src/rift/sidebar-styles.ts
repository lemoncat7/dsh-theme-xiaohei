/** Sidebar-only ornaments. Native rows retain their geometry, status and actions.
 * No timers/observers, no overlay hit targets, no animated layout or blur.
 */
export const RIFT_SIDEBAR_CSS = `
/* Selection uses the row's own static border/background; no seal or light trail. */
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true']::before,
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true']::after {
 content:none; animation:none;
}
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true']::after {
 content:''; position:absolute; pointer-events:none; left:30px; right:12px; bottom:0; height:1px;
 background:linear-gradient(90deg,var(--rift-aura),transparent); transform-origin:left; opacity:.55;
}
html[data-rift-theme] #root [data-slot='sidebar'] button[class*='_newSession']::after {
 width:32px; right:9px; top:8px; bottom:8px;
 background:linear-gradient(110deg,transparent 36%,var(--rift-rim) 37%,var(--rift-rim) 40%,transparent 41%,transparent 53%,var(--rift-aura) 54%,var(--rift-aura) 57%,transparent 58%);
 opacity:.65;
}
@keyframes rift-sidebar-arrive {
 from { transform:scaleX(.3); opacity:0; }
 to { transform:scaleX(1); opacity:.55; }
}
@keyframes rift-sidebar-gate {
 0% { transform:translateX(0); opacity:.65; }
 45% { transform:translateX(-4px); opacity:1; }
 100% { transform:translateX(0); opacity:.65; }
}
@keyframes rift-sidebar-wake {
 0%,100% { transform:rotate(0); }
 40% { transform:rotate(-8deg); }
 70% { transform:rotate(3deg); }
}
@media(prefers-reduced-motion:no-preference) and (min-width:761px) {
 html[data-rift-theme]:not([data-rift-paused]) #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true']::after {
  animation:rift-sidebar-arrive 480ms var(--rift-curve) both;
 }
 html[data-rift-theme]:not([data-rift-paused]) #root [data-slot='sidebar'] button[class*='_newSession']:is(:hover,:focus-visible)::after {
  animation:rift-sidebar-gate 650ms var(--rift-curve);
 }
 html[data-rift-theme]:not([data-rift-paused]) #root [data-slot='sidebar.panellist'] button:is(:hover,:focus-visible) > svg {
  animation:rift-sidebar-wake 480ms var(--rift-curve); transform-origin:center;
 }
}
html[data-rift-paused] #root [data-slot='sidebar'] button::after,
html[data-rift-paused] #root [data-slot='sidebar.panellist'] button > svg { animation:none!important; }
@media(forced-colors:active){
 html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem']::before,
 html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem']::after { display:none; }
 html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] { outline:2px solid Highlight; outline-offset:-2px; }
}
`
