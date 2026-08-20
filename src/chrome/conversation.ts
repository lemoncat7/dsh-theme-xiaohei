/** Conversation-level controls and quiet Xiaohei identity details. */
export const XIAOHEI_CONVERSATION_CSS = `
#root [data-slot='conversation.composer'] button[aria-label='选择工作区'],
#root [data-slot='conversation.composer'] button[aria-label='Select workspace'] {
  min-height: 32px;
  padding-inline: 10px;
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-control);
  color: var(--dsw-alias-label-primary);
  background: var(--xiaohei-surface-muted);
  box-shadow: inset 0 1px rgb(255 255 255 / 5%);
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-base) ease,
    border-color var(--xiaohei-motion-base) ease,
    box-shadow var(--xiaohei-motion-base) ease;
}

#root [data-slot='conversation.composer'] button[aria-label='选择工作区']:hover,
#root [data-slot='conversation.composer'] button[aria-label='Select workspace']:hover,
#root [data-slot='conversation.composer'] button[aria-label='选择工作区'][aria-expanded='true'],
#root [data-slot='conversation.composer'] button[aria-label='Select workspace'][aria-expanded='true'] {
  color: var(--xiaohei-spirit-strong);
  border-color: var(--xiaohei-edge);
  background: var(--xiaohei-spirit-soft);
  box-shadow: inset 3px 0 var(--xiaohei-spirit);
}

#root [data-slot='conversation.session.header'] button,
#root [data-slot='conversation.input.plan'] button,
#root [data-slot='conversation.input.model'] button,
#root [data-slot='conversation.hero.agentPreset'] button {
  border: 1px solid transparent;
  border-radius: var(--xiaohei-radius-small);
  transition:
    color var(--xiaohei-motion-fast) ease,
    background-color var(--xiaohei-motion-fast) ease,
    border-color var(--xiaohei-motion-fast) ease;
}

#root [data-slot='conversation.session.header'] button:hover,
#root [data-slot='conversation.input.plan'] button:hover,
#root [data-slot='conversation.input.model'] button:hover,
#root [data-slot='conversation.hero.agentPreset'] button:hover {
  color: var(--xiaohei-spirit-strong);
  border-color: var(--xiaohei-edge);
  background: var(--xiaohei-spirit-soft);
}

#root [data-slot='conversation.session'] [role='status'],
#root [data-slot='conversation.composer'] [role='status'] {
  color: var(--dsw-alias-label-secondary);
}

html[data-xiaohei-appearance='light'] #root [data-slot='conversation.composer'] button[aria-label='选择工作区'],
html[data-xiaohei-appearance='light'] #root [data-slot='conversation.composer'] button[aria-label='Select workspace'] {
  background: rgb(246 249 247 / 70%);
  box-shadow: inset 0 1px rgb(255 255 255 / 74%);
}
`
