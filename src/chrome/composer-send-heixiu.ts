/** Heixiu is the Host send button, not a neighbouring ornament. */
export const XIAOHEI_COMPOSER_SEND_HEIXIU_CSS = `
/* Official InputBar contract: row -> trailing controls -> last primary action. */
#root [data-composer-card='true'] > :last-child > :last-child > button:last-child {
  position: relative;
  isolation: isolate;
  width: 38px;
  height: 38px;
  min-width: 38px;
  min-height: 38px;
  border: 1px solid var(--xiaohei-composer-control-edge) !important;
  border-radius: 50% !important;
  color: var(--xiaohei-composer-primary-icon) !important;
  background: var(--xiaohei-composer-disabled) !important;
  box-shadow: inset 0 1px 0 var(--xiaohei-composer-highlight) !important;
}

#root [data-composer-card='true'] > :last-child > :last-child > button:last-child[data-xiaohei-send-heixiu='true'] {
  overflow: visible;
  padding: 0;
  border-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
}

/* Preserve the native glyph in the DOM; only the visual presentation changes. */
#root [data-composer-card='true'] > :last-child > :last-child
  > button[data-xiaohei-send-heixiu='true'] > svg {
  opacity: 0;
}

.xiaohei-composer-send-heixiu {
  position: absolute;
  z-index: 1;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  opacity: 1;
  transform: translateY(-1px) scale(1) translateZ(0);
  transform-origin: 50% 58%;
  transition:
    opacity 160ms ease,
    transform 180ms var(--xiaohei-motion-curve);
}

.xiaohei-composer-send-heixiu img {
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  width: 60px;
  height: 60px;
  max-width: none;
  user-select: none;
  pointer-events: none;
  object-fit: contain;
  filter:
    drop-shadow(0 0 1px var(--xiaohei-composer-heixiu-edge))
    drop-shadow(0 3px 4px var(--xiaohei-composer-heixiu-shadow));
  transform: translate(-50%, -45%) translateZ(0);
}

.xiaohei-composer-send-heixiu__open {
  opacity: 1;
}

.xiaohei-composer-send-heixiu__blink {
  opacity: 0;
}

.xiaohei-composer-send-heixiu[data-xiaohei-blink='closed']
  .xiaohei-composer-send-heixiu__open {
  opacity: 0;
}

.xiaohei-composer-send-heixiu[data-xiaohei-blink='closed']
  .xiaohei-composer-send-heixiu__blink {
  opacity: 1;
}

#root [data-composer-card='true'] > :last-child > :last-child
  > button[data-xiaohei-send-heixiu='true']:not(:disabled):hover {
  border-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  transform: none;
}

#root [data-composer-card='true'] > :last-child > :last-child
  > button[data-xiaohei-send-heixiu='true']:not(:disabled):hover
  .xiaohei-composer-send-heixiu {
  transform: translateY(-2px) scale(1.055) translateZ(0);
}

#root [data-composer-card='true'] > :last-child > :last-child
  > button[data-xiaohei-send-heixiu='true']:not(:disabled):active {
  transform: none;
}

#root [data-composer-card='true'] > :last-child > :last-child
  > button[data-xiaohei-send-heixiu='true']:not(:disabled):active
  .xiaohei-composer-send-heixiu {
  transform: translateY(0) scale(.93) translateZ(0);
}

#root [data-composer-card='true'] > :last-child > :last-child
  > button[data-xiaohei-send-heixiu='true']:disabled {
  border-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  transform: none;
}

#root [data-composer-card='true'] > :last-child > :last-child
  > button[data-xiaohei-send-heixiu='true']:disabled
  .xiaohei-composer-send-heixiu {
  opacity: .42;
}

@media (prefers-reduced-motion: reduce) {
  .xiaohei-composer-send-heixiu {
    transition-duration: 0.01ms !important;
  }
}

@media (forced-colors: active) {
  #root [data-composer-card='true'] > :last-child > :last-child
    > button[data-xiaohei-send-heixiu='true'] {
    border: 1px solid ButtonText !important;
    background: ButtonFace !important;
  }

  #root [data-composer-card='true'] > :last-child > :last-child
    > button[data-xiaohei-send-heixiu='true'] > svg {
    opacity: 1;
  }

  .xiaohei-composer-send-heixiu {
    display: none;
  }
}
`
