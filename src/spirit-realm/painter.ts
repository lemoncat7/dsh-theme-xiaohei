/** Independent Canvas2D implementation inspired by React Bits Aurora/Particles.
 * No shader, React Bits component, or continuous React render is copied.
 * At most 36 particles and 3 ribbon paths; capped backing store and frame rate.
 */
export function paintRealm(ctx: CanvasRenderingContext2D, width: number, height: number, time: number, light: boolean, active: boolean): void {
  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.globalCompositeOperation = light ? 'source-over' : 'screen'
  const color = light ? '32,121,98' : '113,237,193'
  for (let layer = 0; layer < 3; layer++) {
    const base = height * (.17 + layer * .065)
    ctx.beginPath()
    for (let x = 0; x <= width + 20; x += 20) {
      const y = base + Math.sin(x / width * 4.8 + time * .19 + layer) * height * .06 + Math.sin(x / width * 9 - time * .12) * height * .018
      if (x === 0) ctx.moveTo(x, y);else ctx.lineTo(x, y)
    }
    // Nested translucent strokes soften both edges without a full-screen blur.
    ctx.lineJoin = 'round'
    for (let band = 6; band >= 1; band--) {
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, `rgba(${color},0)`)
      gradient.addColorStop(.55, `rgba(${color},${(light ? .012 : .023) * (1 + (6 - band) * .16)})`)
      gradient.addColorStop(1, `rgba(${color},0)`)
      ctx.strokeStyle = gradient;ctx.lineWidth = band * height * .016;ctx.stroke()
    }
  }
  const count = width < 700 ? 14 : 36
  for (let i = 0; i < count; i++) {
    const seed = (i * .61803398875) % 1
    const x = ((seed * width + Math.sin(time * .13 + i * 2) * 14) + width) % width
    const y = ((i * .381966 * height - time * (active ? 11 : 4) * (1 + seed)) % height + height) % height
    const alpha = .15 + .45 * (.5 + .5 * Math.sin(time * .7 + i))
    ctx.fillStyle = `rgba(${color},${alpha})`
    ctx.beginPath();ctx.arc(x, y, .7 + seed * 1.6, 0, Math.PI * 2);ctx.fill()
  }
  ctx.restore()
}
