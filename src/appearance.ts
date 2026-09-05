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

  const win = doc.defaultView
  let handoff: number | undefined
  let disposed = false
  const cancelHandoff = (): void => {
    if (handoff !== undefined) win?.clearTimeout(handoff)
    handoff = undefined
  }
  const sync = (snapshot: ThemeSnapshot): void => {
    if (disposed) return
    cancelHandoff()
    doc.documentElement.setAttribute(XIAOHEI_APPEARANCE_ATTRIBUTE, snapshot.active.colorScheme)
    releaseXiaoheiBootAppearance(doc)
  }
  const off = ctx.on('theme/change', sync)
  const initial = ctx.theme.getTheme()
  const boot = doc.documentElement.getAttribute(XIAOHEI_BOOT_APPEARANCE_ATTRIBUTE)
  if ((boot === 'light' || boot === 'dark') && boot !== initial.active.colorScheme) {
    // Preserve the Host's first frame during settings hydration, but never
    // let a stale boot marker veto later theme events or lock a palette.
    doc.documentElement.setAttribute(XIAOHEI_APPEARANCE_ATTRIBUTE, boot)
    if (win) handoff = win.setTimeout(() => sync(ctx.theme.getTheme()), 1000)
  } else sync(initial)

  return () => {
    disposed = true
    cancelHandoff()
    off()
    releaseXiaoheiBootAppearance(doc)
    doc.documentElement.removeAttribute(XIAOHEI_APPEARANCE_ATTRIBUTE)
  }
}
