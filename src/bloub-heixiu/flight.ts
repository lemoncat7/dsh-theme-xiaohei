export interface HeixiuBox { left: number; top: number; width: number; height: number }
const copyBox = (box: HeixiuBox): HeixiuBox => ({ left: box.left, top: box.top, width: box.width, height: box.height })

/** FLIP between native docks; the existing SVG and reaction clock stay alive. */
export function createHeixiuFlight(button: HTMLElement) {
  let animation: Animation | undefined
  let route: { from: HeixiuBox; to: HeixiuBox; duration: number } | undefined
  const active = () => animation?.playState === 'running'
  const progress = () => Math.max(0, Math.min(1, animation?.effect?.getComputedTiming().progress ?? 0))
  // Native borders can settle by half a CSS pixel; this is not a new flight.
  const same = (a: HeixiuBox, b: HeixiuBox) => (['left', 'top', 'width', 'height'] as const).every(k => Math.abs(a[k] - b[k]) < 1)
  function position(fallback?: HeixiuBox): HeixiuBox | undefined {
    if (!active() || !route) return fallback
    const p = progress()
    const lerp = (key: keyof HeixiuBox) => route!.from[key] + (route!.to[key] - route!.from[key]) * p
    return { left: lerp('left'), top: lerp('top'), width: lerp('width'), height: lerp('height') }
  }
  function cancel() {
    if (animation) { animation.onfinish = null; animation.cancel(); animation = undefined }
    route = undefined
    button.dataset.flying = 'false'
  }
  return {
    get active() { return active() },
    // Read the previous viewport trajectory, not a box already displaced by
    // the moving composer. Capturing must not cancel/restart an equal target.
    capture: position,
    target(measured: HeixiuBox): HeixiuBox {
      if (!active() || !route) return measured
      const p = progress(), { from, to } = route
      const scale = (from.width / to.width) * (1 - p) + p
      const width = measured.width / scale, height = measured.height / scale
      const dx = (from.left + from.width / 2 - to.left - to.width / 2) * (1 - p)
      const dy = (from.top + from.height / 2 - to.top - to.height / 2) * (1 - p)
      return { left: measured.left - dx + (measured.width - width) / 2,
        top: measured.top - dy + (measured.height - height) / 2, width, height }
    },
    move(from: HeixiuBox | undefined, to: HeixiuBox, reduced: boolean) {
      if (!reduced && active() && route && same(route.to, to)) return
      const duration = active() && route ? Math.max(80, route.duration - Number(animation!.currentTime ?? 0)) : 950
      cancel()
      if (!from || reduced || typeof button.animate !== 'function' || !from.width || !to.width) return
      const dx = from.left + from.width / 2 - to.left - to.width / 2
      const dy = from.top + from.height / 2 - to.top - to.height / 2
      if (Math.hypot(dx, dy) < 4 && Math.abs(from.width - to.width) < 1) return
      route = { from: copyBox(from), to: copyBox(to), duration }
      animation = button.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width})` },
        { transform: 'translate(0px, 0px) scale(1)' },
      ], { duration, easing: 'cubic-bezier(.22,.75,.2,1)' })
      button.dataset.flying = 'true'
      const current = animation
      current.onfinish = () => { if (animation === current) cancel() }
    },
    cancel,
  }
}
