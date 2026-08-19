import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ThemeSnapshot } from '@deepseek-ai/dsh-client-ui-theme/client'
import { installXiaoheiScene } from './scene.js'
import { XIAOHEI_NIGHT_THEME } from './theme.js'

/** The browser theme service must exist before this plugin applies. */
export const inject = ['theme']

/** Register and activate Xiaohei Night for the lifetime of this plugin. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    const dispose = ctx.theme.register(XIAOHEI_NIGHT_THEME)
    const enforce = (snapshot: ThemeSnapshot): void => {
      if (snapshot.preference !== XIAOHEI_NIGHT_THEME.id) {
        ctx.theme.setTheme(XIAOHEI_NIGHT_THEME.id)
      }
    }
    const off = ctx.on('theme/change', enforce)
    ctx.theme.setTheme(XIAOHEI_NIGHT_THEME.id)
    return () => {
      off()
      dispose()
    }
  }, 'xiaohei-theme: register Xiaohei Night theme')

  ctx.effect(installXiaoheiScene, 'xiaohei-theme: install moonlit forest scene')
}
