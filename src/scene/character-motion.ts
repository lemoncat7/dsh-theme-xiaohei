import { CHARACTER_MOTION } from '../generated-character-motion.js'
import { createCharacterMotionClock } from './character-motion-clock.js'
import { CHARACTER_POSES, type CharacterPose } from './character-poses.js'
import type { CharacterMotionClips as Clips } from './character-motion-types.js'

/** A single transparent patch canvas follows the active, already placed pose.
 * Failed or undecoded patches leave the original illustration visible.
 */
export function createCharacterMotion(doc: Document) {
  const win = doc.defaultView!
  const reduced = win.matchMedia('(prefers-reduced-motion: reduce)')
  const images = new Map<string, HTMLImageElement | null>()
  const loading = new Map<string, Promise<void>>()
  let disposed = false, part: HTMLElement | undefined, clips: Clips | undefined
  let canvas: HTMLCanvasElement | undefined
  let pose = '', appearance = '', baseSource = '', revision = 0
  function decode(src: string): Promise<void> {
    if (loading.has(src)) return loading.get(src)!
    if (images.has(src)) return Promise.resolve()
    images.set(src, null)
    const image = new win.Image(); image.src = src
    const pending = image.decode().then(() => { if (!disposed) images.set(src, image) }, () => {})
      .finally(() => loading.delete(src))
    loading.set(src, pending)
    return pending
  }
  const clock = createCharacterMotionClock(win, (action, frame) => {
    if (!canvas || !clips || !part) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    part.dataset.motion = 'rest'
    if (!action) return
    const patch = clips[action]!, image = images.get(patch.src), base = images.get(baseSource)
    if (!image || !base) return
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height)
    const [x = 0, y = 0, right = 0, bottom = 0] = patch.box
    ctx.clearRect(x, y, right-x, bottom-y)
    ctx.drawImage(image, frame * (right-x), 0, right-x, bottom-y, x, y, right-x, bottom-y)
    part.dataset.motion = action
  })
  function update() {
    if (disposed) return
    const nextAppearance = doc.documentElement.dataset.xiaoheiAppearance === 'light' ? 'light' : 'dark'
    const enabled = !doc.hidden && !reduced.matches && part && pose in CHARACTER_MOTION
    const next = enabled ? CHARACTER_MOTION[pose]![nextAppearance] : undefined
    if (next === clips && appearance === nextAppearance) return
    clock.setClips(undefined)
    const current = ++revision
    canvas?.remove(); canvas = undefined
    clips = next; appearance = nextAppearance
    if (!next || !part) return
    const sample = Object.values(next)[0]!
    canvas = doc.createElement('canvas')
    canvas.className = 'xiaohei-character-motion'
    canvas.width = sample.size[0]; canvas.height = sample.size[1]
    part.append(canvas)
    baseSource = CHARACTER_POSES[pose as CharacterPose][nextAppearance]
    void Promise.all([baseSource, ...Object.values(next).map(patch => patch.src)].map(decode)).then(() => {
      if (disposed || current !== revision || !images.get(baseSource)) return
      const available = Object.fromEntries(Object.entries(next).filter(([,patch]) => images.get(patch.src)))
      if (Object.keys(available).length) clock.setClips(available)
    })
  }
  reduced.addEventListener('change', update)
  // Do not wait for the layout RAF: browsers suspend it in hidden tabs.
  doc.addEventListener('visibilitychange', update)
  const observer = new win.MutationObserver(update)
  observer.observe(doc.documentElement, { attributes: true, attributeFilter: ['data-xiaohei-appearance'] })
  return {
    setPose(nextPart: HTMLElement | undefined, nextPose: string) {
      if (nextPart !== part) {
        revision++
        clock.setClips(undefined); canvas?.remove(); canvas = undefined; clips = undefined
      }
      part = nextPart; pose = nextPose; update()
    },
    dispose() {
      disposed = true; revision++; clock.dispose(); canvas?.remove(); images.clear(); loading.clear()
      reduced.removeEventListener('change', update); observer.disconnect()
      doc.removeEventListener('visibilitychange', update)
    },
  }
}
