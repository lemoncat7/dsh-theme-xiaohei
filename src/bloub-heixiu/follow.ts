/** Attraction measured from the stationary hit area, not the moving artwork. */
export function resolveHeixiuGaze(dx: number, dy: number) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return { yaw: 0, pitch: -7, mix: 1, spin: 0, wander: .35 }
  return { yaw: Math.max(-14, Math.min(14, dx / 16)),
    // The old upper limit was -7 + 9 = 2 degrees: barely above straight ahead.
    pitch: -7 - Math.max(-31, Math.min(9, dy / 16)), mix: 1, spin: 0, wander: 0 }
}

export function resolveHeixiuFollow(dx: number, dy: number, compact: boolean) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return { x: 0, y: 0 }
  const distance = Math.hypot(dx, dy), radius = compact ? 90 : 140
  if (distance >= radius) return { x: 0, y: 0 }
  const k = Math.max(0, Math.min(1, (distance - radius * .5) / (radius * .5)))
  const fade = 1 - k * k * (3 - 2 * k)
  const divisor = Math.max(compact ? 32 : 50, distance)
  return {
    x: dx / divisor * (compact ? 2 : 5) * fade,
    y: dy / divisor * (compact ? 1.5 : 3.5) * fade,
  }
}
