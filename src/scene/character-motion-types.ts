export interface CharacterMotionPatch {
  readonly src: string
  readonly box: readonly [number, number, number, number]
  readonly size: readonly [number, number]
  readonly frames: number
  readonly interval: number
}
export type CharacterMotionClips = Readonly<Record<string, CharacterMotionPatch>>
export type CharacterMotionCatalog = Readonly<Record<string, Readonly<Record<'light' | 'dark', CharacterMotionClips>>>>
