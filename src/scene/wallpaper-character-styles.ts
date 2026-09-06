import { CHARACTER_POSES, CHARACTER_POSE_NAMES } from './character-poses.js'

/** Complete raster poses remain crisp; only entry/exit opacity and transform move. */
export const XIAOHEI_WALLPAPER_CHARACTER_CSS = `
.xiaohei-wallpaper-character {
  ${CHARACTER_POSE_NAMES.map(pose => `--xiaohei-${pose}-art: url("${CHARACTER_POSES[pose].dark}");`).join('\n  ')}
  position: absolute;
  inset: 0;
  pointer-events: none;
  user-select: none;
}
html[data-xiaohei-appearance='light'] .xiaohei-wallpaper-character {
  ${CHARACTER_POSE_NAMES.map(pose => `--xiaohei-${pose}-art: url("${CHARACTER_POSES[pose].light}");`).join('\n  ')}
}
.xiaohei-wallpaper-character > span {
  position: absolute;
  display: block;
  background-size: contain;
  background-position: left center;
  background-repeat: no-repeat;
  pointer-events: none;
  opacity: 0;
  transition: opacity 220ms ease, transform 220ms cubic-bezier(.2,.8,.2,1);
}
.xiaohei-wallpaper-character .xiaohei-character-motion {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: contain; object-position: left center; pointer-events: none;
}
.xiaohei-wallpaper-character > span[data-motion]:not([data-motion='rest']) {
  background-image: none;
}
${CHARACTER_POSE_NAMES.map(pose => `
.xiaohei-wallpaper-character__${pose}[data-ready] {
  background-image: var(--xiaohei-${pose}-art);
}`).join('\n')}
.xiaohei-wallpaper-character__peek,
.xiaohei-wallpaper-character__halfpeek {
  transform: translateX(4px);
}
${CHARACTER_POSE_NAMES.map(pose => `.xiaohei-wallpaper-character[data-pose='${pose}'] > .xiaohei-wallpaper-character__${pose}`).join(',\n')} {
  opacity: 1;
  transform: none;
}
.xiaohei-wallpaper-character[data-pose='hidden'] > span {
  transition: none;
}
@media (prefers-reduced-motion: reduce) {
  .xiaohei-wallpaper-character > span { transition: none; transform: none; }
}
`
