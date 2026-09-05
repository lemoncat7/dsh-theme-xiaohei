export function resolveHeixiuDock(composerLeft: number, sidebarRight: number, viewportWidth: number) {
  const outside = viewportWidth > 760 && composerLeft - sidebarRight >= 114
  return { mode: outside ? 'outside' : 'compact', size: outside ? 96 : 52 } as const
}

export function resolveHeixiuWelcome(
  hero: { left: number; top: number; width: number; height: number },
  composer: { left: number; top: number },
  sidebarRight: number,
  viewportWidth: number,
) {
  if (hero.width <= 0 || hero.height <= 0 || hero.top + hero.height > composer.top) return undefined
  const size = viewportWidth <= 760 ? 52 : 96
  const left = Math.max(sidebarRight + 6, hero.left - size - (size === 52 ? 10 : 24))
  return { size, left: left - composer.left, top: hero.top + hero.height / 2 - size / 2 - composer.top }
}
