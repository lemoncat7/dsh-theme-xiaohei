/** Stable DSH slots used by the theme's runtime and generated CSS. */
export const XIAOHEI_HOST_SLOTS = {
  sidebar: 'sidebar',
  composerBar: 'conversation.composer.bar',
} as const

export type XiaoheiHostSlot = typeof XIAOHEI_HOST_SLOTS[keyof typeof XIAOHEI_HOST_SLOTS]

/** Keep Host selector construction in one compatibility boundary. */
export function xiaoheiHostSlotSelector(slot: XiaoheiHostSlot): string {
  return `[data-slot='${slot}']`
}

const sidebar = xiaoheiHostSlotSelector(XIAOHEI_HOST_SLOTS.sidebar)
const composerBar = xiaoheiHostSlotSelector(XIAOHEI_HOST_SLOTS.composerBar)

export const XIAOHEI_HOST_SELECTORS = {
  sidebar,
  sidebarShell: `#root ${sidebar} > div`,
  composerBar,
  composerBarShell: `#root ${composerBar} > div`,
  composerCard: "#root [data-composer-card='true']",
} as const
