/**
 * Xiaohei identity marks shared by native DSH chrome and opt-in feature plugins.
 * Frames own geometry; this layer owns brush plaques, sketch strokes, and pendants.
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
  min-width: 48px;
  height: 19px;
  padding-inline: 10px 14px;
  overflow: hidden;
  border: 0;
  border-radius: 2px 6px 3px 2px;
  clip-path: polygon(0 18%, 7px 2%, 42% 0, 47% 8%, 92% 3%, 100% 24%, calc(100% - 4px) 69%, 100% 85%, 79% 100%, 45% 92%, 14% 100%, 0 78%);
  color: var(--xiaohei-frame-label);
  background:
    linear-gradient(106deg, transparent 0 43%, var(--xiaohei-frame-line-strong) 45% 48%, transparent 50%) calc(100% - 11px) 3px / 9px 12px no-repeat,
    linear-gradient(92deg, var(--xiaohei-frame-line-strong), transparent 84%) 7px 1px / calc(100% - 20px) 1px no-repeat,
    linear-gradient(88deg, transparent, var(--xiaohei-frame-line) 12% 88%, transparent) 3px calc(100% - 2px) / calc(100% - 7px) 1px no-repeat,
    linear-gradient(96deg, rgb(255 255 255 / 4%), transparent 42%),
    var(--xiaohei-frame-plaque);
  box-shadow:
    -1px 1px 0 var(--xiaohei-frame-line),
    2px -1px 0 -1px var(--xiaohei-frame-line-strong),
    0 5px 10px var(--xiaohei-shadow);
  font-family: 'AR PL UKai CN', STKaiti, KaiTi, FangSong, serif;
  font-size: 10px;
  font-weight: 700;
  line-height: 18px;
  letter-spacing: 0.15em;
  white-space: nowrap;
  text-shadow: 0 1px 0 var(--xiaohei-frame-ink);
  pointer-events: none;
  transform: rotate(-0.65deg) skewX(-1.5deg);
  transform-origin: left center;
}

:where([data-xiaohei-frame-label])::before {
  content: attr(data-xiaohei-frame-label);
  top: -9px;
  left: 14px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::before {
  content: '会馆 · 工作区';
  top: 5px;
  left: 13px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::before {
  content: '小黑 · 工具札';
  top: -9px;
  left: 13px;
}

#root [data-composer-card='true']::after {
  content: '小黑 · 会话域';
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
  width: 22px;
  height: 33px;
  border: 0;
  background:
    radial-gradient(circle at 43% 73%, var(--xiaohei-frame-label) 0 1px, transparent 1.5px),
    radial-gradient(circle at 57% 73%, var(--xiaohei-frame-label) 0 1px, transparent 1.5px),
    radial-gradient(circle at 50% 43%, var(--xiaohei-frame-line-strong) 0 2px, transparent 2.5px),
    radial-gradient(circle at 50% 72%, var(--xiaohei-frame-ink) 0 7px, var(--xiaohei-frame-line-strong) 7.5px 8px, transparent 8.5px),
    linear-gradient(var(--xiaohei-frame-line-strong), var(--xiaohei-frame-line-strong)) 50% 0 / 1px 17px no-repeat,
    linear-gradient(83deg, transparent 46%, var(--xiaohei-frame-line-strong) 48% 51%, transparent 53%) 4px 0 / 8px 21px no-repeat,
    linear-gradient(97deg, transparent 46%, var(--xiaohei-frame-line) 48% 51%, transparent 53%) 10px 0 / 8px 21px no-repeat;
  box-shadow: none;
  filter: drop-shadow(0 4px 5px var(--xiaohei-shadow));
  opacity: 1;
  pointer-events: none;
  transform: rotate(2deg);
  transform-origin: 50% 0;
  transition: transform 320ms var(--xiaohei-motion-curve), filter var(--xiaohei-motion-base) ease;
}

:where([data-xiaohei-frame-ornament='spirit-knot'])::after {
  top: -5px;
  right: 16px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div::after {
  top: -1px;
  right: 11px;
}

#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action'])::after {
  top: -8px;
  right: 13px;
}

#root [data-composer-card='true']::before {
  top: -3px;
  right: 24px;
}

:where([data-xiaohei-frame-ornament='spirit-knot']):hover::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) [data-slot='sidebar.workspaces'] > div:hover::after,
#root [data-slot='sidebar'] > div:not([class*='_collapsed']) > div:has([data-slot='sidebar.footer.action']):hover::after,
#root [data-composer-card='true']:focus-within::before {
  filter: drop-shadow(0 5px 7px var(--xiaohei-focus-shadow));
  transform: rotate(-5deg);
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
