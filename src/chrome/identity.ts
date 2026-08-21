import {
  XIAOHEI_IDENTITY_CAT_TAG,
  XIAOHEI_IDENTITY_CHARM,
  XIAOHEI_IDENTITY_SPACE_RING,
} from '../generated-identity.js'

/**
 * Xiaohei ornaments shared by native DSH chrome and opt-in feature plugins.
 * Frames own geometry and headings; this layer owns generated hanging art only.
 */
export const XIAOHEI_IDENTITY_CSS = `
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
  top: 7px;
  right: 11px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::after {
  top: 5px;
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
  :where([data-xiaohei-frame-ornament])::after,
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::after,
  #root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::after,
  #root [data-composer-card='true']::before {
    display: none;
  }
}
`
