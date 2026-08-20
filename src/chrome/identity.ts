/**
 * Xiaohei identity marks shared by native DSH chrome and opt-in feature plugins.
 * Frames own geometry; this layer owns handwritten plaques, sketch strokes, and ink seals.
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
  min-width: 58px;
  height: 22px;
  padding-inline: 10px 17px;
  overflow: hidden;
  border: 0;
  border-radius: 2px 7px 3px 2px;
  clip-path: polygon(0 14%, 6px 3%, 46% 0, 50% 6%, 94% 2%, 100% 21%, calc(100% - 3px) 76%, 96% 94%, 56% 100%, 48% 94%, 12% 100%, 0 82%);
  color: var(--xiaohei-frame-label);
  background:
    linear-gradient(108deg, transparent 0 43%, var(--xiaohei-frame-line-strong) 45% 48%, transparent 50%) calc(100% - 13px) 4px / 10px 13px no-repeat,
    linear-gradient(91deg, var(--xiaohei-frame-line-strong), transparent 76%) 8px 2px / calc(100% - 21px) 1px no-repeat,
    linear-gradient(87deg, transparent, var(--xiaohei-frame-line) 10% 84%, transparent) 4px calc(100% - 3px) / calc(100% - 8px) 1px no-repeat,
    linear-gradient(93deg, transparent 0 7%, var(--xiaohei-frame-line) 8% 32%, transparent 35%) 0 calc(100% - 1px) / 100% 1px no-repeat,
    linear-gradient(96deg, rgb(255 255 255 / 7%), transparent 46%),
    var(--xiaohei-frame-plaque);
  box-shadow:
    -1px 1px 0 var(--xiaohei-frame-line),
    2px -1px 0 -1px var(--xiaohei-frame-line-strong),
    0 5px 10px var(--xiaohei-shadow);
  font-family: 'AR PL UKai CN', STKaiti, KaiTi, FangSong, serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 21px;
  letter-spacing: 0.08em;
  white-space: nowrap;
  text-shadow: 0.35px 0 currentColor;
  pointer-events: none;
  transform: rotate(-1.35deg) skewX(-2deg);
  transform-origin: left center;
}

:where([data-xiaohei-frame-label])::before {
  content: attr(data-xiaohei-frame-label);
  top: -9px;
  left: 14px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::before {
  content: '小黑手记';
  top: 5px;
  left: 13px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::before {
  content: '小黑随行';
  top: -9px;
  left: 13px;
}

#root [data-composer-card='true']::after {
  content: '小黑会话';
  top: -9px;
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
  box-sizing: border-box;
  width: 24px;
  height: 23px;
  border: 1px solid var(--xiaohei-frame-line-strong);
  border-radius: 48% 52% 45% 55% / 52% 46% 54% 48%;
  background:
    radial-gradient(ellipse at 50% 68%, var(--xiaohei-frame-label) 0 4px, transparent 4.5px),
    radial-gradient(circle at 28% 38%, var(--xiaohei-frame-label) 0 2px, transparent 2.4px),
    radial-gradient(circle at 50% 28%, var(--xiaohei-frame-label) 0 2px, transparent 2.4px),
    radial-gradient(circle at 72% 38%, var(--xiaohei-frame-label) 0 2px, transparent 2.4px),
    linear-gradient(132deg, rgb(255 255 255 / 8%), transparent 48%),
    var(--xiaohei-frame-plaque);
  box-shadow:
    inset 0 0 0 1px var(--xiaohei-frame-inner),
    0 3px 7px var(--xiaohei-shadow);
  filter: none;
  opacity: 0.94;
  pointer-events: none;
  transform: rotate(4deg);
  transform-origin: 50% 50%;
  transition: transform 320ms var(--xiaohei-motion-curve), filter var(--xiaohei-motion-base) ease;
}

:where([data-xiaohei-frame-ornament='spirit-knot'])::after {
  top: -9px;
  right: 16px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::after {
  top: 5px;
  right: 11px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::after {
  top: -10px;
  right: 13px;
}

#root [data-composer-card='true']::before {
  top: -9px;
  right: 24px;
}

:where([data-xiaohei-frame-ornament='spirit-knot']):hover::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div:hover::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action']):hover::after,
#root [data-composer-card='true']:focus-within::before {
  border-color: var(--xiaohei-spirit);
  box-shadow:
    inset 0 0 0 1px var(--xiaohei-frame-inner),
    0 4px 9px var(--xiaohei-focus-shadow);
  filter: none;
  transform: rotate(-4deg) scale(1.04);
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
