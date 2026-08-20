import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { bindXiaoheiAppearance } from './appearance.js'
import { installXiaoheiBlink } from './blink.js'
import { installXiaoheiChrome } from './chrome.js'
import { installXiaoheiGaze } from './gaze.js'
import { installXiaoheiHeixiuInteractions } from './heixiu-interactions.js'
import { installXiaoheiPortalTransit } from './portal.js'
import { installXiaoheiIdleReactions } from './reactions.js'
import { installXiaoheiScene } from './scene.js'
import { bindXiaoheiSessionState } from './state.js'
import { XIAOHEI_THEME_TOKEN_OVERRIDES } from './theme.js'
import { installXiaoheiWorkspaceInteractions } from './workspace-interactions.js'

/** The browser theme service must exist before this plugin applies. */
export const inject = ['theme', 'sessions']

/** Shade DSH's native appearance modes without replacing its preference UI. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => {
    return ctx.theme.overrideTokens('@lemoncat7/dsh-theme-xiaohei', XIAOHEI_THEME_TOKEN_OVERRIDES)
  }, 'xiaohei-theme: shade native Light / Dark / System palettes')

  ctx.effect(() => bindXiaoheiAppearance(ctx), 'xiaohei-theme: follow resolved appearance')
  ctx.effect(installXiaoheiChrome, 'xiaohei-theme: install spirit control skin')
  ctx.effect(installXiaoheiWorkspaceInteractions, 'xiaohei-theme: bind workspace spirit feedback')
  ctx.effect(installXiaoheiScene, 'xiaohei-theme: install moonlit forest scene')
  ctx.effect(installXiaoheiHeixiuInteractions, 'xiaohei-theme: bind Heixiu companion interactions')
  ctx.effect(installXiaoheiPortalTransit, 'xiaohei-theme: install random Heixiu portal visits')
  ctx.effect(installXiaoheiGaze, 'xiaohei-theme: install proximity gaze')
  ctx.effect(installXiaoheiBlink, 'xiaohei-theme: synchronize complete-frame blinking')
  ctx.effect(installXiaoheiIdleReactions, 'xiaohei-theme: install sparse idle reactions')
  ctx.effect(
    () => bindXiaoheiSessionState(ctx.sessions),
    'xiaohei-theme: follow current session agent state',
  )
}
