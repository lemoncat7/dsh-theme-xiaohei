/** Public scene facade. Runtime structure and visual styling evolve independently. */
export {
  XIAOHEI_SCENE_CSS,
  XIAOHEI_SCENE_LAYER_ID,
  XIAOHEI_SCENE_STYLE_ID,
  XIAOHEI_SCENE_WORLD_CLASS,
} from './scene/styles.js'

export {
  configureXiaoheiWorldRenderer,
  installXiaoheiScene,
  shouldRestoreXiaoheiHeixiuCompanions,
  XIAOHEI_SCENE_PART_COUNT,
} from './scene/runtime.js'

export {
  injectXiaoheiSylvaPointerBridge,
  prepareXiaoheiSylvaPointerFrame,
  resolveXiaoheiSylvaPointer,
  XIAOHEI_SYLVA_POINTER_CHANNEL,
  XIAOHEI_SYLVA_POINTER_MARKER,
} from './scene/pointer-bridge.js'
