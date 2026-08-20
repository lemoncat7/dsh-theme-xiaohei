/** Native sidebar hierarchy with a static domain-depth plane and no extra icons. */
export const XIAOHEI_SIDEBAR_CSS = `
#root [data-slot='sidebar'] > div {
  position: relative;
  isolation: isolate;
  background:
    radial-gradient(130% 48% at 12% 90%, rgb(51 138 126 / 18%) 0%, transparent 68%),
    linear-gradient(180deg, rgb(5 18 22 / 70%) 0%, rgb(6 20 23 / 62%) 58%, rgb(6 22 24 / 78%) 100%) !important;
  border-right: 1px solid rgb(139 229 213 / 14%);
  box-shadow:
    inset -1px 0 rgb(255 255 255 / 2%),
    inset -12px 0 28px rgb(82 207 185 / 3%),
    16px 0 36px rgb(1 9 10 / 14%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed'])::before {
  content: '';
  position: absolute;
  z-index: 0;
  top: 5.4rem;
  right: 0;
  bottom: 5rem;
  width: 2rem;
  pointer-events: none;
  background: radial-gradient(ellipse at 100% 52%, rgb(121 232 212 / 13%), transparent 72%);
  border-right: 1px solid rgb(151 239 223 / 14%);
  opacity: 0.78;
  -webkit-mask-image: linear-gradient(180deg, transparent, black 18%, black 82%, transparent);
  mask-image: linear-gradient(180deg, transparent, black 18%, black 82%, transparent);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child {
  min-height: 62px;
  padding-inline: 14px;
  border-bottom: 1px solid rgb(139 229 213 / 8%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] button {
  border: 1px solid transparent;
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child {
  min-width: 30px;
  min-height: 30px;
  border-radius: 8px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child:hover,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] button:hover {
  color: #E7F3F0;
  border-color: rgb(139 229 213 / 14%);
  background: rgb(101 209 190 / 10%);
  box-shadow: inset 0 1px rgb(255 255 255 / 4%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'] {
  width: auto;
  min-height: 40px;
  margin: 10px 12px 12px;
  padding-inline: 14px;
  justify-content: flex-start;
  gap: 10px;
  border: 1px solid rgb(101 209 190 / 22%);
  border-radius: 11px;
  background: linear-gradient(180deg, rgb(101 209 190 / 15%), rgb(101 209 190 / 9%)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 5%),
    inset 0 0 0 1px rgb(101 209 190 / 3%);
  transition: border-color 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:hover {
  border-color: rgb(123 224 206 / 36%);
  background: linear-gradient(180deg, rgb(101 209 190 / 21%), rgb(101 209 190 / 13%)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 7%),
    inset 3px 0 rgb(139 229 213 / 12%),
    0 6px 18px rgb(1 9 10 / 12%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div > div:first-child {
  min-height: 38px;
  margin-inline: 4px;
  padding-inline: 8px;
  border-radius: 9px;
  background: rgb(3 14 17 / 18%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div > div:first-child > span:first-child {
  color: #A9C3BD;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] button {
  min-width: 28px;
  min-height: 28px;
  border-radius: 7px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] [role='tree'] {
  padding-top: 6px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] [role='treeitem'][aria-current='true'] {
  background: linear-gradient(90deg, rgb(101 209 190 / 13%), rgb(101 209 190 / 4%));
  box-shadow:
    inset 2px 0 var(--xiaohei-chrome-accent),
    inset 0 1px rgb(255 255 255 / 4%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] [role='tree'] > [class*='_empty'] {
  margin: 2px 4px 0;
  padding: 16px 14px 17px;
  border: 1px solid rgb(139 229 213 / 9%);
  border-radius: 11px;
  color: #91AAA5;
  background:
    radial-gradient(circle at 88% 22%, rgb(101 209 190 / 10%), transparent 34%),
    rgb(3 14 17 / 22%);
  font-size: 12px;
  line-height: 1.5;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:last-child {
  gap: 2px;
  margin: 8px 12px 12px;
  padding: 4px;
  border: 1px solid rgb(139 229 213 / 10%);
  border-radius: 12px;
  background: rgb(3 14 17 / 34%);
  box-shadow: inset 0 1px rgb(255 255 255 / 3%);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.footer.action'] > button,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.settings'] > button {
  min-height: 36px;
  padding-inline: 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #B9D0CB;
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.footer.action'] > button:hover,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.settings'] > button:hover,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.footer.action'] > button[aria-expanded='true'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.settings'] > button[aria-expanded='true'] {
  color: #E7F3F0;
  border-color: rgb(139 229 213 / 12%);
  background: rgb(101 209 190 / 10%);
}

#root [data-slot='sidebar'] button:focus-visible {
  outline: 2px solid #78DDCB;
  outline-offset: 2px;
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div {
  background:
    radial-gradient(130% 48% at 12% 90%, rgb(85 142 119 / 12%) 0%, transparent 68%),
    linear-gradient(180deg, rgb(244 248 244 / 84%) 0%, rgb(239 245 240 / 78%) 58%, rgb(235 242 236 / 88%) 100%) !important;
  border-right-color: rgb(37 92 79 / 13%);
  box-shadow:
    inset -1px 0 rgb(255 255 255 / 42%),
    inset -12px 0 28px rgb(47 133 118 / 3%),
    16px 0 36px rgb(47 72 61 / 8%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed'])::before {
  background: radial-gradient(ellipse at 100% 52%, rgb(47 133 118 / 9%), transparent 72%);
  border-right-color: rgb(47 133 118 / 13%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child {
  border-bottom-color: rgb(37 92 79 / 9%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child:hover,
html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] button:hover {
  color: #1E2B28;
  border-color: rgb(47 133 118 / 12%);
  background: rgb(47 133 118 / 9%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'] {
  border-color: rgb(47 133 118 / 24%);
  background: linear-gradient(180deg, rgb(255 255 255 / 62%), rgb(237 245 239 / 72%)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 72%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:hover {
  border-color: rgb(47 133 118 / 38%);
  background: linear-gradient(180deg, rgb(255 255 255 / 78%), rgb(229 240 232 / 82%)) !important;
  box-shadow: inset 0 1px rgb(255 255 255 / 84%), inset 3px 0 rgb(47 133 118 / 10%), 0 6px 18px rgb(44 73 60 / 8%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div > div:first-child {
  background: rgb(255 255 255 / 24%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div > div:first-child > span:first-child {
  color: #5C7069;
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] [role='tree'] > [class*='_empty'] {
  border-color: rgb(37 92 79 / 10%);
  color: #6A7B75;
  background:
    radial-gradient(circle at 88% 22%, rgb(47 133 118 / 9%), transparent 34%),
    rgb(255 255 255 / 28%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:last-child {
  border-color: rgb(37 92 79 / 11%);
  background: rgb(247 250 247 / 56%);
  box-shadow: inset 0 1px rgb(255 255 255 / 62%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.footer.action'] > button,
html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.settings'] > button {
  color: #52645F;
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.footer.action'] > button:hover,
html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.settings'] > button:hover,
html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.footer.action'] > button[aria-expanded='true'],
html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.settings'] > button[aria-expanded='true'] {
  color: #1E2B28;
  border-color: rgb(47 133 118 / 11%);
  background: rgb(47 133 118 / 9%);
}

html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] button:focus-visible {
  outline-color: #2F8576;
}

@media (prefers-reduced-transparency: reduce) {
  #root [data-slot='sidebar'] > div { background: #07181B !important; }
  html[data-xiaohei-appearance='light'] #root [data-slot='sidebar'] > div { background: #EFF4EF !important; }
}

@media (prefers-contrast: more), (forced-colors: active) {
  #root [data-slot='sidebar'] > div:not([class*='_collapsed'])::before { display: none; }
}
`
