/** Composer, send action, and command affordances. */
export const XIAOHEI_CONTROL_CSS = `
/* The composer uses two quiet edge planes instead of a decorative outer ring. */
#root [data-composer-card='true'] {
  position: relative;
  isolation: isolate;
  border: 1px solid var(--xiaohei-chrome-edge) !important;
  border-radius: 16px !important;
  background:
    radial-gradient(circle at 100% 0%, var(--xiaohei-chrome-accent-soft), transparent 24%),
    var(--dsw-specific-input-major) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 5%),
    inset 0 -1px rgb(101 209 190 / 4%),
    0 14px 36px var(--xiaohei-chrome-shadow) !important;
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

#root [data-composer-card='true']::before,
#root [data-composer-card='true']::after {
  content: '';
  position: absolute;
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  transition: opacity 180ms ease;
}

#root [data-composer-card='true']::before {
  inset: -1px;
  padding: 1px;
  background: linear-gradient(
    112deg,
    transparent 0 38%,
    var(--xiaohei-chrome-edge-strong) 52%,
    transparent 67%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.28;
}

#root [data-composer-card='true']::after {
  inset: 3px;
  border-top: 1px solid rgb(236 255 250 / 7%);
  border-right: 1px solid rgb(139 229 213 / 5%);
  opacity: 0.62;
}

#root [data-composer-card='true']:focus-within {
  border-color: var(--xiaohei-chrome-edge-strong) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 7%),
    0 16px 38px var(--xiaohei-chrome-shadow) !important;
}

#root [data-composer-card='true']:focus-within::before { opacity: 0.72; }
#root [data-composer-card='true']:focus-within::after { opacity: 1; }

/* Send is a two-plane domain core that contracts once when activated. */
#root button[aria-label='发送消息'],
#root button[aria-label='Send message'] {
  position: relative;
  isolation: isolate;
  border: 1px solid var(--xiaohei-chrome-edge-strong) !important;
  background:
    radial-gradient(circle at 34% 28%, rgb(236 255 250 / 48%) 0 8%, transparent 10%),
    linear-gradient(145deg, var(--xiaohei-chrome-accent-strong), var(--dsw-alias-button-primary-fill)) !important;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 34%),
    inset 0 -2px rgb(5 34 29 / 18%),
    0 5px 14px var(--xiaohei-chrome-focus-shadow) !important;
  transition: transform 160ms ease, box-shadow 180ms ease, filter 180ms ease;
}

#root button[aria-label='发送消息']::before,
#root button[aria-label='Send message']::before {
  content: '';
  position: absolute;
  inset: -5px;
  padding: 2px;
  border-radius: inherit;
  pointer-events: none;
  background: rgb(101 209 190 / 22%);
  -webkit-backdrop-filter: blur(2px) saturate(145%) contrast(1.08);
  backdrop-filter: blur(2px) saturate(145%) contrast(1.08);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.16;
  transform: scale(0.9);
  transition: opacity 180ms ease, transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
}

#root button[aria-label='发送消息']::after,
#root button[aria-label='Send message']::after {
  content: '';
  position: absolute;
  inset: 3px;
  border: 1px solid rgb(236 255 250 / 28%);
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.56;
  transform: scale(1);
  transition: opacity 160ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1);
}

#root button[aria-label='发送消息']:not(:disabled):hover,
#root button[aria-label='Send message']:not(:disabled):hover {
  filter: brightness(1.07) saturate(1.04);
  box-shadow:
    inset 0 1px rgb(255 255 255 / 42%),
    inset 0 -2px rgb(5 34 29 / 16%),
    0 7px 18px var(--xiaohei-chrome-focus-shadow) !important;
}

#root button[aria-label='发送消息']:not(:disabled):hover::before,
#root button[aria-label='Send message']:not(:disabled):hover::before {
  opacity: 0.68;
  transform: scale(1.04);
}

#root button[aria-label='发送消息']:not(:disabled):active,
#root button[aria-label='Send message']:not(:disabled):active {
  filter: brightness(0.98) saturate(1.06);
}

#root button[aria-label='发送消息']:not(:disabled):active::before,
#root button[aria-label='Send message']:not(:disabled):active::before {
  opacity: 0.82;
  transform: scale(0.76);
}

#root button[aria-label='发送消息']:not(:disabled):active::after,
#root button[aria-label='Send message']:not(:disabled):active::after {
  opacity: 0.84;
  transform: scale(0.72);
}

#root button[aria-label='发送消息']:disabled,
#root button[aria-label='Send message']:disabled {
  border-color: var(--xiaohei-chrome-edge) !important;
  filter: saturate(0.45);
  box-shadow: inset 0 1px rgb(255 255 255 / 8%) !important;
}

#root button[aria-label='发送消息']:disabled::before,
#root button[aria-label='Send message']:disabled::before {
  opacity: 0.06;
}

#root button[aria-label='命令'],
#root button[aria-label='Commands'] {
  border: 1px solid transparent;
  box-shadow: inset 0 0 0 1px transparent;
  transition: color 180ms ease, background-color 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

#root button[aria-label='命令']:not(:disabled):hover,
#root button[aria-label='Commands']:not(:disabled):hover {
  color: var(--xiaohei-chrome-accent-strong);
  border-color: var(--xiaohei-chrome-edge);
  background: var(--xiaohei-chrome-accent-soft);
  box-shadow: inset 0 1px rgb(255 255 255 / 6%);
}

`
