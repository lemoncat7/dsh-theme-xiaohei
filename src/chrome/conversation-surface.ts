/**
 * Conversation work surface.
 *
 * The fixed scene remains responsible for ink art. This layer only fades that
 * art away from the reading axis without changing scroll or layout geometry.
 */
export const XIAOHEI_CONVERSATION_SURFACE_CSS = `
#root [data-conversation-scroll] {
  --xiaohei-conversation-panel-span: min(
    calc(var(--dsh-chat-content-width, 748px) + 104px),
    calc(100% - 16px)
  );
  background-color: transparent;
  background-image: linear-gradient(
    90deg,
    var(--xiaohei-conversation-edge-veil) 0%,
    color-mix(in srgb, var(--xiaohei-conversation-reading-veil) 76%, transparent) 16%,
    var(--xiaohei-conversation-reading-veil) 24%,
    var(--xiaohei-conversation-reading-veil) 76%,
    color-mix(in srgb, var(--xiaohei-conversation-reading-veil) 76%, transparent) 84%,
    var(--xiaohei-conversation-edge-veil) 100%
  );
  background-position: center top;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

/* The official sticky composer seat remains on the raised content plane. */
#root [data-conversation-scroll] > [data-composer-seat] {
  background-image: linear-gradient(
    180deg,
    transparent 0,
    var(--xiaohei-conversation-reading-veil) 36px,
    var(--xiaohei-conversation-reading-veil) 100%
  ) !important;
  background-position: center top !important;
  background-repeat: no-repeat !important;
  background-size: max(0px, calc(var(--xiaohei-conversation-panel-span) - 128px)) 100% !important;
}

@media (max-width: 700px) {
  #root [data-conversation-scroll] {
    --xiaohei-conversation-panel-span: 100%;
    background-image: linear-gradient(
      var(--xiaohei-conversation-reading-veil),
      var(--xiaohei-conversation-reading-veil)
    );
    background-size: 100% 100%;
  }
}

@media (forced-colors: active) {
  #root [data-conversation-scroll],
  #root [data-conversation-scroll] > [data-composer-seat] {
    background: Canvas !important;
  }
}
`
