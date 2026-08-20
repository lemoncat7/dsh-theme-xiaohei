import type { ThemeSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'

export const XIAOHEI_APPEARANCE_ATTRIBUTE = 'data-xiaohei-appearance'

interface XiaoheiAppearanceContext {
  theme: {
    getTheme(): ThemeSnapshot
  }
  on(event: 'theme/change', listener: (snapshot: ThemeSnapshot) => void): () => void
}

/** Mirror DSH's resolved Light / Dark / System appearance onto the scene. */
export function bindXiaoheiAppearance(
  ctx: XiaoheiAppearanceContext,
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc === undefined) return () => {}

  const sync = (snapshot: ThemeSnapshot): void => {
    doc.documentElement.setAttribute(XIAOHEI_APPEARANCE_ATTRIBUTE, snapshot.active.colorScheme)
  }
  const off = ctx.on('theme/change', sync)
  sync(ctx.theme.getTheme())

  return () => {
    off()
    doc.documentElement.removeAttribute(XIAOHEI_APPEARANCE_ATTRIBUTE)
  }
}
