import type { CharacterRig } from './character-motion-types.js'

export const CHARACTER_POSE_NAMES = ['seated', 'peek', 'chin', 'doze', 'halfpeek'] as const
export type CharacterPose = typeof CHARACTER_POSE_NAMES[number]
export type CharacterAppearance = 'light' | 'dark'
declare const require: { async(path: string): Promise<unknown> }

export function createCharacterAssetLoader(importChunk: (path: string) => Promise<unknown>) {
  const cache = new Map<string, Promise<unknown>>()
  function load(path: string): Promise<unknown> {
    let promise = cache.get(path)
    if (!promise) {
      promise = Promise.resolve().then(() => importChunk(path)).catch(error => { cache.delete(path); throw error })
      cache.set(path, promise)
    }
    return promise
  }
  return {
    async pose(pose: CharacterPose, appearance: CharacterAppearance): Promise<string> {
      const module = await load(`./client.pose-${pose}-${appearance}.js`) as { image: string }
      return module.image
    },
    async rig(pose: string, appearance: CharacterAppearance): Promise<CharacterRig | undefined> {
      if (pose === 'doze' || !CHARACTER_POSE_NAMES.includes(pose as CharacterPose)) return undefined
      const module = await load(`./client.rig-${pose}-${appearance}.js`) as { rig: CharacterRig }
      return module.rig
    },
  }
}
export const characterAssets = createCharacterAssetLoader(path => require.async(path))
