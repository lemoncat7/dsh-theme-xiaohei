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

/* Reveal wide navigation only after its column has reached the target width.
 * Keep the toggle itself native. Opacity is applied to content, never the shell
 * (which also hosts fixed-position settings dialogs). */
@media (prefers-reduced-motion: no-preference) {
  #root [data-slot='sidebar'] > div[data-xiaohei-sidebar-reveal]:not([class*='_collapsed']) > :not(:first-child),
  #root [data-slot='sidebar'] > div[data-xiaohei-sidebar-reveal]:not([class*='_collapsed']) > div:first-child > button:first-child {
    transition: opacity 100ms ease-out;
  }
  #root [data-slot='sidebar'] > div[data-xiaohei-sidebar-reveal='waiting']:not([class*='_collapsed']) > :not(:first-child),
  #root [data-slot='sidebar'] > div[data-xiaohei-sidebar-reveal='waiting']:not([class*='_collapsed']) > div:first-child > button:first-child {
    opacity: 0 !important;
    visibility: hidden;
    transition: none;
  }
}

/* Hide the tree scrollbar's paint, retaining its gutter so rows do not grow
 * into the glass edge. Wheel, touch and keyboard remain native; dialogs and
 * other plugin panels keep their normal scrollbar affordance. */
#root [data-slot='sidebar.workspaces'] [role='tree'] {
  scrollbar-color: transparent transparent !important;
}

#root [data-slot='sidebar.workspaces'] [role='tree']::-webkit-scrollbar,
#root [data-slot='sidebar.workspaces'] [role='tree']::-webkit-scrollbar-thumb,
#root [data-slot='sidebar.workspaces'] [role='tree']::-webkit-scrollbar-track {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

/* The host shell remains paint- and filter-free because Settings is a fixed
 * descendant. The glass itself lives outside #root in the scene layer. */
#root [data-slot='sidebar'] > div {
  --dsh-sidebar-inline-padding: 18px;
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
  overflow: hidden;
  border: 1px solid var(--xiaohei-sidebar-glass-edge);
  border-radius: var(--xiaohei-sidebar-glass-radius);
  background: var(--xiaohei-sidebar-glass-fill);
  box-shadow:
    inset 0 1px var(--xiaohei-sidebar-glass-highlight),
    inset 1px 0 var(--xiaohei-sidebar-glass-refraction),
    0 18px 50px -32px var(--xiaohei-sidebar-shadow);
  -webkit-backdrop-filter:
    blur(var(--xiaohei-sidebar-glass-blur))
    saturate(var(--xiaohei-sidebar-glass-saturation));
  backdrop-filter:
    blur(var(--xiaohei-sidebar-glass-blur))
    saturate(var(--xiaohei-sidebar-glass-saturation));
}

/* Width dragging changes the full-height glass raster every frame. Suspend
 * only the filters while geometry is moving; the translucent surface remains
 * visible and the settled glass returns after the resize gesture ends. */
html[data-xiaohei-sidebar-resizing] #dsh-theme-xiaohei\\/sidebar-glass {
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

/* One restrained inner rim completes the glass edge without tinting content. */
#dsh-theme-xiaohei\\/sidebar-glass::after {
  content: '';
  position: absolute;
  pointer-events: none;
  inset: 1px;
  border-radius: calc(var(--xiaohei-sidebar-glass-radius) - 1px);
  box-shadow:
    inset 0 1px var(--xiaohei-sidebar-glass-refraction),
    inset 0 -20px 28px -32px var(--xiaohei-sidebar-shadow-soft);
}

/* The official brand slot owns geometry in both the wide sidebar and rail.
 * The bitmap remains visible as a no-WebGL fallback while the compact
 * MetallicPaint canvas adds a restrained liquid-metal pass above it. */
.xiaohei-brand-mark {
  position: relative;
  display: inline-grid;
  flex: none;
  place-items: center;
  width: var(--xiaohei-brand-mark-size);
  height: var(--xiaohei-brand-mark-size);
  margin: -2px;
  overflow: visible;
  pointer-events: none;
  filter: drop-shadow(0 2px 3px rgb(8 13 15 / 18%));
  transform: translateY(-1px);
}

.xiaohei-brand-mark__fallback,
.xiaohei-brand-mark__metal {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.xiaohei-brand-mark__fallback {
  opacity: .94;
  transition: opacity var(--xiaohei-motion-base) ease;
}

.xiaohei-brand-mark__metal {
  opacity: 0;
  transition:
    opacity var(--xiaohei-motion-base) ease,
    filter var(--xiaohei-motion-base) ease;
}

.xiaohei-brand-mark[data-metallic-ready='true'] .xiaohei-brand-mark__fallback {
  opacity: .28;
}

.xiaohei-brand-mark[data-metallic-ready='true'] .xiaohei-brand-mark__metal {
  opacity: .92;
}

.xiaohei-brand-name {
  white-space: nowrap;
  letter-spacing: .025em;
  font-size: 17px;
  font-weight: 600;
}

/* ui-conversation currently exposes the Hero mark but not its headline as a
 * slot. Anchor the visual copy to that official mark occupant so hashed Host
 * class names and unrelated headings remain untouched. */
#root span:has(> .xiaohei-brand-mark[data-brand-context='hero']) + span {
  font-size: 0;
}

#root span:has(> .xiaohei-brand-mark[data-brand-context='hero']) + span::after {
  content: '万物有灵，自在同行';
  font-size: 26px;
  font-weight: 500;
  line-height: 32px;
}

#root [data-slot='sidebar'] button:hover .xiaohei-brand-mark__metal {
  filter: brightness(1.12) contrast(1.04);
}

/* Keep native rail/wide geometry and one consistent control material. */
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
  color: var(--xiaohei-sidebar-emphasis);
  transition:
    background-color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:first-child button:last-child:hover {
  background: var(--xiaohei-sidebar-hover);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
  border: 1px solid var(--xiaohei-sidebar-control-edge);
  border-radius: var(--xiaohei-radius-control);
  background: var(--xiaohei-sidebar-control);
  box-shadow: inset 0 1px var(--xiaohei-sidebar-control-highlight);
  justify-content: flex-start;
  gap: 8px;
  padding-inline: 12px;
  text-align: start;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:hover,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']:hover {
  border-color: var(--xiaohei-sidebar-control-edge-hover);
  background: var(--xiaohei-sidebar-hover);
}

/* The footer uses a divider instead of another framed card. */
#root [data-slot='sidebar'] > div:not([class*='_collapsed'])
  > :has(> div > [data-slot='sidebar.footer.action']) {
  box-sizing: border-box;
  gap: 2px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--xiaohei-sidebar-control-edge);
}

#root [data-slot='sidebar.footer.action'] > button,
#root [data-slot='sidebar.settings'] > button {
  color: var(--dsw-alias-label-secondary);
  border-radius: var(--xiaohei-radius-small) !important;
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve);
}

#root [data-slot='sidebar.footer.action'] > button:hover,
#root [data-slot='sidebar.settings'] > button:hover,
#root [data-slot='sidebar.footer.action'] > button[aria-expanded='true'],
#root [data-slot='sidebar.settings'] > button[aria-expanded='true'] {
  color: var(--xiaohei-sidebar-emphasis);
  background: var(--xiaohei-sidebar-hover);
}

#root [data-slot='sidebar.footer.action'] > button:active,
#root [data-slot='sidebar.settings'] > button:active {
  transform: translateY(1px);
}

#root [data-slot='sidebar'] button:focus-visible {
  outline: 2px solid var(--xiaohei-sidebar-emphasis);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  #root [data-slot='sidebar'] button {
    transition-duration: 0ms !important;
  }


  .xiaohei-brand-mark__fallback,
  .xiaohei-brand-mark__metal {
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

  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
    border-color: ButtonText;
  }

}
`
