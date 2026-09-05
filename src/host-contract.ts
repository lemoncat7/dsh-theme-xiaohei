/** Keep stable DSH selectors in one compatibility boundary. */
const sidebar = "[data-slot='sidebar']"

export const XIAOHEI_HOST_SELECTORS = {
  sidebar,
  sidebarShell: `#root ${sidebar} > div`,
  // The shell holds its expanded width while its contents fade. Only the
  // outer layout column represents the currently visible animated width.
  sidebarColumn: `#root :has(> ${sidebar})`,
  composerCard: "#root [data-composer-card='true']",
  composerHeroMark: "#root .xiaohei-brand-mark[data-brand-context='hero']",
  composerHeroRow: "[class*='_headline']",
} as const
