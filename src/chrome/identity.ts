import {
  XIAOHEI_IDENTITY_CAT_TAG,
  XIAOHEI_IDENTITY_CHARM,
  XIAOHEI_IDENTITY_PLAQUE,
  XIAOHEI_IDENTITY_SPACE_RING,
} from '../generated-identity.js'

/**
 * Xiaohei identity marks shared by native DSH chrome and opt-in feature plugins.
 * Frames own geometry; this layer owns generated art plaques and ornaments.
 */
export const XIAOHEI_IDENTITY_CSS = `
:where([data-xiaohei-frame-label])::before,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::before,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::before,
#root [data-composer-card='true']::after {
  position: absolute;
  z-index: 3;
  box-sizing: border-box;
  width: max-content;
  min-width: 104px;
  height: 33px;
  padding: 7px 20px 8px 26px;
  overflow: visible;
  border: 0;
  border-radius: 0;
  color: #17383E;
  background: url("${XIAOHEI_IDENTITY_PLAQUE}") center / 100% 100% no-repeat;
  box-shadow: none;
  font-family: ui-sans-serif, system-ui, sans-serif;
  font-size: 11px;
  font-weight: 650;
  line-height: 18px;
  letter-spacing: 0.12em;
  white-space: nowrap;
  text-shadow: 0 1px rgb(255 255 255 / 44%);
  pointer-events: none;
  transform: rotate(-1deg);
  transform-origin: left center;
}

:where([data-xiaohei-frame-label])::before {
  content: attr(data-xiaohei-frame-label);
  top: -9px;
  left: 14px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::before {
  content: '工作区';
  top: 2px;
  left: 13px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::before {
  content: '工具';
  top: -14px;
  left: 13px;
}

#root [data-composer-card='true']::after {
  content: '会话';
  top: -14px;
  right: auto;
  bottom: auto;
  left: clamp(132px, 19%, 152px);
  -webkit-mask-image: none;
  mask-image: none;
}

:where([data-xiaohei-frame-ornament='spirit-knot'])::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::after,
#root [data-composer-card='true']::before {
  content: '';
  position: absolute;
  z-index: 3;
  width: 30px;
  height: 48px;
  border: 0;
  border-radius: 0;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
  box-shadow: none;
  filter: drop-shadow(0 3px 4px var(--xiaohei-shadow));
  opacity: 0.92;
  pointer-events: none;
  transform: rotate(3deg);
  transform-origin: 50% 8%;
  transition: transform 320ms var(--xiaohei-motion-curve), filter var(--xiaohei-motion-base) ease;
}

:where([data-xiaohei-frame-ornament='spirit-knot'])::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::after {
  background-image: url("${XIAOHEI_IDENTITY_CHARM}");
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::after {
  background-image: url("${XIAOHEI_IDENTITY_SPACE_RING}");
}

#root [data-composer-card='true']::before {
  width: 34px;
  height: 50px;
  background-image: url("${XIAOHEI_IDENTITY_CAT_TAG}");
}

:where([data-xiaohei-frame-ornament='spirit-knot'])::after {
  top: -6px;
  right: 16px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::after {
  top: 0;
  right: 11px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::after {
  top: -12px;
  right: 13px;
}

#root [data-composer-card='true']::before {
  top: -10px;
  right: 24px;
}

:where([data-xiaohei-frame-ornament='spirit-knot']):hover::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div:hover::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action']):hover::after,
#root [data-composer-card='true']:focus-within::before {
  filter: drop-shadow(0 4px 6px var(--xiaohei-focus-shadow));
  transform: rotate(-4deg) scale(1.03);
}

@media (forced-colors: active) {
  :where([data-xiaohei-frame-label])::before,
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::before,
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::before,
  #root [data-composer-card='true']::after {
    border: 1px solid currentColor;
    color: CanvasText;
    background: Canvas;
    box-shadow: none;
    text-shadow: none;
    transform: none;
  }

  :where([data-xiaohei-frame-ornament])::after,
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::after,
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::after,
  #root [data-composer-card='true']::before {
    display: none;
  }
}
`
