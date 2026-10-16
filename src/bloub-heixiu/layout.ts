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

/** Mirror the owned absolute-position CSS without measuring after style writes.
 * The containing block is the composer's padding box (inside its border).
 */
export function resolveHeixiuBox(
  composer: { left: number; top: number; height: number },
  border: { left: number; top: number },
  dock: ReturnType<typeof resolveHeixiuDock>,
  welcome: ReturnType<typeof resolveHeixiuWelcome>,
) {
  const size = welcome?.size ?? dock.size
  if (welcome) return { left: composer.left + border.left + welcome.left,
    top: composer.top + border.top + welcome.top, width: size, height: size }
  if (dock.mode === 'compact') return { left: composer.left + border.left + 4,
    top: composer.top + border.top + 6, width: size, height: size }
  return { left: composer.left + border.left - 18 - size,
    top: composer.top + composer.height / 2 - size / 2, width: size, height: size }
}
