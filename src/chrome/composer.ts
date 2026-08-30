/** Conversation composer expressed as Xiaohei's quiet spatial workbench. */
export const XIAOHEI_COMPOSER_CSS = `
#root [data-composer-card='true'] {
  position: relative;
  isolation: isolate;
  overflow: visible;
  gap: 10px;
  padding-top: 12px;
  border: 1px solid var(--xiaohei-composer-edge) !important;
  border-radius: 14px !important;
  background: var(--xiaohei-composer-fill) !important;
  -webkit-backdrop-filter:
    blur(var(--xiaohei-composer-blur))
    saturate(var(--xiaohei-composer-saturation));
  backdrop-filter:
    blur(var(--xiaohei-composer-blur))
    saturate(var(--xiaohei-composer-saturation));
  box-shadow:
    0 10px 28px var(--xiaohei-composer-shadow),
    0 2px 8px var(--xiaohei-shadow) !important;
  transition:
    border-color var(--xiaohei-motion-base) ease,
    box-shadow 260ms ease,
    background-color var(--xiaohei-motion-base) ease;
}

/* The lower contour behaves like Xiaohei's tail. Workspace-pick mode is
   excluded so the Host keeps ownership of its native dashed affordance. */
#root [data-composer-card='true']:not(:has(textarea[aria-haspopup='menu']))::after {
  content: '';
  position: absolute;
  z-index: 2;
  right: 58px;
  bottom: -1px;
  left: 18px;
  height: 11px;
  border-bottom: 2px solid var(--xiaohei-composer-tail);
  border-radius: 0 0 76% 34%;
  pointer-events: none;
  opacity: 0.32;
  transform: scaleX(.48) translateZ(0);
  transform-origin: right center;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent);
  transition:
    opacity 240ms ease,
    transform 360ms var(--xiaohei-motion-curve);
}

#root [data-composer-card='true']:not(:has(textarea[aria-haspopup='menu'])):focus-within::after {
  opacity: 0.74;
  transform: scaleX(1) translateZ(0);
}

#root [data-composer-card='true']:not(:has(textarea[aria-haspopup='menu'])):has(textarea:not(:placeholder-shown))::after {
  opacity: 0.88;
  transform: scaleX(.92) translateZ(0);
}

#root [data-composer-card='true'] textarea {
  -webkit-appearance: none;
  appearance: none;
  border: 0 !important;
  border-radius: 0 !important;
  color: var(--dsw-alias-label-primary) !important;
  background: transparent !important;
  caret-color: var(--xiaohei-spirit-strong);
  box-shadow: none !important;
}

#root [data-composer-card='true'] textarea:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

#root [data-composer-card='true'] textarea::placeholder {
  color: var(--dsw-alias-label-tertiary) !important;
  opacity: 0.84;
}

#root [data-composer-card='true'] [data-input-backdrop='true'] {
  border-color: transparent !important;
  background: transparent !important;
}

#root [data-composer-card='true'] button {
  min-width: 30px;
  min-height: 30px;
  border: 1px solid transparent;
  border-radius: 9px;
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease,
    box-shadow var(--xiaohei-motion-fast) ease,
    transform var(--xiaohei-motion-fast) var(--xiaohei-motion-curve);
}

#root [data-composer-card='true'] button:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
  border-color: var(--xiaohei-composer-control-edge);
  background: var(--xiaohei-composer-control-hover);
  box-shadow: inset 0 1px 0 var(--xiaohei-composer-highlight);
}

#root [data-composer-card='true'] button:not(:disabled):active {
  transform: translateY(1px) scale(.97);
}

@media (max-width: 700px) {
  #root [data-composer-card='true'] {
    border-radius: 12px !important;
  }

  #root [data-composer-card='true']:not(:has(textarea[aria-haspopup='menu']))::after {
    right: 54px;
    left: 14px;
  }
}

@media (prefers-reduced-transparency: reduce) {
  #root [data-composer-card='true'] {
    background: var(--xiaohei-composer-solid) !important;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  #root [data-composer-card='true'] {
    background: var(--xiaohei-composer-solid) !important;
  }
}
`
