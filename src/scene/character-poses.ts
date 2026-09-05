import {
  XIAOHEI_SEATED_LIGHT, XIAOHEI_SEATED_DARK, XIAOHEI_PEEK_LIGHT, XIAOHEI_PEEK_DARK,
  XIAOHEI_CHIN_LIGHT, XIAOHEI_CHIN_DARK, XIAOHEI_DOZE_LIGHT, XIAOHEI_DOZE_DARK,
  XIAOHEI_HALFPEEK_LIGHT, XIAOHEI_HALFPEEK_DARK,
} from '../generated-backgrounds.js'

/** Shared catalog: runtime preloading and CSS must always use the same assets. */
export const CHARACTER_POSES = {
  seated: { light: XIAOHEI_SEATED_LIGHT, dark: XIAOHEI_SEATED_DARK },
  chin: { light: XIAOHEI_CHIN_LIGHT, dark: XIAOHEI_CHIN_DARK },
  doze: { light: XIAOHEI_DOZE_LIGHT, dark: XIAOHEI_DOZE_DARK },
  peek: { light: XIAOHEI_PEEK_LIGHT, dark: XIAOHEI_PEEK_DARK },
  halfpeek: { light: XIAOHEI_HALFPEEK_LIGHT, dark: XIAOHEI_HALFPEEK_DARK },
} as const
export type CharacterPose = keyof typeof CHARACTER_POSES
export const CHARACTER_POSE_NAMES = Object.keys(CHARACTER_POSES) as CharacterPose[]
