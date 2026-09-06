export type Point = readonly [number, number]
export interface CharacterLayer {
  readonly src: string
  readonly box: readonly [number, number, number, number]
}
export interface CharacterRig {
  readonly layers: Readonly<Record<string, CharacterLayer>>
  readonly ears: readonly Point[]
  readonly size: Point
}
export type CharacterMotionCatalog = Readonly<Record<string, Readonly<Record<'light' | 'dark', CharacterRig>>>>
