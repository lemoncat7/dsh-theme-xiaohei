/** Pure placement policy: decoration may only occupy space outside message bounds. */
export interface CharacterRect { left: number; top: number; right: number; bottom: number }
export interface CharacterLayoutInput {
  sidebar: CharacterRect
  scroll: CharacterRect
  flow: CharacterRect
  viewportWidth: number
  viewportHeight: number
  controls: CharacterRect[]
}
export interface CharacterPlacement {
  pose: 'seated' | 'peek' | 'halfpeek' | 'hidden'
  left: number
  top: number
  width: number
  height: number
}
const hidden: CharacterPlacement = { pose: 'hidden', left: 0, top: 0, width: 0, height: 0 }
const SEATED_RATIO = 0.71
const PEEK_RATIO = 0.63
const HALF_PEEK_RATIO = 0.44

export function resolveCharacterPlacement(input: CharacterLayoutInput): CharacterPlacement {
  const { sidebar, scroll, flow, viewportWidth, viewportHeight, controls } = input
  // Wallpaper belongs to the viewport, not the welcome/composer dock. Reserve
  // the same top/bottom chrome space before and after the first message.
  const bottom = Math.min(sidebar.bottom, viewportHeight) - 148
  const top = Math.max(sidebar.top + 24, 96)
  if (bottom - top < 130 || sidebar.right > flow.left) return hidden
  const rightStart = flow.right + 56
  const seatedWidth = Math.min(250, scroll.right - rightStart - 20, (bottom - top) * SEATED_RATIO, 340 * SEATED_RATIO)
  if (seatedWidth >= 190) {
    const height = seatedWidth / SEATED_RATIO
    return { pose: 'seated', left: scroll.right - seatedWidth - 16,
      top: top + (bottom - top - height) * 0.6, width: seatedWidth, height }
  }

  const avatarInset = viewportWidth > 760 ? 52 : 0
  const freeGap = flow.left - avatarInset - sidebar.right
  if (freeGap >= 66) {
    const width = Math.min(104, freeGap - 12, (bottom - top) * PEEK_RATIO)
    const height = width / PEEK_RATIO
    return { pose: 'peek', left: sidebar.right - 6,
      top: top + Math.min(160, (bottom - top - height) * 0.5), width, height }
  }

  // A collapsed rail has a large blank region between navigation and Settings.
  // Use that region only after excluding every real interactive control.
  if (sidebar.right - sidebar.left > 100) return hidden
  const left = sidebar.left + 7
  const width = Math.min(60, flow.left - avatarInset - left - 10)
  if (width < 40) return hidden
  const height = width / HALF_PEEK_RATIO
  const blocked = controls.filter(r => r.right > left && r.left < left + width)
    .map(r => ({ start: Math.max(top, r.top - 12), end: Math.min(bottom, r.bottom + 12) }))
    .filter(r => r.end > r.start).sort((a, b) => a.start - b.start)
  let cursor = top
  let best = { start: top, end: top }
  for (const block of [...blocked, { start: bottom, end: bottom }]) {
    if (block.start - cursor > best.end - best.start) best = { start: cursor, end: block.start }
    cursor = Math.max(cursor, block.end)
  }
  if (best.end - best.start < height + 12) return hidden
  return { pose: 'halfpeek', left, top: best.start + (best.end - best.start - height) * 0.45, width, height }
}
