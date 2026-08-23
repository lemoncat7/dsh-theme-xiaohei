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
  overflow: hidden;
  border: 1px solid var(--xiaohei-sidebar-glass-edge);
  border-radius: var(--xiaohei-radius-panel);
  background:
    radial-gradient(96% 16% at 14% 0%, var(--xiaohei-sidebar-glass-highlight), transparent 64%),
    linear-gradient(
      90deg,
      var(--xiaohei-sidebar-glass-refraction),
      transparent 6%,
      transparent 95%,
      var(--xiaohei-sidebar-glass-inner-edge)
    ),
    linear-gradient(
      180deg,
      var(--xiaohei-sidebar-glass-refraction),
      transparent 9%,
      transparent 88%,
      var(--xiaohei-sidebar-glass-inner-edge)
    ),
    var(--xiaohei-sidebar-glass-fill);
  box-shadow:
    0 0 0 1px var(--xiaohei-sidebar-glass-outline),
    inset 0 1px 0 var(--xiaohei-sidebar-glass-highlight),
    inset 1px 0 0 var(--xiaohei-sidebar-glass-refraction),
    inset -1px 0 0 var(--xiaohei-sidebar-glass-inner-edge),
    inset 0 -1px 0 var(--xiaohei-sidebar-glass-inner-edge),
    0 1px 1px rgb(255 255 255 / 4%),
    10px 0 30px -22px var(--xiaohei-sidebar-shadow),
    0 24px 52px -30px var(--xiaohei-sidebar-shadow);
  -webkit-backdrop-filter:
    blur(28px)
    saturate(var(--xiaohei-sidebar-glass-saturation))
    brightness(var(--xiaohei-sidebar-glass-brightness));
  backdrop-filter:
    blur(28px)
    saturate(var(--xiaohei-sidebar-glass-saturation))
    brightness(var(--xiaohei-sidebar-glass-brightness));
}

/* Specular light and the inner lens rim are independent from the tint. This
 * keeps the surface recognisably glass without reducing control contrast. */
#dsh-theme-xiaohei\\/sidebar-glass::before,
#dsh-theme-xiaohei\\/sidebar-glass::after {
  content: '';
  position: absolute;
  pointer-events: none;
}

#dsh-theme-xiaohei\\/sidebar-glass::before {
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(
      112deg,
      var(--xiaohei-sidebar-glass-specular),
      transparent 14%,
      transparent 78%,
      var(--xiaohei-sidebar-glass-refraction)
    );
  opacity: .72;
  -webkit-mask-image: linear-gradient(180deg, black, rgb(0 0 0 / 18%) 26%, transparent 58%);
  mask-image: linear-gradient(180deg, black, rgb(0 0 0 / 18%) 26%, transparent 58%);
}

#dsh-theme-xiaohei\\/sidebar-glass::after {
  inset: 1px;
  border-radius: calc(var(--xiaohei-radius-panel) - 1px);
  box-shadow:
    inset 0 0 0 1px var(--xiaohei-sidebar-glass-refraction),
    inset 0 18px 24px -28px var(--xiaohei-sidebar-glass-highlight),
    inset 0 -20px 30px -30px var(--xiaohei-sidebar-shadow);
}

/* Generated ink-space artwork supplies the complex Xiaohei identity. It is a
 * paint-only layer inside the glass and never participates in host layout. */
#dsh-theme-xiaohei\\/sidebar-glass > .xiaohei-sidebar-atmosphere {
  position: absolute;
  z-index: 0;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left bottom;
  pointer-events: none;
  user-select: none;
  opacity: var(--xiaohei-sidebar-atmosphere-opacity);
  mix-blend-mode: screen;
}

html[data-xiaohei-appearance='light']
  #dsh-theme-xiaohei\\/sidebar-glass > .xiaohei-sidebar-atmosphere {
  mix-blend-mode: multiply;
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
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-color: transparent;
  background: transparent !important;
  box-shadow: none;
  justify-content: flex-start;
  gap: 8px;
  padding-inline: 12px;
  text-align: start;
}

/* One quiet horizontal ink stroke replaces the generic button card. The
 * brush is paint-only; the native button, label and focus target stay intact. */
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']::before,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 3px 7px 3px 5px;
  border-radius: 42% 9% 37% 12% / 28% 46% 36% 58%;
  background: linear-gradient(
    94deg,
    transparent 0%,
    var(--xiaohei-sidebar-brush-ink) 5%,
    var(--xiaohei-sidebar-brush-ink) 72%,
    transparent 100%
  );
  -webkit-mask-image:
    radial-gradient(ellipse 12px 70% at 5% 48%, black 44%, transparent 76%),
    linear-gradient(90deg, black 5%, black 76%, transparent 100%);
  mask-image:
    radial-gradient(ellipse 12px 70% at 5% 48%, black 44%, transparent 76%),
    linear-gradient(90deg, black 5%, black 76%, transparent 100%);
  -webkit-mask-composite: source-over;
  mask-composite: add;
  opacity: .9;
  transform: scaleX(.985);
  transform-origin: left center;
  transition:
    background-color var(--xiaohei-motion-base) ease,
    opacity var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-base) var(--xiaohei-motion-curve);
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:hover,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']:hover {
  color: var(--xiaohei-sidebar-emphasis);
  border-color: transparent;
  background: transparent !important;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']:hover::before,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']:hover::before {
  background: linear-gradient(
    94deg,
    transparent 0%,
    var(--xiaohei-sidebar-brush-ink-hover) 5%,
    var(--xiaohei-sidebar-brush-ink-hover) 72%,
    transparent 100%
  );
  opacity: 1;
  transform: scaleX(1);
}

/* Footer occupants keep their native layout. Only their interaction surface
 * is shaded, avoiding a second card inside the sidebar glass. */
#root [data-slot='sidebar'] > div:not([class*='_collapsed'])
  > :has(> div > [data-slot='sidebar.footer.action']) {
  box-sizing: border-box;
  gap: 2px;
  margin: 8px 2px 4px;
  padding: 4px;
  border: 1px solid var(--xiaohei-sidebar-control-edge);
  border-radius: calc(var(--xiaohei-radius-control) + 2px);
  background: color-mix(in srgb, var(--xiaohei-sidebar-control) 76%, transparent);
  box-shadow: inset 0 1px 0 var(--xiaohei-sidebar-control-highlight);
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

  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']::before,
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']::before {
    transition-duration: 0ms !important;
  }
}

@media (prefers-reduced-transparency: reduce) {
  #dsh-theme-xiaohei\\/sidebar-glass {
    background: var(--xiaohei-sidebar-glass-solid);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  #dsh-theme-xiaohei\\/sidebar-glass > .xiaohei-sidebar-atmosphere {
    opacity: var(--xiaohei-sidebar-atmosphere-solid-opacity);
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

  #dsh-theme-xiaohei\\/sidebar-glass > .xiaohei-sidebar-atmosphere {
    display: none;
  }

  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话'],
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session'] {
    border-color: ButtonText;
  }

  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='新建会话']::before,
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > button[aria-label='New session']::before {
    display: none;
  }
}
`
