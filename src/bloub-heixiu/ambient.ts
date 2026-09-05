const unit = (n: number) => Number.isFinite(n) ? Math.max(0, Math.min(.999999, n)) : .5

export function heixiuAmbientDelay(random = Math.random) {
  return 20_000 + Math.floor(unit(random()) * 20_000)
}

export function heixiuAmbientIndex(count: number, previous: number, random = Math.random) {
  if (count <= 1) return 0
  const exclude = previous >= 0 && previous < count
  const index = Math.floor(unit(random()) * (exclude ? count - 1 : count))
  return exclude && index >= previous ? index + 1 : index
}
