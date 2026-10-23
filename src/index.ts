import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'
import { injectRiftBoot } from './rift/boot.js'

/** Human-readable Cordis plugin name. */
export const name = 'dsh-theme-xiaohei'

/** Install a pre-plugin loader bootstrap without modifying DSH shell assets. */
export function apply(ctx: Context): void {
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(
      () => webCtx.webServer.tapIndex(injectRiftBoot),
      'rift: first-frame appearance and local presentation preference',
    )
  })
}

export { injectRiftBoot } from './rift/boot.js'
