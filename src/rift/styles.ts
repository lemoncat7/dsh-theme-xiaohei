import { RIFT_UI_CSS } from './ui-styles.js'
import { RIFT_SCENE_CSS } from './scene-styles.js'
export const RIFT_STYLE_ID = 'dsh-theme-xiaohei/rift-style'
export const RIFT_CSS = `
html[data-rift-theme] {
  --rift-base:#101218; --rift-surface:#20242d; --rift-panel:rgb(29 33 42 / 96%);
  --rift-text:#ecebe7; --rift-muted:#bac0ca; --rift-edge:rgb(200 214 234 / 18%);
  --rift-silver:#d1dbe8; --rift-hover:rgb(209 219 232 / 9%); --rift-input:rgb(28 33 43 / 96%);
  --rift-read:rgb(16 18 24 / 81%); --rift-shadow:rgb(0 0 0 / 26%);
  --rift-curve:cubic-bezier(.2,.75,.25,1); color-scheme:dark;
  background:var(--rift-base); color:var(--rift-text);
}
html[data-rift-theme][data-xiaohei-appearance='light'] {
  --rift-base:#e9e9e6; --rift-surface:#f6f5f2; --rift-panel:rgb(246 245 242 / 98%);
  --rift-text:#242832; --rift-muted:#4f5867; --rift-edge:rgb(57 69 88 / 20%);
  --rift-silver:#46556d; --rift-hover:rgb(70 85 109 / 8%); --rift-input:rgb(250 249 246 / 98%);
  --rift-read:rgb(243 243 240 / 94%); --rift-shadow:rgb(25 32 46 / 12%); color-scheme:light;
}
html[data-rift-theme] body { background:transparent !important; color:var(--rift-text); }
html[data-rift-theme] body > #root { position:relative; z-index:1; background:transparent !important; }
html[data-rift-theme] #root :has(> [data-slot='sidebar']) { background:transparent !important; border-right:1px solid var(--rift-edge); }
html[data-rift-theme] #root [data-slot='sidebar'] { background:var(--rift-panel); }
html[data-rift-theme] #root [data-slot='sidebar'] > div { background:var(--rift-panel) !important; border:0; box-shadow:inset 3px 0 var(--rift-edge); }
/* Inset silver seam. No filter, transform or containment on a fixed-dialog ancestor. */
html[data-rift-theme] #root [data-slot='sidebar'] { background-image:linear-gradient(110deg,transparent 65%,var(--rift-hover)); box-shadow:inset 3px 0 var(--rift-edge); }
.rift-brand { display:inline-flex; align-items:baseline; gap:10px; text-align:left; white-space:nowrap; line-height:24px; }
.rift-brand strong { font-size:19px; font-weight:550; letter-spacing:.18em; line-height:1.2; }
.rift-brand small { color:var(--rift-muted); font-size:10px; letter-spacing:.16em; }
.rift-mark { display:block; flex-shrink:0; color:var(--rift-silver); }
html[data-rift-theme] #root [data-slot='sidebar'] button { border-radius:8px; }
html[data-rift-theme] #root [data-slot='sidebar'] button:hover { background-color:var(--rift-hover); }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='tree'] { scrollbar-width:thin; scrollbar-color:transparent transparent; }
html[data-rift-theme] #root [data-slot='sidebar.workspaces']:hover [role='tree'] { scrollbar-color:var(--rift-edge) transparent; }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [aria-selected='true'] { box-shadow:inset 2px 0 var(--rift-silver); border-radius:6px; }
/* rc.2 footer contributions must stack, including Knowledge and remote-control buttons. */
html[data-rift-theme] #root [data-slot='sidebar'] :has(> [data-slot='sidebar.footer.action']),
html[data-rift-theme] #root [data-slot='sidebar.footer.action'] { flex-direction:column; align-items:stretch; min-width:0; max-width:100%; gap:3px; }
html[data-rift-theme] #root [data-slot='sidebar.footer.action'] > * { min-width:0; max-width:100%; flex:0 0 auto; box-sizing:border-box; }
.rift-motion { display:flex; align-items:center; gap:10px; width:100%; min-height:34px; padding:7px 10px; border:1px solid transparent; border-radius:8px; color:var(--rift-muted); background:transparent; cursor:pointer; font:inherit; font-size:12px; }
.rift-motion small { margin-left:auto; font-size:10px; opacity:.85; }
.rift-motion[data-wide='false'] { justify-content:center; padding:7px; }
html[data-rift-theme] #root :has(> [data-conversation-scroll]) { background:transparent; }
html[data-rift-theme] #root [data-conversation-scroll] { background:transparent; }
html[data-rift-theme] #root [data-conversation-scroll]:has([data-chat-flow-kind]) { background:linear-gradient(90deg,var(--rift-read),var(--rift-read) 62%,transparent); }
html[data-rift-theme] #root [data-chat-flow-kind='assistant-step'] { border-left:1px solid var(--rift-edge); padding-left:16px; }
html[data-rift-theme] #root [data-chat-flow-kind='user'] { color:var(--rift-text); }
html[data-rift-theme] #root [data-chat-flow-kind='user'] > div:first-child,
html[data-rift-theme] #root div[data-submission-echo] { border-radius:16px 5px 16px 16px; }
html[data-rift-theme] #root [data-slot='conversation.session.header'] { background:var(--rift-panel); border-bottom:1px solid var(--rift-edge); }
html[data-rift-theme] #root [data-composer-card='true'] {
  position:relative; border:1px solid var(--rift-edge) !important; border-radius:16px 16px 6px 16px !important;
  background:var(--rift-input) !important; box-shadow:0 12px 40px -16px var(--rift-shadow),inset 0 1px rgb(255 255 255 / 8%) !important;
  transition:border-color 160ms ease,box-shadow 200ms ease;
}
html[data-rift-theme] #root [data-composer-card='true']:focus-within { border-color:var(--rift-silver) !important; box-shadow:0 0 0 3px var(--rift-hover),0 12px 40px -16px var(--rift-shadow) !important; }
html[data-rift-theme] #root [data-composer-card='true']::after { content:''; pointer-events:none; position:absolute; bottom:-1px; right:20px; width:46px; height:2px; background:var(--rift-silver); transform-origin:right; opacity:.55; }
html[data-rift-theme][data-xiaohei-state='thinking'] #root [data-composer-card='true']::after,
html[data-rift-theme][data-xiaohei-state='streaming'] #root [data-composer-card='true']::after,
html[data-rift-theme][data-xiaohei-state='tool'] #root [data-composer-card='true']::after { animation:rift-line 2.6s ease-in-out infinite; }
html[data-rift-theme] #root [data-composer-card='true'] textarea { color:var(--rift-text); background:transparent !important; border:0; box-shadow:none; }
html[data-rift-theme] #root [data-composer-card='true'] [data-input-backdrop='true'] { background:transparent !important; }
html[data-rift-theme] #root [data-composer-card='true'] button { border-radius:8px; }
html[data-rift-theme] #root [data-composer-card='true'] button:not(:disabled):hover { background-color:var(--rift-hover); }
html[data-rift-theme] #root [data-xiaohei-draft-preview] { display:flex; flex-direction:column; align-items:flex-end; width:calc(100% - 80px); max-width:var(--dsh-chat-content-width,748px); margin:0 auto; gap:4px; padding:4px 0 8px; }
html[data-rift-theme] .xiaohei-draft-label { font-size:11px; color:var(--rift-muted); }
html[data-rift-theme] .xiaohei-draft-bubble { max-width:82%; max-height:150px; overflow:auto; white-space:pre-wrap; overflow-wrap:anywhere; padding:10px 14px; border:1px dashed var(--rift-edge); border-radius:14px 4px 14px 14px; background:var(--rift-input); color:var(--rift-text); font-size:14px; line-height:1.65; }
html[data-rift-theme] :is([role='dialog'],[role='menu'],[role='listbox']) { color:var(--rift-text); background-color:var(--rift-surface) !important; border:1px solid var(--rift-edge); box-shadow:0 24px 80px -18px var(--rift-shadow); border-radius:14px; }
html[data-rift-theme] [role='dialog'] { border-radius:18px; }
html[data-rift-theme] :is([role='menuitem'],[role='option']) { border-radius:6px; }
html[data-rift-theme] :is([role='menuitem'],[role='option']):hover { background-color:var(--rift-hover); }
html[data-rift-theme] :is(button,input,textarea,select,[tabindex]):focus-visible { outline:2px solid var(--rift-silver); outline-offset:3px; }
html[data-rift-theme] #root [data-composer-card='true'] textarea:focus-visible { outline:0; }
html[data-rift-theme] :is(input,select,textarea) { accent-color:var(--rift-silver); }
@keyframes rift-line { 0%,100% { transform:scaleX(.55); opacity:.35; } 50% { transform:scaleX(1.7); opacity:1; } }
@media (prefers-reduced-motion:no-preference) {
  html[data-rift-theme] :is([role='menuitem'],[role='option'],.rift-motion) { transition:background-color 140ms ease,color 140ms ease; }
  html[data-rift-theme] [role='dialog'] { animation:rift-panel 190ms var(--rift-curve); }
  @keyframes rift-panel { from { opacity:.5; translate:0 7px; } to { opacity:1; translate:0 0; } }
}
html[data-rift-paused] #root [data-composer-card='true']::after { animation:none !important; }
@media (max-width:760px) {
  html[data-rift-theme] #root [data-conversation-scroll]:has([data-chat-flow-kind]) { background:var(--rift-read); }
  html[data-rift-theme] #root [data-xiaohei-draft-preview] { width:calc(100% - 48px); }
}
@media (prefers-reduced-motion:reduce) { html[data-rift-theme] *,html[data-rift-theme] *::after { animation:none !important; transition:none !important; } }
@media (forced-colors:active) { .rift-scene { display:none; } html[data-rift-theme] #root [data-slot='sidebar'] { background:Canvas; } }
` + RIFT_UI_CSS + RIFT_SCENE_CSS

export function installRiftChrome(doc: Document | undefined = typeof document === 'undefined' ? undefined : document): () => void {
  if (!doc) return () => {}
  const style = doc.createElement('style'); style.id = RIFT_STYLE_ID; style.textContent = RIFT_CSS
  doc.documentElement.setAttribute('data-rift-theme', ''); doc.head.append(style)
  return () => { style.remove(); doc.documentElement.removeAttribute('data-rift-theme') }
}
