import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { bindXiaoheiAppearance } from './appearance.js'
import { installXiaoheiChrome } from './chrome.js'
import { installXiaoheiComposerSendHeixiu } from './composer-send-heixiu.js'
import { XiaoheiDraftPreview } from './composer-draft-preview.js'
import { installXiaoheiPluginLoading } from './loading-heixiu.js'
import { installDeferredDecorations } from './deferred-decorations.js'
import { installXiaoheiScene } from './scene/runtime.js'
import { installXiaoheiSidebarGlass } from './sidebar-glass.js'
import { installDeferredCompanion } from './deferred-companion.js'
import { bindHeixiuSessions, createHeixiuSignals } from './bloub-heixiu/signals.js'
import { XIAOHEI_THEME_TOKEN_OVERRIDES } from './theme.js'
import { XiaoheiMetallicBrandMark } from './metallic-brand-mark.js'
import { SpiritRealmBrand, SpiritRealmMotion } from './spirit-realm/controls.js'
import { bindXiaoheiSessionState } from './state.js'

/** Boot decoration has no service dependency; the full theme waits below. */
export const inject: string[] = []

/** Shade DSH's native appearance modes without replacing its preference UI. */
export function apply(ctx: ClientContext): void {
  ctx.effect(installXiaoheiPluginLoading, 'xiaohei-theme: replace plugin spinner with hopping Heixiu')
  ctx.inject(['slots'], readyCtx => {
    const disposeMotion = readyCtx.slots.inject('sidebar.footer.action', () => readyCtx.slots.register({
      name: 'sidebar.footer.action', id: 'xiaohei-spirit-motion', order: 20,
    }, SpiritRealmMotion))
    const disposeDraftPreview = readyCtx.slots.inject('conversation.input.dock', () => readyCtx.slots.register({
      name: 'conversation.input.dock',
      id: 'xiaohei-draft-preview',
      order: 100,
    }, XiaoheiDraftPreview))
    const disposeSidebarMark = readyCtx.slots.inject('sidebar.brand.mark', () => readyCtx.slots.register({
      name: 'sidebar.brand.mark',
      priority: -20,
    }, XiaoheiMetallicBrandMark))
    const disposeSidebarName = readyCtx.slots.inject('sidebar.brand.name', () => readyCtx.slots.register({
      name: 'sidebar.brand.name',
      priority: -20,
    }, SpiritRealmBrand))
    const disposeHeroMark = readyCtx.slots.inject(
      'conversation.hero.brand.mark',
      () => readyCtx.slots.register({
        name: 'conversation.hero.brand.mark',
        priority: -20,
      }, XiaoheiMetallicBrandMark),
    )
    return () => {
      disposeMotion()
      disposeDraftPreview()
      disposeHeroMark()
      disposeSidebarName()
      disposeSidebarMark()
    }
  })
  ctx.inject(['theme'], (readyCtx) => installXiaoheiTheme(readyCtx))
}

/** Mount the complete theme only after its runtime services become available. */
function installXiaoheiTheme(ctx: ClientContext): void {
  ctx.effect(() => {
    return ctx.theme.overrideTokens('@lemoncat7/dsh-theme-xiaohei', XIAOHEI_THEME_TOKEN_OVERRIDES)
  }, 'xiaohei-theme: shade native Light / Dark / System palettes')

  ctx.effect(() => bindXiaoheiAppearance(ctx), 'xiaohei-theme: follow resolved appearance')
  ctx.effect(installXiaoheiChrome, 'xiaohei-theme: install spirit control skin')
  ctx.effect(installXiaoheiScene, 'xiaohei-theme: paint wallpaper immediately')
  ctx.effect(installXiaoheiComposerSendHeixiu, 'xiaohei-theme: turn the native send action into blinking Heixiu')
  ctx.effect(installDeferredDecorations, 'xiaohei-theme: load decorations after first paint')
  ctx.effect(installXiaoheiSidebarGlass, 'xiaohei-theme: install isolated sidebar glass')
  const heixiuSignals = createHeixiuSignals()
  ctx.effect(() => installDeferredCompanion(heixiuSignals), 'xiaohei-theme: mount Heixiu after conversation paint')
  ctx.inject(['sessions'], ready => {
    const disposeHeixiu = bindHeixiuSessions(ready.sessions, heixiuSignals)
    const disposeState = bindXiaoheiSessionState(ready.sessions)
    return () => { disposeState(); disposeHeixiu() }
  })
}
