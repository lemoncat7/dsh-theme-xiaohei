/** Local draft and native submission presentation; Host owns their lifetime. */
export const XIAOHEI_CONVERSATION_SUBMISSIONS_CSS = `
#root [data-xiaohei-draft-preview] {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  box-sizing: border-box;
  inline-size: calc(100% - 2 * (var(--dsh-composer-side-clearance, 24px) + 16px));
  max-inline-size: var(--dsh-chat-content-width, 748px);
  margin-inline: auto;
  min-inline-size: 0;
  padding: 4px 0 8px;
  gap: 4px;
  color: var(--xiaohei-conversation-text);
}
#root .xiaohei-draft-label {
  font-size: 12px;
  padding-inline: 10px;
}
#root .xiaohei-draft-bubble {
  max-inline-size: min(calc(var(--dsh-chat-content-width, 748px) * .702), 82%);
  min-inline-size: 0;
  max-block-size: min(160px, 22dvh);
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  padding: 10px 14px;
  border: 1px dashed var(--xiaohei-conversation-edge);
  border-radius: 18px 9px 18px 18px;
  background: var(--xiaohei-conversation-user);
  font-size: 14px;
  line-height: 1.6;
}
#root .xiaohei-draft-bubble:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
@media (width <= 760px) {
  #root [data-xiaohei-draft-preview] {
    padding-inline-end: 38px;
  }
}

#root :is(div[data-submission-echo], [data-pending-steering]) {
  min-inline-size: 0;
  color: var(--xiaohei-conversation-text);
}

/* Do not dim the whole row: text and attachments must remain readable while
 * the Host keeps edit/remove/steer disabled until its queue acknowledgement. */
#root li[data-submission-echo] {
  opacity: 1;
  color: var(--xiaohei-conversation-text);
  background: var(--xiaohei-conversation-user);
  border-color: var(--xiaohei-conversation-edge);
}

#root [data-submission-echo] [role='status'] {
  color: var(--xiaohei-conversation-text);
  flex-shrink: 0;
  white-space: nowrap;
}

#root li[data-submission-echo] button:disabled {
  cursor: not-allowed;
}
`
