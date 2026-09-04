import { XIAOHEI_AVATAR_2D_FRONT } from '../generated-keyart.js'

/** Native conversation messages restyled without changing their DOM contract. */
export const XIAOHEI_CONVERSATION_MESSAGES_CSS = `
/* Keep DSH's native max width; only tune vertical reading rhythm. */
#root [data-chat-flow] {
  gap: 18px;
}

#root [data-chat-flow-kind='assistant-step'] {
  color: var(--xiaohei-conversation-text);
}

/* Message portraits are deliberately static. The single animated companion
   lives beside the composer, while these only clarify who said each message. */
#root [data-chat-flow-kind='assistant-step'],
#root [data-chat-flow-kind='user'] {
  position: relative;
  overflow: visible;
}

#root [data-chat-flow-kind='assistant-step']::before,
#root [data-chat-flow-kind='user']::after {
  position: absolute;
  inset-block-start: 2px;
  z-index: 2;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  inline-size: 40px;
  block-size: 44px;
  border: 1px solid rgb(235 240 242 / 13%);
  border-radius: 13px 13px 15px 15px;
  color: rgb(225 231 232 / 78%);
  background-color: rgb(18 23 25 / 76%);
  background-repeat: no-repeat;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 9%),
    0 6px 16px rgb(0 0 0 / 16%);
  pointer-events: none;
}

#root [data-chat-flow-kind='assistant-step']::before {
  content: '';
  inset-inline-start: -50px;
  background-image:
    url("${XIAOHEI_AVATAR_2D_FRONT}"),
    linear-gradient(145deg, rgb(255 255 255 / 7%), transparent 56%);
  background-position: center -1px, center;
  background-size: 76px auto, auto;
}

#root [data-chat-flow-kind='user']::after {
  content: '我';
  inset-inline-end: -50px;
  block-size: 40px;
  border-radius: 13px;
  font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: .02em;
  background-image:
    linear-gradient(145deg, rgb(255 255 255 / 8%), transparent 58%),
    linear-gradient(160deg, rgb(34 40 43 / 84%), rgb(20 25 27 / 76%));
}

/* The slot outlet itself uses display:contents, so the box must live on its
   native AssistantMarkdown child. This keeps the semantic row untouched. */
#root [data-chat-flow-kind='assistant-step']
  > [data-slot='conversation.chat.node']
  > div:first-child {
  box-sizing: border-box;
  inline-size: fit-content;
  max-inline-size: 100%;
  padding: 14px 16px;
  border: 1px solid var(--xiaohei-conversation-edge) !important;
  border-radius: 9px 18px 18px 18px;
  background: var(--xiaohei-conversation-assistant) !important;
  box-shadow:
    inset 0 1px 0 var(--xiaohei-conversation-highlight),
    inset 1px 0 0 color-mix(in srgb, var(--xiaohei-conversation-highlight) 42%, transparent),
    0 7px 22px var(--xiaohei-conversation-shadow) !important;
  -webkit-backdrop-filter: blur(var(--xiaohei-conversation-blur)) saturate(124%);
  backdrop-filter: blur(var(--xiaohei-conversation-blur)) saturate(124%);
  overflow-wrap: anywhere;
}

#root [data-chat-flow-kind='assistant-step']
  > [data-slot='conversation.chat.node']
  > div:first-child > div {
  color: var(--xiaohei-conversation-text) !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

#root [data-chat-flow-kind='assistant-step'] :is(p, li, h1, h2, h3, h4, h5, h6) {
  color: var(--xiaohei-conversation-text);
}

/* User and steering prose use a slightly denser companion bubble; image-only rows stay untouched. */
#root [data-chat-flow-kind='user'] [data-time-hover-root]
  > div:first-child > div:last-child:not(:has(img)),
#root [data-pending-steering]
  > div:first-child > div:last-child:not(:has(img)) {
  color: var(--xiaohei-conversation-text) !important;
  border: 1px solid var(--xiaohei-conversation-edge);
  border-radius: 18px 9px 18px 18px;
  background: var(--xiaohei-conversation-user) !important;
  box-shadow:
    inset 0 1px 0 var(--xiaohei-conversation-highlight),
    inset -1px 0 0 color-mix(in srgb, var(--xiaohei-conversation-highlight) 42%, transparent),
    0 7px 22px var(--xiaohei-conversation-shadow) !important;
  -webkit-backdrop-filter: blur(var(--xiaohei-conversation-blur)) saturate(124%);
  backdrop-filter: blur(var(--xiaohei-conversation-blur)) saturate(124%);
  overflow-wrap: anywhere;
}

/* Context, recall, compaction and tool rows use the same ink-and-silver family,
   but at a lower contrast than actual conversation bubbles. */
#root [data-chat-flow-kind='context'],
#root [data-chat-flow-kind='manual-compaction'],
#root [data-chat-flow-kind='command'] > div,
#root [data-context-injection-body],
#root [data-context-source],
#root [data-context-summary],
#root [data-turn-tail] [role='status'] {
  color: var(--xiaohei-conversation-meta);
}

#root :is(
  [data-chat-flow-kind='context'],
  [data-chat-flow-kind='manual-compaction'],
  [data-chat-flow-kind='tool-call'],
  [data-chat-flow-kind='command']
) > [data-slot='conversation.chat.node'] > div:first-child {
  box-sizing: border-box;
  inline-size: fit-content;
  max-inline-size: 100%;
  border: 1px solid var(--xiaohei-conversation-meta-edge);
  border-radius: 11px;
  background: var(--xiaohei-conversation-meta-surface) !important;
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--xiaohei-conversation-highlight) 52%, transparent),
    0 4px 14px color-mix(in srgb, var(--xiaohei-conversation-shadow) 58%, transparent);
  -webkit-backdrop-filter: blur(12px) saturate(118%);
  backdrop-filter: blur(12px) saturate(118%);
  overflow: hidden;
}

#root [data-chat-flow-kind='turn-tail'] .dsh-knowledge-writeback-status {
  box-sizing: border-box;
  padding: 4px 8px;
  border: 1px solid var(--xiaohei-conversation-meta-edge);
  border-radius: 9px;
  background: var(--xiaohei-conversation-meta-surface) !important;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--xiaohei-conversation-highlight) 48%, transparent);
  -webkit-backdrop-filter: blur(10px) saturate(116%);
  backdrop-filter: blur(10px) saturate(116%);
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
  border: 1px solid rgb(132 138 143 / 8%);
  background: rgb(132 138 143 / 5%) !important;
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

html[data-xiaohei-appearance='light'] #root [data-chat-flow-kind='assistant-step']
  > [data-slot='conversation.chat.node']
  > div:first-child,
html[data-xiaohei-appearance='light'] #root [data-chat-flow-kind='assistant-step'] :is(p, li, h1, h2, h3, h4, h5, h6) {
  color: #343B3A !important;
}

html[data-xiaohei-appearance='light'] #root [data-chat-flow-kind='assistant-step']::before,
html[data-xiaohei-appearance='light'] #root [data-chat-flow-kind='user']::after {
  border-color: rgb(42 48 52 / 11%);
  color: rgb(48 54 58 / 72%);
  background-color: rgb(239 242 243 / 78%);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 76%),
    0 6px 16px rgb(34 40 43 / 9%);
}

html[data-xiaohei-appearance='light'] #root [data-chat-flow-kind='user']::after {
  background-image:
    linear-gradient(145deg, rgb(255 255 255 / 74%), transparent 58%),
    linear-gradient(160deg, rgb(242 244 245 / 86%), rgb(222 226 228 / 76%));
}

@media (width <= 760px) {
  #root [data-chat-flow-kind='assistant-step'] {
    box-sizing: border-box;
    padding-inline-start: 38px;
  }

  #root [data-chat-flow-kind='user'] {
    box-sizing: border-box;
    padding-inline-end: 38px;
  }

  #root [data-chat-flow-kind='assistant-step']::before,
  #root [data-chat-flow-kind='user']::after {
    inline-size: 32px;
    block-size: 36px;
    border-radius: 11px 11px 13px 13px;
  }

  #root [data-chat-flow-kind='assistant-step']::before {
    inset-inline-start: 0;
    background-size: 62px auto, auto;
  }

  #root [data-chat-flow-kind='user']::after {
    inset-inline-end: 0;
    block-size: 32px;
    border-radius: 11px;
    font-size: 11px;
  }

  #root [data-chat-flow-kind='assistant-step']
    > [data-slot='conversation.chat.node']
    > div:first-child {
    padding: 12px 13px;
    border-radius: 8px 16px 16px 16px;
  }

  #root :is(
    [data-chat-flow-kind='context'],
    [data-chat-flow-kind='manual-compaction'],
    [data-chat-flow-kind='tool-call'],
    [data-chat-flow-kind='command']
  ) > [data-slot='conversation.chat.node'] > div:first-child {
    border-radius: 10px;
  }
}

@media (prefers-contrast: more), (forced-colors: active) {
  #root [data-chat-flow-kind='assistant-step']::before,
  #root [data-chat-flow-kind='user']::after {
    display: none;
  }

  #root [data-time-hover-root] button,
  #root [data-turn-tail] button,
  #root [data-chat-flow-kind='command'] > div {
    opacity: 1;
  }
}
`
