import type {
  ISessions,
  SessionSnapshot,
  SessionSummary,
} from '@deepseek-ai/dsh-api-session-controller/client'

export const XIAOHEI_STATE_ATTRIBUTE = 'data-xiaohei-state'
export const XIAOHEI_COMPLETE_DURATION_MS = 1600

export type XiaoheiState =
  | 'idle'
  | 'thinking'
  | 'streaming'
  | 'tool'
  | 'waiting'
  | 'complete'
  | 'error'

/** Resolve one official DSH snapshot using the theme's visible-state priority. */
export function resolveXiaoheiState(
  snapshot: SessionSnapshot | LegacySessionActivity | undefined,
  summary: SessionSummary | undefined,
): Exclude<XiaoheiState, 'complete'> {
  if (snapshot !== undefined) {
    if (
      snapshot.removed
      || snapshot.openState === 'error'
      || snapshot.openError !== null
      || snapshot.promptError !== null
      || snapshot.lastAgentError !== null
    ) return 'error'

    const pending = 'pending' in snapshot
      ? snapshot.pending
      : [...snapshot.queue, ...snapshot.pendingSubmissions]
    const runningCalls = 'runningCalls' in snapshot ? snapshot.runningCalls : []
    const partial = 'partial' in snapshot ? snapshot.partial : null
    if (pending.length > 0 || legacyPendingInteraction(summary) !== undefined) return 'waiting'
    if (runningCalls.length > 0) return 'tool'
    if (snapshot.running && partial !== null) return 'streaming'
    if (snapshot.running) return 'thinking'
    return 'idle'
  }

  if (legacyPendingInteraction(summary) !== undefined) return 'waiting'
  return summary?.running === true ? 'thinking' : 'idle'
}

interface LegacySessionActivity {
  removed: boolean
  openState: 'cold' | 'loading' | 'open' | 'error'
  openError: unknown | null
  promptError: unknown | null
  lastAgentError: unknown | null
  pending: readonly unknown[]
  runningCalls: readonly unknown[]
  partial: unknown | null
  running: boolean
}

function legacyPendingInteraction(summary: SessionSummary | undefined): unknown {
  return (summary as SessionSummary & { pendingInteraction?: unknown } | undefined)?.pendingInteraction
}

/** Mirror the selected Session's official detailed state onto the theme root. */
export function bindXiaoheiSessionState(
  sessions: Pick<ISessions, 'list' | 'binding'>,
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
  completeDurationMs = XIAOHEI_COMPLETE_DURATION_MS,
): () => void {
  if (doc === undefined) return () => {}

  const root = doc.documentElement
  const timerWindow = doc.defaultView ?? undefined
  let currentId: ReturnType<typeof sessions.list.getSnapshot>['current']
  let currentSession: NonNullable<ReturnType<typeof sessions.binding>>['session'] | undefined
  let unsubscribeSession = (): void => {}
  let previousRunning: boolean | undefined
  let completeTimer: ReturnType<typeof setTimeout> | number | undefined
  let disposed = false

  const clearComplete = (): void => {
    if (completeTimer === undefined) return
    if (timerWindow !== undefined) timerWindow.clearTimeout(completeTimer)
    else clearTimeout(completeTimer)
    completeTimer = undefined
  }

  const setState = (state: XiaoheiState): void => {
    root.setAttribute(XIAOHEI_STATE_ATTRIBUTE, state)
  }

  const updateCurrent = (): void => {
    if (disposed || currentId === undefined) return
    const listSnapshot = sessions.list.getSnapshot()
    const summary = listSnapshot.byId[currentId]
    const snapshot = currentSession?.getSnapshot()
    const resolved = resolveXiaoheiState(snapshot, summary)
    const running = snapshot?.running ?? summary?.running ?? false
    const completed = previousRunning === true && running === false
    previousRunning = running

    if (resolved !== 'idle') {
      clearComplete()
      setState(resolved)
      return
    }

    if (completed) {
      clearComplete()
      setState('complete')
      const finish = (): void => {
        completeTimer = undefined
        if (!disposed) setState('idle')
      }
      completeTimer = timerWindow !== undefined
        ? timerWindow.setTimeout(finish, completeDurationMs)
        : setTimeout(finish, completeDurationMs)
      return
    }

    if (completeTimer === undefined) setState('idle')
  }

  const updateList = (): void => {
    if (disposed) return
    const listSnapshot = sessions.list.getSnapshot()
    const nextId = listSnapshot.current
    const nextSession = nextId === undefined ? undefined : sessions.binding(nextId)?.session
    const changed = nextId !== currentId || nextSession !== currentSession

    if (changed) {
      unsubscribeSession()
      unsubscribeSession = (): void => {}
      clearComplete()
      currentId = nextId
      currentSession = nextSession
      previousRunning = undefined
      if (currentSession !== undefined) unsubscribeSession = currentSession.subscribe(updateCurrent)
    }

    if (currentId === undefined) {
      setState('idle')
      return
    }
    updateCurrent()
  }

  const unsubscribeList = sessions.list.subscribe(updateList)
  updateList()
  return () => {
    disposed = true
    clearComplete()
    unsubscribeSession()
    unsubscribeList()
    root.removeAttribute(XIAOHEI_STATE_ATTRIBUTE)
  }
}
