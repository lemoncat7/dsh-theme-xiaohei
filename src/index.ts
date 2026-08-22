import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import {
  injectXiaoheiBootLoader,
  XIAOHEI_BOOT_LOADER_SCRIPT_ID,
} from './boot-loader.js'

/** Human-readable Cordis plugin name. */
export const name = 'dsh-theme-xiaohei'

/** Install a pre-plugin loader bootstrap without modifying DSH shell assets. */
export function apply(ctx: Context): void {
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(
      () => webCtx.webServer.tapIndex(injectXiaoheiBootLoader),
      'xiaohei-theme: inject first-frame Heixiu plugin loader',
    )
  })
}

export {
  injectXiaoheiBootLoader,
  XIAOHEI_BOOT_LOADER_SCRIPT_ID,
}
