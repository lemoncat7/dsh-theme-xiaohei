/** Public scene facade. Runtime structure and visual styling evolve independently. */
export {
  XIAOHEI_SCENE_CSS,
  XIAOHEI_SCENE_LAYER_ID,
  XIAOHEI_SCENE_STYLE_ID,
} from './scene/styles.js'

export {
  installXiaoheiScene,
  shouldRestoreXiaoheiHeixiuCompanions,
  XIAOHEI_SCENE_PART_COUNT,
} from './scene/runtime.js'
