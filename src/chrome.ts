import { XIAOHEI_CHROME_ACCESSIBILITY_CSS } from './chrome/accessibility.js'
import { XIAOHEI_CONTROL_CSS } from './chrome/controls.js'
import { XIAOHEI_SIDEBAR_CSS } from './chrome/sidebar.js'
import { XIAOHEI_SURFACE_CSS } from './chrome/surfaces.js'
import { XIAOHEI_CHROME_TOKENS_CSS } from './chrome/tokens.js'
import { XIAOHEI_WORKSPACE_INTERACTION_CSS } from './chrome/workspace-interactions.js'

/** Stable public style id used for lifecycle cleanup and regression checks. */
export const XIAOHEI_CHROME_STYLE_ID = 'dsh-theme-xiaohei/chrome-style'

/**
 * Public aggregate retained for the DSH client API and tests. Each source
 * module owns one concern; this facade only controls composition order.
 */
export const XIAOHEI_CHROME_CSS = [
  XIAOHEI_CHROME_TOKENS_CSS,
  XIAOHEI_SIDEBAR_CSS,
  XIAOHEI_WORKSPACE_INTERACTION_CSS,
  XIAOHEI_CONTROL_CSS,
  XIAOHEI_SURFACE_CSS,
  XIAOHEI_CHROME_ACCESSIBILITY_CSS,
].join('\n')

/** Install the control skin and remove it with the plugin lifecycle. */
export function installXiaoheiChrome(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc === undefined) return () => {}

  doc.getElementById(XIAOHEI_CHROME_STYLE_ID)?.remove()
  const style = doc.createElement('style')
  style.id = XIAOHEI_CHROME_STYLE_ID
  style.textContent = XIAOHEI_CHROME_CSS
  doc.head.append(style)

  return () => style.remove()
}
