/** Keep stable DSH selectors in one compatibility boundary. */
const sidebar = "[data-slot='sidebar']"

export const XIAOHEI_HOST_SELECTORS = {
  sidebar,
  sidebarShell: `#root ${sidebar} > div`,
  composerCard: "#root [data-composer-card='true']",
  composerHeroMark: "#root .xiaohei-brand-mark[data-brand-context='hero']",
  composerHeroRow: "[class*='_headline']",
} as const
