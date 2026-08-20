/** Visual geometry for Xiaohei's idle gaze. Behavior lives in ../gaze.ts. */
export const XIAOHEI_GAZE_CSS = `
.xiaohei-scene__mascot-blink {
  z-index: 3;
}

.xiaohei-gaze {
  --xiaohei-gaze-x: 0px;
  --xiaohei-gaze-y: 0px;
  position: absolute;
  inset: 0;
  z-index: 2;
  display: block;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  transition: opacity 80ms ease-out;
}

html[data-xiaohei-state='idle'] .xiaohei-gaze {
  opacity: 1;
}

/* The complete blink frame owns eye occlusion; a second visibility clock can expose pupil-free frames. */

.xiaohei-gaze__base {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: contain;
  filter: brightness(1.32) contrast(1.02) saturate(1.04);
}

html[data-xiaohei-appearance='light'] .xiaohei-gaze__base {
  filter: brightness(1.02) contrast(1.07) saturate(0.9);
}

.xiaohei-gaze__pupil {
  position: absolute;
  display: block;
  width: 5.15%;
  height: 9.25%;
  border-radius: 48% 52% 49% 51%;
  background:
    radial-gradient(circle at 39% 27%, #F3F7F3 0 12%, transparent 15%),
    #020505;
  transform: translate3d(
    calc(-50% + var(--xiaohei-gaze-x)),
    calc(-50% + var(--xiaohei-gaze-y)),
    0
  );
  transform-origin: 50% 50%;
}

.xiaohei-gaze[data-moving='true'] .xiaohei-gaze__pupil {
  will-change: transform;
}

.xiaohei-gaze__pupil--left {
  left: 27.15%;
  top: 41.05%;
}

.xiaohei-gaze__pupil--right {
  left: 42.75%;
  top: 42.2%;
  width: 5.35%;
  height: 9.45%;
}

@media (prefers-reduced-motion: reduce), (hover: none) and (pointer: coarse) {
  .xiaohei-gaze {
    display: none;
  }
}
`
