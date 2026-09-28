import type { SessionListState, SessionSummary } from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'

/** Keep the host session-selection contract out of visual state reducers. */
export function currentSession(state: SessionListState & { current?: SessionSummary['id'] }): SessionSummary['id'] | undefined {
  return (Object.values(state.byId ?? {}) as SessionSummary[]).find(row => (row.retainedBy?.mainView ?? 0) > 0)?.id ?? state.current
}
