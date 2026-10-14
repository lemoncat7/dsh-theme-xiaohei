import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'

/** A read-only local projection. The native editor owns draft and send lifetime. */
export function XiaoheiDraftPreview({ input }: PropsRuntime<'conversation.input.dock'>) {
  if (!input.draft.trim() || input.phase === 'submitting' || input.phase === 'adjudicating') return null
  return <section data-xiaohei-draft-preview aria-label="草稿 · 未发送">
    <div className="xiaohei-draft-label">草稿 · 未发送</div>
    <div className="xiaohei-draft-bubble" tabIndex={0} aria-label="草稿内容">{input.draft}</div>
  </section>
}
