import type { Point } from './character-motion-types.js'

/** Bind-space joint positions. Each child inherits its parent's rotation. */
export const TAIL_JOINTS: readonly Point[] = [
  [284, 328], [310, 347], [324, 373], [319, 398],
  [307, 423], [307, 448], [319, 464],
]
export interface Joint { x: number; y: number; angle: number }
export interface Vertex { x: number; y: number; bone: number; weight: number }
export function solveBones(rest: readonly Point[], angles: readonly number[]): Joint[] {
  return rest.reduce<Joint[]>((out, p, i) => {
    const parent = out[i - 1]
    const angle = (parent?.angle ?? 0) + (angles[i] ?? 0)
    if (!parent) out.push({ x: p[0], y: p[1], angle })
    else {
      const prev = rest[i - 1]!, dx = p[0] - prev[0], dy = p[1] - prev[1]
      const c = Math.cos(parent.angle), s = Math.sin(parent.angle)
      out.push({ x: parent.x + dx*c - dy*s, y: parent.y + dx*s + dy*c, angle })
    }
    return out
  }, [])
}
export function bindVertex(x: number, y: number, rest = TAIL_JOINTS): Vertex {
  let distance = Infinity, bone = 0, weight = 0
  for (let i = 0; i < rest.length - 1; i++) {
    const a = rest[i]!, b = rest[i+1]!, dx = b[0]-a[0], dy = b[1]-a[1]
    const t = Math.max(0, Math.min(1, ((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)))
    const d = (x-a[0]-dx*t)**2 + (y-a[1]-dy*t)**2
    if (d < distance) { distance = d; bone = i; weight = t }
  }
  return { x, y, bone, weight }
}
/** Linear blend skinning, inverse bind translation followed by posed rotation. */
export function skinVertex(v: Vertex, joints: readonly Joint[], rest = TAIL_JOINTS): Point {
  let x = 0, y = 0
  for (let k = 0; k < 2; k++) {
    const i = v.bone+k, p = rest[i]!, j = joints[i]!, w = k ? v.weight : 1-v.weight
    const dx = v.x-p[0], dy = v.y-p[1], c = Math.cos(j.angle), s = Math.sin(j.angle)
    x += w*(j.x+dx*c-dy*s); y += w*(j.y+dx*s+dy*c)
  }
  return [x,y]
}
export function rigAngles(progress: number, count: number, tail: boolean): number[] {
  const t = Math.max(0, Math.min(1, progress))
  const envelope = Math.sin(Math.PI*t)**2
  // Delayed distal joints create follow-through, with zero displacement/velocity
  // at both ends; no discrete frame lookup and no idle simulation.
  return Array.from({length:count}, (_,i) => envelope * (tail ? (i ? .12 : 0) : .22)
    * Math.sin(t*Math.PI*(tail ? 3 : 4)-i*(tail ? .65 : 1.1)))
}
