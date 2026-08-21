/**
 * Animated spirit vortex that gives Xiaohei a visible standing ground.
 *
 * The scene owns a single aura node. Its two compositor-only pseudo-elements
 * turn that node into counter-rotating currents without decorative DOM growth.
 */
export const XIAOHEI_SPIRIT_STREAM_CSS = `
.xiaohei-scene__aura {
  --xiaohei-stream-bright: rgb(190 255 242 / 100%);
  --xiaohei-stream-mid: rgb(99 248 220 / 92%);
  --xiaohei-stream-faint: rgb(77 218 196 / 30%);
  right: clamp(0.5rem, 1.5vw, 2rem);
  bottom: 1.2rem;
  width: clamp(22rem, 32vw, 31rem);
  aspect-ratio: 2.55;
  overflow: hidden;
  isolation: isolate;
  border-radius: 50%;
  background:
    radial-gradient(ellipse at 50% 50%, transparent 0 42%, var(--xiaohei-stream-faint) 45%, var(--xiaohei-stream-mid) 47%, transparent 51%),
    radial-gradient(ellipse at 50% 50%, rgb(126 238 218 / 46%) 0%, rgb(65 177 163 / 22%) 32%, transparent 70%);
  mix-blend-mode: normal;
  opacity: 0.96;
  transform: scale(0.97);
  will-change: transform, opacity;
  animation: xiaohei-spirit-stream-field 8.4s cubic-bezier(0.37, 0, 0.63, 1) infinite alternate;
}

.xiaohei-scene__aura::before,
.xiaohei-scene__aura::after {
  content: '';
  position: absolute;
  display: block;
  inset: 0;
  border-radius: 50%;
  transform-origin: 50% 50%;
  will-change: transform, opacity;
}

.xiaohei-scene__aura::before {
  background: conic-gradient(
    from 12deg at 50% 50%,
    transparent 0deg 28deg,
    var(--xiaohei-stream-faint) 36deg,
    var(--xiaohei-stream-bright) 48deg,
    var(--xiaohei-stream-mid) 55deg,
    transparent 64deg 142deg,
    var(--xiaohei-stream-faint) 150deg,
    var(--xiaohei-stream-bright) 162deg,
    transparent 175deg 250deg,
    var(--xiaohei-stream-faint) 258deg,
    var(--xiaohei-stream-mid) 268deg,
    transparent 280deg 360deg
  );
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, transparent 0 42%, black 45% 51%, transparent 54%);
  mask-image: radial-gradient(ellipse at 50% 50%, transparent 0 42%, black 45% 51%, transparent 54%);
  filter: blur(0.35px) drop-shadow(0 0 0.6rem rgb(97 239 213 / 56%));
  animation: xiaohei-spirit-stream-near 14s linear infinite;
}

.xiaohei-scene__aura::after {
  inset: 12% 9%;
  background: conic-gradient(
    from 208deg at 50% 50%,
    transparent 0deg 52deg,
    var(--xiaohei-stream-faint) 61deg,
    var(--xiaohei-stream-bright) 74deg,
    transparent 88deg 184deg,
    var(--xiaohei-stream-faint) 194deg,
    var(--xiaohei-stream-mid) 207deg,
    transparent 221deg 304deg,
    var(--xiaohei-stream-faint) 314deg,
    var(--xiaohei-stream-bright) 326deg,
    transparent 340deg 360deg
  );
  -webkit-mask-image: radial-gradient(ellipse at 50% 50%, transparent 0 41%, black 45% 52%, transparent 55%);
  mask-image: radial-gradient(ellipse at 50% 50%, transparent 0 41%, black 45% 52%, transparent 55%);
  filter: blur(0.35px) drop-shadow(0 0 0.48rem rgb(83 218 193 / 44%));
  animation: xiaohei-spirit-stream-far 19s linear infinite;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__aura {
  --xiaohei-stream-bright: rgb(10 105 88 / 98%);
  --xiaohei-stream-mid: rgb(30 132 110 / 92%);
  --xiaohei-stream-faint: rgb(35 119 101 / 36%);
  background:
    radial-gradient(ellipse at 50% 50%, transparent 0 42%, var(--xiaohei-stream-faint) 45%, var(--xiaohei-stream-mid) 47%, transparent 51%),
    radial-gradient(ellipse at 50% 50%, rgb(47 139 116 / 22%) 0%, rgb(65 139 118 / 12%) 34%, transparent 72%);
  mix-blend-mode: normal;
  opacity: 0.88;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__aura::before {
  filter: blur(0.35px) saturate(1.08) contrast(1.04) drop-shadow(0 0 0.38rem rgb(38 139 117 / 28%));
  opacity: 1;
}

html[data-xiaohei-appearance='light'] .xiaohei-scene__aura::after {
  filter: blur(0.35px) saturate(1.06) contrast(1.03) drop-shadow(0 0 0.3rem rgb(38 139 117 / 24%));
  opacity: 0.92;
}

@keyframes xiaohei-spirit-stream-field {
  from { transform: scale(0.96); }
  to { transform: scale(1.025); }
}

@keyframes xiaohei-spirit-stream-near {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes xiaohei-spirit-stream-far {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}

@media (max-width: 768px) {
  .xiaohei-scene__aura {
    right: -3rem;
    bottom: 4.4rem;
    width: 23rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .xiaohei-scene__aura,
  .xiaohei-scene__aura::before,
  .xiaohei-scene__aura::after {
    animation: none;
    will-change: auto;
  }
}

@media (update: slow) {
  .xiaohei-scene__aura::before,
  .xiaohei-scene__aura::after {
    animation: none;
    will-change: auto;
  }
}
`
