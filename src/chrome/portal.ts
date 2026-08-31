/**
 * Two compact voids and one travelling Heixiu. The portals are matte spatial
 * gaps rather than rings; all keyframes stay on compositor-safe properties.
 */
export const XIAOHEI_PORTAL_CSS = `
#dsh-theme-xiaohei\\/portal-layer {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
  contain: strict;
  pointer-events: none;
  user-select: none;
}

#dsh-theme-xiaohei\\/portal-layer > * {
  position: absolute;
  display: block;
  pointer-events: none;
}

.xiaohei-portal__void {
  width: clamp(2.8rem, 3.6vw, 4rem);
  aspect-ratio: 0.76;
  border-radius: 48% 52% 46% 54% / 52% 46% 54% 48%;
  opacity: 0;
  background:
    radial-gradient(ellipse at 46% 48%, #010304 0%, #020609 58%, #092027 72%, rgb(66 188 170 / 36%) 78%, transparent 82%);
  box-shadow:
    inset 0 0 0.7rem rgb(0 0 0 / 92%),
    0 0 0.85rem rgb(78 214 191 / 18%);
  will-change: transform, opacity;
}

.xiaohei-portal__void::after {
  position: absolute;
  inset: 13% 18%;
  display: block;
  content: '';
  border-radius: inherit;
  background: #000102;
  box-shadow: inset 0.18rem 0 0.45rem rgb(16 56 64 / 42%);
}

.xiaohei-portal__void--entry {
  left: var(--portal-entry-x);
  top: var(--portal-entry-y);
  transform: translate3d(-50%, -50%, 0) rotate(var(--portal-entry-angle)) scale3d(0.04, 0.12, 1);
}

.xiaohei-portal__void--exit {
  left: var(--portal-exit-x);
  top: var(--portal-exit-y);
  transform: translate3d(-50%, -50%, 0) rotate(var(--portal-exit-angle)) scale3d(0.04, 0.12, 1);
}

.xiaohei-portal__traveler {
  left: var(--portal-entry-x);
  top: var(--portal-entry-y);
  z-index: 1;
  width: clamp(2.7rem, 3.4vw, 3.7rem);
  aspect-ratio: 1;
  opacity: 0;
  transform: translate3d(-5rem, -50%, 0) scale(0.9);
  filter:
    drop-shadow(0 0.25rem 0.45rem rgb(90 221 199 / 20%))
    drop-shadow(0 0.58rem 0.9rem rgb(1 9 10 / 22%));
  will-change: transform, opacity;
}

.xiaohei-portal__traveler > img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: contain;
  filter: brightness(1.1) contrast(1.05) saturate(0.82);
}

.xiaohei-portal__traveler-blink { opacity: 0; }

#dsh-theme-xiaohei\\/portal-layer[data-running='true'] .xiaohei-portal__void--entry {
  animation: xiaohei-portal-entry 2.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

#dsh-theme-xiaohei\\/portal-layer[data-running='true'] .xiaohei-portal__void--exit {
  animation: xiaohei-portal-exit 2.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

#dsh-theme-xiaohei\\/portal-layer[data-running='true'] .xiaohei-portal__traveler {
  animation: xiaohei-portal-traveler 2.6s cubic-bezier(0.45, 0, 0.25, 1) both;
}

#dsh-theme-xiaohei\\/portal-layer[data-running='true'] .xiaohei-portal__traveler-open {
  animation: xiaohei-portal-eyes-open 2.6s step-end both;
}

#dsh-theme-xiaohei\\/portal-layer[data-running='true'] .xiaohei-portal__traveler-blink {
  animation: xiaohei-portal-eyes-blink 2.6s step-end both;
}

@keyframes xiaohei-portal-entry {
  0% { transform: translate3d(-50%, -50%, 0) rotate(var(--portal-entry-angle)) scale3d(0.04, 0.12, 1); opacity: 0; }
  10%, 55% { transform: translate3d(-50%, -50%, 0) rotate(var(--portal-entry-angle)) scale3d(1, 1, 1); opacity: 0.96; }
  68%, 100% { transform: translate3d(-50%, -50%, 0) rotate(var(--portal-entry-angle)) scale3d(0.04, 0.12, 1); opacity: 0; }
}

@keyframes xiaohei-portal-exit {
  0%, 40% { transform: translate3d(-50%, -50%, 0) rotate(var(--portal-exit-angle)) scale3d(0.04, 0.12, 1); opacity: 0; }
  51%, 86% { transform: translate3d(-50%, -50%, 0) rotate(var(--portal-exit-angle)) scale3d(1, 1, 1); opacity: 0.96; }
  100% { transform: translate3d(-50%, -50%, 0) rotate(var(--portal-exit-angle)) scale3d(0.04, 0.12, 1); opacity: 0; }
}

@keyframes xiaohei-portal-traveler {
  0% { transform: translate3d(-5rem, -50%, 0) scale(0.88); opacity: 0; }
  9% { transform: translate3d(-4rem, -50%, 0) scale(0.92); opacity: 0.82; }
  29% { transform: translate3d(-1rem, -50%, 0) scale(0.92); opacity: 1; }
  43% { transform: translate3d(0, -50%, 0) scale(0.12); opacity: 0; }
  50% { transform: translate3d(var(--portal-travel-x), var(--portal-travel-y), 0) scale(0.12); opacity: 0; }
  59% { transform: translate3d(var(--portal-travel-x), var(--portal-travel-y), 0) scale(0.16); opacity: 0; }
  70% { transform: translate3d(calc(var(--portal-travel-x) + var(--portal-emerge-near)), var(--portal-travel-y), 0) scale(0.94); opacity: 1; }
  90% { transform: translate3d(calc(var(--portal-travel-x) + var(--portal-emerge-far)), var(--portal-travel-y), 0) scale(0.92); opacity: 0.9; }
  100% { transform: translate3d(calc(var(--portal-travel-x) + var(--portal-emerge-end)), var(--portal-travel-y), 0) scale(0.9); opacity: 0; }
}

@keyframes xiaohei-portal-eyes-open {
  0%, 20.9% { opacity: 1; transform: translate3d(0, 0, 0); }
  21%, 23.5% { opacity: 0; transform: translate3d(0, 0, 0); }
  23.6%, 75.9% { opacity: 1; transform: translate3d(0, 0, 0); }
  76%, 78.5% { opacity: 0; transform: translate3d(0, 0, 0); }
  78.6%, 100% { opacity: 1; transform: translate3d(0, 0, 0); }
}

@keyframes xiaohei-portal-eyes-blink {
  0%, 20.9% { opacity: 0; transform: translate3d(0, 0, 0); }
  21%, 23.5% { opacity: 1; transform: translate3d(0, 0, 0); }
  23.6%, 75.9% { opacity: 0; transform: translate3d(0, 0, 0); }
  76%, 78.5% { opacity: 1; transform: translate3d(0, 0, 0); }
  78.6%, 100% { opacity: 0; transform: translate3d(0, 0, 0); }
}

html[data-xiaohei-appearance='light'] .xiaohei-portal__void {
  box-shadow:
    inset 0 0 0.7rem rgb(0 0 0 / 94%),
    0 0 0.75rem rgb(47 125 108 / 22%);
}

html[data-xiaohei-appearance='light'] .xiaohei-portal__traveler {
  filter:
    drop-shadow(0 0.25rem 0.4rem rgb(48 96 81 / 16%))
    drop-shadow(0 0.55rem 0.8rem rgb(43 61 54 / 12%));
}

html[data-xiaohei-appearance='light'] .xiaohei-portal__traveler > img {
  filter: brightness(1.01) contrast(1.06) saturate(0.76);
}

@media (max-width: 768px) {
  #dsh-theme-xiaohei\\/portal-layer { display: none; }
}

@media (prefers-reduced-motion: reduce), (forced-colors: active), print {
  #dsh-theme-xiaohei\\/portal-layer { display: none; }
}
`
