/** Conversation composer, command affordances, and send action. */
export const XIAOHEI_COMPOSER_CSS = `
#root [data-composer-card='true'] {
  position: relative;
  isolation: isolate;
  overflow: visible;
  border: 1px solid var(--xiaohei-edge) !important;
  border-radius: var(--xiaohei-radius-panel) !important;
  background:
    linear-gradient(var(--xiaohei-frame-line-strong), var(--xiaohei-frame-line-strong)) 18px 0 / 46px 1px no-repeat,
    linear-gradient(var(--xiaohei-frame-line), var(--xiaohei-frame-line)) 0 15px / 1px 28px no-repeat,
    linear-gradient(var(--xiaohei-frame-line), var(--xiaohei-frame-line)) 100% calc(100% - 15px) / 1px 28px no-repeat,
    linear-gradient(180deg, rgb(255 255 255 / 4%), transparent 32%),
    var(--dsw-specific-input-major) !important;
  box-shadow:
    inset 0 0 0 1px var(--xiaohei-frame-inner),
    inset 0 1px rgb(255 255 255 / 7%),
    inset 0 -1px var(--xiaohei-spirit-faint),
    0 16px 38px var(--xiaohei-shadow) !important;
  transition:
    border-color var(--xiaohei-motion-base) ease,
    box-shadow var(--xiaohei-motion-base) ease;
}

#root [data-composer-card='true']::after {
  content: '小黑 · 会话域';
  position: absolute;
  z-index: 2;
  top: -9px;
  right: auto;
  bottom: auto;
  left: clamp(132px, 19%, 152px);
  width: max-content;
  height: 17px;
  padding-inline: 8px;
  border: 1px solid var(--xiaohei-frame-line);
  border-radius: 3px 8px 8px 3px;
  color: var(--xiaohei-frame-label);
  background: var(--xiaohei-frame-plaque);
  box-shadow: inset 0 1px var(--xiaohei-frame-inner), 0 4px 10px var(--xiaohei-shadow);
  font-size: 9px;
  font-weight: 650;
  line-height: 15px;
  letter-spacing: 0.14em;
  -webkit-mask-image: none;
  mask-image: none;
  pointer-events: none;
}

/* The spirit seam stays part of the control edge instead of reading as a pasted ornament. */
#root [data-composer-card='true']::before {
  content: '';
  position: absolute;
  top: -1px;
  right: 22px;
  width: 68px;
  height: 2px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--xiaohei-spirit-strong), transparent);
  box-shadow: 0 0 10px var(--xiaohei-focus-shadow);
  opacity: 0.42;
  pointer-events: none;
  transform: scaleX(0.74);
  transform-origin: right center;
  transition: opacity var(--xiaohei-motion-base) ease, transform 260ms var(--xiaohei-motion-curve);
}

#root [data-composer-card='true']:focus-within {
  border-color: var(--xiaohei-edge-strong) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 9%),
    0 16px 40px var(--xiaohei-shadow),
    0 0 0 4px var(--xiaohei-focus-shadow) !important;
}

#root [data-composer-card='true']:focus-within::before {
  opacity: 0.9;
  transform: scaleX(1);
}

#root [data-composer-card='true'] textarea {
  color: var(--dsw-alias-label-primary) !important;
  caret-color: var(--xiaohei-spirit-strong);
}

#root [data-composer-card='true'] textarea::placeholder {
  color: var(--dsw-alias-label-tertiary) !important;
  opacity: 0.92;
}

#root [data-composer-card='true'] [data-input-backdrop='true'] {
  border-color: transparent !important;
  background: transparent !important;
}

#root [data-composer-card='true'] button {
  min-width: 28px;
  min-height: 28px;
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-small);
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve);
}

#root [data-composer-card='true'] button:not(:disabled):hover {
  color: var(--xiaohei-spirit-strong);
  border-color: var(--xiaohei-edge);
  background: var(--xiaohei-spirit-soft);
}

#root [data-composer-card='true'] button:not(:disabled):active {
  transform: translateY(1px) scale(0.98);
}

#root button[aria-label='发送消息'],
#root button[aria-label='Send message'] {
  position: relative;
  isolation: isolate;
  border: 1px solid var(--xiaohei-edge-strong) !important;
  border-radius: 50% !important;
  color: var(--dsw-alias-brand-primary-invert) !important;
  background:
    radial-gradient(circle at 36% 27%, rgb(255 255 255 / 36%) 0 7%, transparent 9%),
    linear-gradient(145deg, var(--xiaohei-spirit), var(--dsw-alias-button-primary-fill)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 34%),
    inset 0 -2px rgb(4 25 31 / 18%),
    0 6px 16px var(--xiaohei-focus-shadow) !important;
  transition:
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve),
    box-shadow var(--xiaohei-motion-base) ease,
    filter var(--xiaohei-motion-base) ease;
}

#root button[aria-label='发送消息']::after,
#root button[aria-label='Send message']::after {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid rgb(238 253 255 / 28%);
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.58;
  transition: opacity var(--xiaohei-motion-fast) ease, transform 220ms var(--xiaohei-motion-curve);
}

#root button[aria-label='发送消息']:not(:disabled):hover,
#root button[aria-label='Send message']:not(:disabled):hover {
  filter: brightness(1.05) saturate(1.03);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 42%),
    inset 0 -2px rgb(4 25 31 / 16%),
    0 8px 20px var(--xiaohei-focus-shadow) !important;
}

#root button[aria-label='发送消息']:not(:disabled):active,
#root button[aria-label='Send message']:not(:disabled):active {
  transform: translateY(1px) scale(0.96);
}

#root button[aria-label='发送消息']:not(:disabled):active::after,
#root button[aria-label='Send message']:not(:disabled):active::after {
  opacity: 0.86;
  transform: scale(0.76);
}

#root button[aria-label='发送消息']:disabled,
#root button[aria-label='Send message']:disabled {
  border-color: var(--xiaohei-edge) !important;
  color: var(--dsw-alias-label-dimmed) !important;
  background: var(--xiaohei-surface-muted) !important;
  filter: saturate(0.42);
  box-shadow: inset 0 1px rgb(255 255 255 / 8%) !important;
}

#root button[aria-label='发送消息']:disabled::after,
#root button[aria-label='Send message']:disabled::after {
  opacity: 0.12;
}
`
