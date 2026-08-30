import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { bindXiaoheiAppearance } from './appearance.js'
import { installXiaoheiBlink } from './blink.js'
import { installXiaoheiChrome } from './chrome.js'
import { installXiaoheiComposerSendHeixiu } from './composer-send-heixiu.js'
import { installXiaoheiGaze } from './gaze.js'
import { installXiaoheiHeixiuInteractions } from './heixiu-interactions.js'
import { installXiaoheiPluginLoading } from './loading-heixiu.js'
import { installXiaoheiPortalTransit } from './portal.js'
import { installXiaoheiIdleReactions } from './reactions.js'
import { installXiaoheiScene } from './scene.js'
import { installXiaoheiSidebarGlass } from './sidebar-glass.js'
import { installXiaoheiSidebarHeixiuRoaming } from './sidebar-heixiu-roaming.js'
import { bindXiaoheiSessionState } from './state.js'
import { XIAOHEI_THEME_TOKEN_OVERRIDES } from './theme.js'
import { XiaoheiBrandName, XiaoheiMetallicBrandMark } from './metallic-brand-mark.js'

/** Boot decoration has no service dependency; the full theme waits below. */
export const inject: string[] = []

/** Shade DSH's native appearance modes without replacing its preference UI. */
export function apply(ctx: ClientContext): void {
  ctx.effect(installXiaoheiPluginLoading, 'xiaohei-theme: replace plugin spinner with hopping Heixiu')
  ctx.inject(['slots'], readyCtx => {
    const disposeSidebarMark = readyCtx.slots.inject('sidebar.brand.mark', () => readyCtx.slots.register({
      name: 'sidebar.brand.mark',
      priority: -20,
    }, XiaoheiMetallicBrandMark))
    const disposeSidebarName = readyCtx.slots.inject('sidebar.brand.name', () => readyCtx.slots.register({
      name: 'sidebar.brand.name',
      priority: -20,
    }, XiaoheiBrandName))
    const disposeHeroMark = readyCtx.slots.inject(
      'conversation.hero.brand.mark',
      () => readyCtx.slots.register({
        name: 'conversation.hero.brand.mark',
        priority: -20,
      }, XiaoheiMetallicBrandMark),
    )
    return () => {
      disposeHeroMark()
      disposeSidebarName()
      disposeSidebarMark()
    }
  })
  ctx.inject(['theme', 'sessions'], (readyCtx) => installXiaoheiTheme(readyCtx))
}

/** Mount the complete theme only after its runtime services become available. */
function installXiaoheiTheme(ctx: ClientContext): void {
  ctx.effect(() => {
    return ctx.theme.overrideTokens('@lemoncat7/dsh-theme-xiaohei', XIAOHEI_THEME_TOKEN_OVERRIDES)
  }, 'xiaohei-theme: shade native Light / Dark / System palettes')

  ctx.effect(() => bindXiaoheiAppearance(ctx), 'xiaohei-theme: follow resolved appearance')
  ctx.effect(installXiaoheiChrome, 'xiaohei-theme: install spirit control skin')
  ctx.effect(installXiaoheiComposerSendHeixiu, 'xiaohei-theme: turn the native send action into blinking Heixiu')
  ctx.effect(installXiaoheiScene, 'xiaohei-theme: install moonlit forest scene')
  ctx.effect(installXiaoheiSidebarGlass, 'xiaohei-theme: install isolated sidebar glass')
  ctx.effect(installXiaoheiSidebarHeixiuRoaming, 'xiaohei-theme: let sidebar Heixiu roam safely')
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
