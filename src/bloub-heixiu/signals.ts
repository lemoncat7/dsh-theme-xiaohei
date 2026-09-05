import type { ISessions, SessionFace } from '@deepseek-ai/dsh-api-session-controller/client'

export interface HeixiuSignal {
  sessionId?: string
  running: boolean
  notice: 'notify' | 'alert' | null
  revision: number
}

/** Small local read model. No messages, RPCs, history scans or persisted state. */
export function createHeixiuSignals() {
  let value: HeixiuSignal = { running: false, notice: null, revision: 0 }
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => value,
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } },
    publish(next: Omit<HeixiuSignal, 'revision'>) {
      if (next.sessionId === value.sessionId && next.running === value.running && next.notice === value.notice) return
      value = { ...next, revision: value.revision + 1 }
      for (const fn of listeners) fn()
    },
  }
}
export type HeixiuSignals = ReturnType<typeof createHeixiuSignals>

/** Optional official service adapter, subscribed only to the selected session. */
export function bindHeixiuSessions(sessions: ISessions, signals: HeixiuSignals) {
  let face: SessionFace | undefined
  let removeSession = () => {}
  let previous: ReturnType<SessionFace['getSnapshot']> | undefined
  const read = () => {
    const next = face?.getSnapshot()
    const live = next?.openState === 'open' && !next.removed
    const wasLive = previous?.openState === 'open' && !previous.removed
    const same = previous?.sessionId === next?.sessionId
    const failed = !!next && !!previous && (next.lastAgentError && next.lastAgentError !== previous.lastAgentError
      || next.promptError && next.promptError !== previous.promptError)
    const ended = wasLive && same && previous?.running && !next?.running
    const notice = live && wasLive && same ? failed ? 'alert' : ended ? 'notify' : null : null
    signals.publish({ sessionId: next?.sessionId, running: !!live && !!next?.running, notice })
    previous = next
  }
  const select = () => {
    const id = sessions.list.getSnapshot().current
    const next = id ? sessions.binding(id)?.session : undefined
    if (next === face) return
    removeSession(); previous = undefined; face = next
    removeSession = face?.subscribe(read) ?? (() => {})
    read()
  }
  const removeList = sessions.list.subscribe(select)
  select()
  return () => {
    removeList(); removeSession()
    signals.publish({ running: false, notice: null })
  }
}
