import {
  XIAOHEI_WALLPAPER_LIGHT,
  XIAOHEI_WALLPAPER_DARK,
} from '../generated-backgrounds.js'
import { XIAOHEI_SCENE_LAYER_ID, XIAOHEI_SCENE_WORLD_CLASS } from './ids.js'
export { XIAOHEI_SCENE_STYLE_ID, XIAOHEI_SCENE_LAYER_ID, XIAOHEI_SCENE_WORLD_CLASS } from './ids.js'

/** Stable scene and material ids, shared with lifecycle and browser checks. */

/** Static paired wallpapers; no per-frame effects or session-state dependency. */
export const XIAOHEI_SCENE_CSS = `
body {
  background: #151C26;
}

html[data-xiaohei-appearance='light'] body {
  background: #D4D5D5;
}

#root {
  position: relative;
  z-index: 1;
}

[id='${XIAOHEI_SCENE_LAYER_ID}'] {
  position: fixed;
  inset: 0;
  /* The decorative canvas uses the large viewport, not the keyboard-reduced
   * visual viewport. The host UI is still free to resize above it. */
  height: 100vh;
  height: 100lvh;
  container: xiaohei-wallpaper / size;
  z-index: 0;
  overflow: hidden;
  contain: strict;
  isolation: isolate;
  pointer-events: none;
  user-select: none;
  background: #151C26;
}

html[data-xiaohei-appearance='light'] [id='${XIAOHEI_SCENE_LAYER_ID}'] {
  background: #D4D5D5;
}

.${XIAOHEI_SCENE_WORLD_CLASS} {
  --xiaohei-wallpaper-wide: url("${XIAOHEI_WALLPAPER_DARK}");
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
  pointer-events: none;
  background-image: var(--xiaohei-wallpaper-wide);
  background-size: cover;
  background-position: right center;
  background-repeat: no-repeat;
}

html[data-xiaohei-appearance='light'] .${XIAOHEI_SCENE_WORLD_CLASS} {
  --xiaohei-wallpaper-wide: url("${XIAOHEI_WALLPAPER_LIGHT}");
}

.${XIAOHEI_SCENE_WORLD_CLASS} > * {
  width: 100%;
  height: 100%;
}

@media (forced-colors: active), print {
  [id='${XIAOHEI_SCENE_LAYER_ID}'] {
    display: none;
  }
}
`
