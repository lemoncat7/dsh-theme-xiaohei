import type { ThemeSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'
import {
  releaseXiaoheiBootAppearance,
  XIAOHEI_BOOT_APPEARANCE_ATTRIBUTE,
} from './boot-appearance.js'

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
    const bootAppearance = doc.documentElement.getAttribute(XIAOHEI_BOOT_APPEARANCE_ATTRIBUTE)
    if (bootAppearance === 'light' || bootAppearance === 'dark') {
      doc.documentElement.setAttribute(XIAOHEI_APPEARANCE_ATTRIBUTE, bootAppearance)
      if (snapshot.active.colorScheme !== bootAppearance) return
    } else {
      doc.documentElement.setAttribute(XIAOHEI_APPEARANCE_ATTRIBUTE, snapshot.active.colorScheme)
    }
    releaseXiaoheiBootAppearance(doc)
  }
  const off = ctx.on('theme/change', sync)
  sync(ctx.theme.getTheme())

  return () => {
    off()
    doc.documentElement.removeAttribute(XIAOHEI_APPEARANCE_ATTRIBUTE)
  }
}
