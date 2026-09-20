const smooth = (t: number) => { const x=Math.max(0,Math.min(1,t)); return x*x*(3-2*x) }
/** Fast closure, short hold, relaxed opening; zero velocity at each join. */
export function blinkClosure(progress: number): number {
  if (progress <= 0 || progress >= 1) return 0
  if (progress < .3) return smooth(progress/.3)
  if (progress < .4) return 1
  return 1-smooth((progress-.4)/.6)
}

export function attentionBlink(progress: number): number {
  return blinkClosure((progress-.12)/.16)
}
