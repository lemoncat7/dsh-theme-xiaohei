import type { BotFrame } from '../vendor/bloub/engine.js'
import { DEMI_VIEWBOX } from '../vendor/bloub/repere.js'
import { HEIXIU_FOOT, HEIXIU_REST, type HeixiuReaction } from './character.js'
import { createHeixiuEffects } from './effects.js'

const NS = 'http://www.w3.org/2000/svg'
let serial = 0

/** A hollow eye, not a hole in the body: wallpaper never bleeds through it. */
export function heixiuEyeRadii(width: number, height: number) {
  // Upstream special poses bring their eyes close together. Keep the large
  // resting rings, but taper their width in small poses to avoid fused eyes.
  const roomy = Math.max(0, Math.min(1, (width - 20) / 12))
  return { rx: Math.max(0.01, Math.min(width, 38) * (1 + .15 * roomy)), ry: Math.max(0.01, Math.min(height, 62) * 0.96) }
}

/** Filled upstream eyes may touch; hollow rings need a small readable gap. */
export function heixiuEyeSeparation(eyes: BotFrame['eyes']): number {
  if (eyes.length !== 2) return 1
  const matrices = eyes.map(eye => eye.openMatrix.slice(7, -1).split(/[ ,]+/).map(Number))
  const [a, b] = matrices
  if (!a || !b || a.length !== 6 || b.length !== 6 || [...a, ...b].some(n => !Number.isFinite(n))) return 1
  const dx = b[4]! - a[4]!, dy = b[5]! - a[5]!, distance = Math.hypot(dx, dy)
  if (distance < 1) return .1
  const nx = dx / distance, ny = dy / distance
  const support = eyes.reduce((sum, eye, i) => {
    const m = matrices[i]!, { rx, ry } = heixiuEyeRadii(eye.width, eye.height)
    return sum + Math.hypot(rx * (m[0]! * nx + m[1]! * ny), ry * (m[2]! * nx + m[3]! * ny))
  }, 0)
  return Math.min(1, Math.max(.1, (distance - 10) / Math.max(1, support)))
}

/** Persistent SVG nodes: frame updates never replace HTML or retrigger host observers. */
export function createHeixiuRenderer(doc: Document) {
  const el = <K extends keyof SVGElementTagNameMap>(name: K) => doc.createElementNS(NS, name)
  const attrs = (node: Element, values: Record<string, string | number>) => {
    for (const [key, value] of Object.entries(values)) {
      const text = String(value)
      if (node.getAttribute(key) !== text) node.setAttribute(key, text)
    }
  }
  const svg = el('svg'), defs = el('defs'), clip = el('clipPath'), clipBody = el('path')
  const id = `xiaohei-bloub-${++serial}`
  attrs(svg, { viewBox: `${-DEMI_VIEWBOX} ${-DEMI_VIEWBOX} ${DEMI_VIEWBOX * 2} ${DEMI_VIEWBOX * 2}`, 'aria-hidden': 'true', focusable: 'false' })
  attrs(clip, { id: `${id}-body`, clipPathUnits: 'userSpaceOnUse' })
  clip.append(clipBody); defs.append(clip)
  const bodyGroup = el('g'), body = el('path'), eyesGroup = el('g')
  attrs(body, { fill: 'var(--heixiu-ink)', stroke: 'var(--heixiu-outline)', 'stroke-width': 1.2, 'data-heixiu-body': '' })
  attrs(eyesGroup, { 'clip-path': `url(#${id}-body)`, fill: 'none', stroke: '#f5f3db', 'stroke-width': 10.5 })
  const eyes = [el('path'), el('path')]
  for (const eye of eyes) attrs(eye, { 'data-heixiu-eye': '', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
  eyesGroup.append(...eyes); bodyGroup.append(body, eyesGroup)
  const character = el('g'); attrs(character, { 'data-heixiu-character': '' })
  character.append(bodyGroup)
  svg.append(defs, character)
  let effects: ReturnType<typeof createHeixiuEffects> | undefined
  function prepareEffects() {
    if (effects) return
    const behind = el('g'), front = el('g')
    character.insertBefore(behind, bodyGroup); character.append(front)
    effects = createHeixiuEffects(doc, id, defs, behind, front, bodyGroup)
  }
  function render(frame: BotFrame, reaction: HeixiuReaction = HEIXIU_REST) {
    attrs(character, { transform: `translate(${reaction.x} ${reaction.y + HEIXIU_FOOT}) rotate(${reaction.roll}) scale(${reaction.sx} ${reaction.sy}) translate(0 ${-HEIXIU_FOOT})` })
    attrs(body, { d: frame.bodyPath }); attrs(clipBody, { d: frame.bodyPath })
    attrs(bodyGroup, { opacity: frame.bodyAlpha })
    const eyeScale = heixiuEyeSeparation(frame.eyes)
    for (const [i, node] of eyes.entries()) {
      const eye = frame.eyes[i]
      if (!eye) { attrs(node, { opacity: 0 }); continue }
      const radii = heixiuEyeRadii(eye.width, eye.height)
      const rx = radii.rx * eyeScale, ry = radii.ry * eyeScale
      const lid = Math.max(0, Math.min(eye.lid, reaction.lid))
      // Both halves meet in a curved, constant-weight lid. No flattened matrix,
      // double-outline flash, vanished stroke, or full-body opacity swapping.
      const curve = -rx * .26 * reaction.cheer * (1 - lid)
      const top = curve - ry * lid * 1.3333, bottom = curve + ry * lid * 1.3333
      const d = `M${-rx} 0C${-rx} ${top} ${rx} ${top} ${rx} 0C${rx} ${bottom} ${-rx} ${bottom} ${-rx} 0Z`
      attrs(node, { d, transform: eye.openMatrix, opacity: eye.alpha, 'stroke-width': Math.min(10.5, rx * .28) })
    }
    effects?.(frame)
  }
  return { svg, render, prepareEffects }
}
