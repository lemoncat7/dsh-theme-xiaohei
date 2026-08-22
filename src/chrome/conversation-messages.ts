/** Native conversation messages restyled without changing their DOM contract. */
export const XIAOHEI_CONVERSATION_MESSAGES_CSS = `
/* Keep DSH's native max width; only tune vertical reading rhythm. */
#root [data-chat-flow] {
  gap: 18px;
}

#root [data-chat-flow-kind='assistant-step'] {
  color: var(--xiaohei-conversation-text);
}

#root [data-chat-flow-kind='assistant-step'] > div {
  color: var(--xiaohei-conversation-text) !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

#root [data-chat-flow-kind='assistant-step'] :is(p, li, h1, h2, h3, h4, h5, h6) {
  color: var(--xiaohei-conversation-text);
}

/* User and steering prose keep a light bubble; image-only rows stay untouched. */
#root [data-chat-flow-kind='user'] [data-time-hover-root]
  > div:first-child > div:last-child:not(:has(img)),
#root [data-pending-steering]
  > div:first-child > div:last-child:not(:has(img)) {
  color: var(--xiaohei-conversation-text) !important;
  border: 1px solid var(--xiaohei-conversation-user-edge);
  border-radius: 18px;
  background: var(--xiaohei-conversation-user) !important;
  box-shadow: none !important;
}

/* Context, recall, compaction and tool rows stay readable but subordinate. */
#root [data-chat-flow-kind='context'],
#root [data-chat-flow-kind='manual-compaction'],
#root [data-chat-flow-kind='command'] > div,
#root [data-context-injection-body],
#root [data-context-source],
#root [data-context-summary],
#root [data-turn-tail] [role='status'] {
  color: var(--xiaohei-conversation-meta);
}

#root [data-chat-flow-kind='context'],
#root [data-chat-flow-kind='manual-compaction'] {
  font-size: 13px;
}

#root [data-chat-flow-kind='command'] > div {
  opacity: 0.82;
  transition: opacity var(--xiaohei-motion-fast) ease;
}

#root [data-chat-flow-kind='command']:hover > div,
#root [data-chat-flow-kind='command']:focus-within > div {
  opacity: 1;
}

#root [data-context-injection-body] {
  border: 1px solid rgb(111 153 148 / 8%);
  background: rgb(111 153 148 / 5%) !important;
}

/* Copy, branch, retry and plugin-provided message actions stay quiet at rest. */
#root [data-time-hover-root] button,
#root [data-turn-tail] button {
  opacity: 0.38;
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    opacity var(--xiaohei-motion-fast) ease;
}

#root [data-time-hover-root]:hover button,
#root [data-time-hover-root]:focus-within button,
#root [data-turn-tail]:hover button,
#root [data-turn-tail]:focus-within button {
  opacity: 0.82;
}

html[data-xiaohei-appearance='light'] #root [data-chat-flow-kind='assistant-step'] > div,
html[data-xiaohei-appearance='light'] #root [data-chat-flow-kind='assistant-step'] :is(p, li, h1, h2, h3, h4, h5, h6) {
  color: #343B3A !important;
}

@media (prefers-contrast: more), (forced-colors: active) {
  #root [data-time-hover-root] button,
  #root [data-turn-tail] button,
  #root [data-chat-flow-kind='command'] > div {
    opacity: 1;
  }
}
`
