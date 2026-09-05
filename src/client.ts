import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { apply as applyTheme } from './plugin.js'

export { inject } from './plugin.js'

/** Renderer-free wallpaper and native DSH chrome, mounted through plugin lifecycle. */
export function apply(ctx: ClientContext): void {
  applyTheme(ctx)
}
export { bindXiaoheiAppearance, XIAOHEI_APPEARANCE_ATTRIBUTE } from './appearance.js'
export {
  installXiaoheiChrome,
  XIAOHEI_CHROME_CSS,
  XIAOHEI_CHROME_STYLE_ID,
} from './chrome.js'
export { XIAOHEI_WORKSPACE_CSS } from './chrome/workspace.js'
export {
  configureXiaoheiWorldRenderer,
  XIAOHEI_SCENE_CSS,
  XIAOHEI_SCENE_LAYER_ID,
  XIAOHEI_SCENE_PART_COUNT,
  XIAOHEI_SCENE_STYLE_ID,
  XIAOHEI_SCENE_WORLD_CLASS,
  installXiaoheiScene,
} from './scene.js'
export {
  XIAOHEI_DAWN_THEME,
  XIAOHEI_DAWN_THEME_ID,
  XIAOHEI_NIGHT_THEME,
  XIAOHEI_NIGHT_THEME_ID,
  XIAOHEI_THEME_TOKEN_OVERRIDES,
} from './theme.js'
