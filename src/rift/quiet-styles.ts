import { quietPaletteCss } from './quiet-palette.js'
import { RIFT_VIEW_CSS } from './view-styles.js'

/** Independent workspace stylesheet. No Rift glass, etched seams, asymmetric corners or glow rules. */
export const QUIET_CSS = quietPaletteCss() + `
html[data-rift-theme] body { color:var(--rift-text);background:transparent!important; }
html[data-rift-theme] body>#root { background:transparent!important; }
html[data-rift-theme] #root [data-slot='sidebar'],html[data-rift-theme] #root [data-slot='sidebar']>div { background:var(--quiet-pane)!important;border-radius:0;box-shadow:none; }
html[data-rift-theme] #root [data-slot='sidebar'] { border-right:1px solid var(--rift-edge); }
html[data-rift-theme] #root [data-slot='rightbar']>div { background:var(--quiet-pane)!important;border-left:1px solid var(--rift-edge); }
html[data-rift-theme] #root :is([data-slot='conversation.header'],[data-chain-overlay-fallback='conversation.header'])>header {
 background:var(--quiet-pane)!important;border-bottom:1px solid var(--rift-edge);border-radius:0;box-shadow:none;color:var(--rift-text);
}
html[data-rift-theme] #root [data-slot='sidebar'] button { border-radius:8px; }
html[data-rift-theme] #root [data-slot='sidebar'] button[class*='_newSession'] { background:var(--rift-surface);border:1px solid var(--rift-edge);color:var(--rift-text);box-shadow:none; }
html[data-rift-theme] #root [data-slot='sidebar'] button:hover { background-color:var(--rift-hover); }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'] { border-radius:8px; }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem']:hover { background:var(--rift-hover); }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] { background:var(--quiet-selected);color:var(--rift-text);box-shadow:none; }
html[data-rift-theme] #root :has(>[data-slot='sidebar.footer.action']),html[data-rift-theme] #root [data-slot='sidebar.footer.action'] { flex-direction:column;align-items:stretch;min-width:0;max-width:100%;gap:3px; }
html[data-rift-theme] #root [data-slot='sidebar.footer.action']>* { min-width:0;max-width:100%;flex:0 0 auto;box-sizing:border-box; }
html[data-rift-theme] #root :is([data-conversation-scroll],:has(>[data-conversation-scroll])) { background:transparent; }
html[data-rift-theme] #root [data-composer-card='true'] { background:var(--rift-surface)!important;border:1px solid var(--rift-edge)!important;border-radius:14px!important;box-shadow:0 2px 8px rgb(0 0 0 / 4%)!important; }
html[data-rift-theme] #root [data-composer-card='true']:focus-within { border-color:var(--rift-silver)!important; }
html[data-rift-theme] #root [data-composer-card='true'] :is(textarea,[role='textbox'],[data-input-backdrop='true']) { background:transparent!important;color:var(--rift-text); }
html[data-rift-theme] #root [data-composer-card='true'] button { border-radius:8px; }
html[data-rift-theme] #root :is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering'],[data-submission-echo],[data-pending-steering]) [class*='_bubble']:not([role='tooltip']),
html[data-rift-theme] .xiaohei-draft-bubble { background:var(--quiet-message);border:1px solid var(--rift-edge);border-radius:14px;color:var(--rift-text);box-shadow:none; }
html[data-rift-theme] #root [data-chat-flow-kind='assistant-step'] { background:none;border:0;box-shadow:none; }
html[data-rift-theme] #root [data-chat-flow-kind][hidden='until-found'] { padding:0!important;border:0!important;background:none!important;box-shadow:none!important;min-height:0!important; }
html[data-rift-theme] #root [data-chat-flow-kind] pre { border:1px solid var(--rift-edge);border-radius:10px; }
html[data-rift-theme] :is([role='dialog'],[role='menu'],[role='listbox']) { background:var(--rift-surface);color:var(--rift-text);border:1px solid var(--rift-edge);border-radius:12px;box-shadow:0 12px 36px -12px var(--rift-shadow); }
html[data-rift-theme] [role='dialog'] { border-radius:16px; }
html[data-rift-theme] :is([role='menuitem'],[role='option']) { border-radius:6px; }
html[data-rift-theme] :is([role='menuitem'],[role='option']):hover { background:var(--rift-hover); }
html[data-rift-theme] [role='dialog'] :is(input:not([type='radio']):not([type='checkbox']),textarea,select) { border:1px solid var(--rift-edge);border-radius:8px; }
html[data-rift-theme] :is(button,input,textarea,select,[tabindex]):focus-visible { outline:2px solid var(--rift-silver);outline-offset:2px; }
html[data-rift-theme] #root [data-composer-card='true'] :is(textarea,[role='textbox']):focus-visible { outline:none; }
html[data-rift-theme] #root [data-xiaohei-draft-preview] { display:flex;flex-direction:column;align-items:flex-end;width:calc(100% - 48px);max-width:var(--dsh-chat-content-width,748px);margin:0 auto;gap:4px;padding:4px 0 8px; }
.xiaohei-draft-label { font-size:11px; }
.xiaohei-draft-bubble { max-width:82%;max-height:150px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;padding:10px 14px;font-size:14px;line-height:1.65; }
.rift-motion { display:flex;align-items:center;gap:10px;width:100%;min-height:34px;padding:7px 10px;border:0;border-radius:8px;color:var(--rift-muted);background:transparent;cursor:pointer;font:inherit;font-size:12px; }
.rift-motion small { margin-left:auto;font-size:10px; }
.rift-motion[data-wide='false'] { justify-content:center;padding:7px; }
@media(forced-colors:active){html[data-rift-theme] :is([data-slot='sidebar'],[data-composer-card='true'],[role='dialog']){background:Canvas!important;color:CanvasText!important;border-color:CanvasText!important}}
` + RIFT_VIEW_CSS
