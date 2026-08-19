import type { ISessions } from '@deepseek-ai/dsh-client-runtime/client'

export const XIAOHEI_STATE_ATTRIBUTE = 'data-xiaohei-state'

/** Mirror the selected session's official running bit onto the theme root. */
export function bindXiaoheiSessionState(
  sessions: Pick<ISessions, 'list'>,
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc === undefined) return () => {}

  const root = doc.documentElement
  const update = (): void => {
    const snapshot = sessions.list.getSnapshot()
    const current = snapshot.current
    const thinking = current !== undefined && snapshot.byId[current]?.running === true
    root.setAttribute(XIAOHEI_STATE_ATTRIBUTE, thinking ? 'thinking' : 'idle')
  }

  update()
  const unsubscribe = sessions.list.subscribe(update)
  return () => {
    unsubscribe()
    root.removeAttribute(XIAOHEI_STATE_ATTRIBUTE)
  }
}
