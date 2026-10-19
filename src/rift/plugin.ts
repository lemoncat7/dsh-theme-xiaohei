import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { bindXiaoheiAppearance } from '../appearance.js'
import { bindXiaoheiSessionState } from '../state.js'
import { XiaoheiDraftPreview } from '../composer-draft-preview.js'
import { installDeferredDecorations } from '../deferred-decorations.js'
import { installDeferredCompanion } from '../deferred-companion.js'
import { bindHeixiuSessions, createHeixiuSignals } from '../bloub-heixiu/signals.js'
import { RiftBrand, RiftMark, RiftHeroMark, RiftMotion } from './controls.js'
import { RIFT_TOKENS } from './palette.js'
import { installRiftChrome } from './styles.js'
import { RiftField } from './field.js'

export const inject:string[]=[]
export function apply(ctx:ClientContext):void{
  ctx.inject(['slots'],ready=>{
    const registrations=[
      ready.slots.inject('shell.overlay',()=>ready.slots.register({name:'shell.overlay',id:'xiaohei-rift-field',order:-30},RiftField)),
      ready.slots.inject('sidebar.brand.mark',()=>ready.slots.register({name:'sidebar.brand.mark',priority:-20},RiftMark)),
      ready.slots.inject('sidebar.brand.name',()=>ready.slots.register({name:'sidebar.brand.name',priority:-20},RiftBrand)),
      ready.slots.inject('conversation.hero.brand.mark',()=>ready.slots.register({name:'conversation.hero.brand.mark',priority:-20},RiftHeroMark)),
      ready.slots.inject('sidebar.footer.action',()=>ready.slots.register({name:'sidebar.footer.action',id:'xiaohei-rift-motion',order:20},RiftMotion)),
      ready.slots.inject('conversation.input.dock',()=>ready.slots.register({name:'conversation.input.dock',id:'xiaohei-draft-preview',order:100},XiaoheiDraftPreview)),
    ]
    return()=>{for(const dispose of registrations.reverse())dispose()}
  })
  ctx.inject(['theme'],ready=>{
    ready.effect(()=>ready.theme.overrideTokens('@lemoncat7/dsh-theme-xiaohei',RIFT_TOKENS),'rift: paired native palettes')
    ready.effect(()=>bindXiaoheiAppearance(ready),'rift: follow native appearance')
    ready.effect(installRiftChrome,'rift: native shell surfaces')
    ready.effect(installDeferredDecorations,'rift: deferred isolated scene')
    const heixiuSignals = createHeixiuSignals()
    ready.effect(()=>installDeferredCompanion(heixiuSignals),'rift: deferred Heixiu companion')
    ready.inject(['sessions'],sessions=>{
      const state = bindXiaoheiSessionState(sessions.sessions)
      const companion = bindHeixiuSessions(sessions.sessions,heixiuSignals)
      return()=>{companion();state()}
    })
  })
}
