import type { BotFrame } from '../vendor/bloub/engine.js'

const NS = 'http://www.w3.org/2000/svg'

/** Allocated once on first explicit special action, never from the frame loop. */
export function createHeixiuEffects(doc: Document, id: string, defs: SVGDefsElement, behind: SVGGElement, front: SVGGElement, body: SVGGElement) {
  const el = <K extends keyof SVGElementTagNameMap>(name: K) => doc.createElementNS(NS, name)
  const attrs = (node: Element, values: Record<string, string | number>) => {
    for (const [key, value] of Object.entries(values)) {
      const text = String(value)
      if (node.getAttribute(key) !== text) node.setAttribute(key, text)
    }
  }
  const dotsBack = el('g'), dotsFront = el('g')
  behind.append(dotsBack); front.append(dotsFront)
  // Real transparent notch, never a wallpaper-coloured disc over the body.
  const mask = el('mask'), surface = el('rect'), notch = el('circle'), badge = el('circle')
  attrs(mask, { id: `${id}-notification`, maskUnits: 'userSpaceOnUse', x: -200, y: -200, width: 400, height: 400, 'mask-type': 'luminance' })
  attrs(surface, { x: -200, y: -200, width: 400, height: 400, fill: 'white' })
  attrs(notch, { fill: 'black', r: 0, 'data-heixiu-notch': '' })
  attrs(badge, { fill: '#dca964', display: 'none', 'data-heixiu-notification': '' })
  mask.append(surface, notch); defs.append(mask); front.append(badge)
  const dots = Array.from({ length: 12 }, () => {
    const node = el('path'); attrs(node, { display: 'none', 'data-heixiu-particle': '' }); dotsFront.append(node); return node
  })
  const arcs = Array.from({ length: 12 }, (_, i) => {
    const gradient = el('linearGradient'), back = el('path'), fore = el('path')
    attrs(gradient, { id: `${id}-arc-${i}`, gradientUnits: 'userSpaceOnUse' })
    const stops = Array.from({ length: 3 }, () => el('stop'))
    gradient.append(...stops); defs.append(gradient)
    for (const node of [back, fore]) attrs(node, {
      fill: 'none', 'stroke-linecap': 'round', stroke: `url(#${id}-arc-${i})`, display: 'none', 'data-heixiu-orbit': '',
    })
    behind.append(back); front.append(fore)
    return { gradient, back, fore, stops }
  })
  return (frame: BotFrame) => {
    if (frame.notif && frame.notch) {
      attrs(body, { mask: `url(#${id}-notification)` })
      attrs(notch, { cx: frame.notch.x, cy: frame.notch.y, r: frame.notch.r })
      attrs(badge, { display: 'inline', cx: frame.notif.x, cy: frame.notif.y, r: frame.notif.r })
    } else {
      if (body.getAttribute('mask')) body.removeAttribute('mask')
      attrs(notch, { r: 0 }); attrs(badge, { display: 'none' })
    }
    for (const [i, node] of dots.entries()) {
      const dot = frame.dots[i]
      if (!dot) { attrs(node, { display: 'none' }); continue }
      const parent = frame.dotsBehind ? dotsBack : dotsFront
      if (node.parentNode !== parent) parent.append(node)
      const r = dot.r
      attrs(node, { display: 'inline',
        d: dot.d ?? `M${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`,
        transform: `translate(${dot.x} ${dot.y}) rotate(${dot.rot ?? 0}) scale(${dot.d ? 100 : 1})`,
        fill: dot.color ?? 'var(--heixiu-ink)', opacity: dot.opacity * (dot.depth ?? 1),
      })
    }
    for (const [i, nodes] of arcs.entries()) {
      const arc = frame.arcs[i]
      if (!arc) { attrs(nodes.back, { display: 'none' }); attrs(nodes.fore, { display: 'none' }); continue }
      attrs(nodes.gradient, { x1: arc.grad.x1, y1: arc.grad.y1, x2: arc.grad.x2, y2: arc.grad.y2 })
      for (const [j, stop] of nodes.stops.entries()) attrs(stop, {
        offset: j / 2, 'stop-color': arc.grad.stops[Math.min(j, arc.grad.stops.length - 1)] ?? '#ddd',
      })
      for (const [node, d] of [[nodes.back, arc.back], [nodes.fore, arc.front]] as const) attrs(node, {
        display: 'inline', d, 'stroke-width': arc.width, opacity: arc.opacity,
      })
    }
  }
}
