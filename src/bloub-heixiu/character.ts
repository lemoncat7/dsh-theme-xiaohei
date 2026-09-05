import { superellipseProfile } from '../vendor/bloub/shape.js'
import type { BotExpression } from '../vendor/bloub/expressions.js'

// Slightly wider than tall: a soft black body, not an upright head or a flat
// pill. Side tips sit near the equator. Keep bloub's 64 radial samples.
export const HEIXIU_PROFILE = superellipseProfile(2.2, 1, .89).map((r, i, radii) => {
  const angle = i / radii.length * Math.PI * 2
  const bump = (center: number, width: number, amount: number) => {
    const d = Math.atan2(Math.sin(angle - center), Math.cos(angle - center))
    return amount * Math.exp(-.5 * (d / width) ** 2)
  }
  return r * (1 + .016 * Math.sin(angle))
    + bump(6.12, .12, .065) + bump(3.30, .12, .065)
    + bump(4.04, .10, .025)
})

export const HEIXIU_FACE: BotExpression = {
  id: 'neutre', gaze: { yaw: 0, pitch: -7, roll: -2 }, split: 26,
  eyes: [{ w: .355, h: .48, open: 1 }, { w: .34, h: .465, open: 1 }],
}

// Derive the squash pivot from the body itself so a proportion adjustment
// cannot leave the character rotating/compressing around an invisible foot.
export const HEIXIU_FOOT = Math.max(...HEIXIU_PROFILE.map((r, i) =>
  r * Math.sin(i / HEIXIU_PROFILE.length * Math.PI * 2))) * 100

export interface HeixiuReaction {
  x: number; y: number; sx: number; sy: number; roll: number
  lid: number; cheer: number
}
export const HEIXIU_REST: HeixiuReaction = { x: 0, y: 0, sx: 1, sy: 1, roll: 0, lid: 1, cheer: 0 }
export const HEIXIU_REACTIONS = ['greet', 'hop', 'wiggle'] as const
export type HeixiuReactionId = typeof HEIXIU_REACTIONS[number]
type Key = { at: number; pose: HeixiuReaction }
const smooth = (x: number) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k) }
const pose = (over: Partial<HeixiuReaction>): HeixiuReaction => ({ ...HEIXIU_REST, ...over })
const CHANNELS = Object.keys(HEIXIU_REST) as (keyof HeixiuReaction)[]

// Shape-preserving Hermite tangents: a rising/falling arc passes through its
// intermediate samples without stopping at every key. Extrema still settle,
// and lids/scales never overshoot their authored bounds.
function tangent(keys: Key[], index: number, channel: keyof HeixiuReaction) {
  if (index === 0 || index === keys.length - 1) return 0
  const a = keys[index - 1]!, b = keys[index]!, c = keys[index + 1]!
  const h0 = b.at - a.at, h1 = c.at - b.at
  const d0 = (b.pose[channel] - a.pose[channel]) / h0, d1 = (c.pose[channel] - b.pose[channel]) / h1
  if (d0 * d1 <= 0) return 0
  const w0 = 2 * h1 + h0, w1 = h1 + 2 * h0
  return (w0 + w1) / (w0 / d0 + w1 / d1)
}

/** One bounded, interruptible gesture track; never queues clicks or runs timers. */
export class HeixiuReactions {
  private start = 0
  private keys: Key[] = []
  private hover = 0
  private hoverAt = 0
  private hoverFrom = 0
  private hoverTo = 0
  get end() { return this.start + (this.keys.at(-1)?.at ?? 0) }
  reset() { this.keys = []; this.hover = this.hoverFrom = this.hoverTo = 0 }
  settle(time: number) {
    const origin = this.track(time)
    this.start = time
    this.keys = [{ at: 0, pose: origin }, { at: .22, pose: { ...HEIXIU_REST } }]
    this.aim(0, time)
  }
  aim(direction: number, time: number) {
    this.hover = this.hoverFrom + (this.hoverTo - this.hoverFrom) * smooth((time - this.hoverAt) / .28)
    this.hoverFrom = this.hover; this.hoverTo = Math.max(-1, Math.min(1, direction)); this.hoverAt = time
  }
  private track(time: number): HeixiuReaction {
    if (!this.keys.length || time >= this.end) return { ...HEIXIU_REST }
    const t = Math.max(0, time - this.start)
    let left = this.keys[0]!
    for (let i = 1; i < this.keys.length; i++) {
      const right = this.keys[i]!
      if (t <= right.at) {
        const span = right.at - left.at, k = (t - left.at) / span
        const k2 = k * k, k3 = k2 * k
        const out = { ...left.pose }
        for (const key of CHANNELS) {
          out[key] = (2 * k3 - 3 * k2 + 1) * left.pose[key] + (-2 * k3 + 3 * k2) * right.pose[key]
            + (k3 - 2 * k2 + k) * span * tangent(this.keys, i - 1, key)
            + (k3 - k2) * span * tangent(this.keys, i, key)
        }
        return out
      }
      left = right
    }
    return { ...HEIXIU_REST }
  }
  play(kind: HeixiuReactionId, time: number, side = 1) {
    const origin = this.track(time), sign = side < 0 ? -1 : 1
    const keys: Key[] = [{ at: 0, pose: origin }]
    const add = (at: number, over: Partial<HeixiuReaction>) => keys.push({ at, pose: pose(over) })
    if (kind === 'greet') {
      add(.09, { lid: .25, sy: .99, cheer: .35 })
      add(.16, { lid: 0, sy: .985, cheer: .35, roll: -2 * sign })
      add(.26, { y: -2, sy: 1.005, roll: 1 * sign })
      add(.43, { y: -7, sx: .99, sy: 1.015, roll: 3 * sign })
      add(.67, { sx: 1.018, sy: .982, roll: -1 * sign })
      add(.95, {})
    } else if (kind === 'hop') {
      add(.12, { sx: 1.065, sy: .94, lid: .85, roll: -2 * sign })
      add(.23, { sx: .97, sy: 1.045, y: -14, roll: 2 * sign })
      add(.40, { sx: .99, sy: 1.02, y: -28, roll: 3 * sign })
      add(.57, { sy: 1.015, y: -14, roll: 1 * sign })
      add(.69, { sx: 1.06, sy: .94, lid: .55, cheer: .3 })
      add(.80, { sx: .985, sy: 1.02 })
      add(1.02, {})
    } else {
      add(.18, { x: -2 * sign, roll: -7 * sign })
      add(.38, { x: 2 * sign, roll: 7 * sign })
      add(.55, { x: -1 * sign, roll: -3 * sign, lid: .3, cheer: .2 })
      add(.64, { roll: -1 * sign, lid: 0, cheer: .2 })
      add(.78, {})
      add(.96, {})
    }
    this.start = time; this.keys = keys
  }
  sample(time: number): HeixiuReaction {
    const out = this.track(time)
    this.hover = this.hoverFrom + (this.hoverTo - this.hoverFrom) * smooth((time - this.hoverAt) / .28)
    out.roll += this.hover * 5; out.x += this.hover * 4
    return out
  }
}
