/** The artwork is a separate scene, not a light-mode surface. Shared with first paint. */
export const RIFT_SCENE_BASE = '#101820'
export const RIFT_SCENE_SCRIM = 'linear-gradient(90deg,rgb(10 19 24 / 66%),rgb(10 19 24 / 28%) 36%,transparent 70%),linear-gradient(0deg,rgb(8 17 23 / 50%),transparent 24%)'
export const RIFT_LIGHT_SCENE_BASE = '#e4ede9'
export const RIFT_LIGHT_SCENE_SCRIM = 'linear-gradient(90deg,rgb(247 251 248 / 20%),transparent 66%),linear-gradient(0deg,rgb(238 246 242 / 12%),transparent 24%)'
export const RIFT_LIGHT_BUBBLE = 'linear-gradient(90deg,rgb(249 252 249 / 62%) 0%,rgb(249 252 249 / 46%) 42%,rgb(249 252 249 / 16%) 76%,rgb(249 252 249 / 0%) 100%)'
export const RIFT_LIGHT_USER_BUBBLE = 'linear-gradient(90deg,rgb(228 241 232 / 72%) 0%,rgb(246 251 247 / 50%) 42%,rgb(246 251 247 / 18%) 76%,rgb(246 251 247 / 0%) 100%)'
export const RIFT_SCENE_CSS = `
.rift-scene { position:fixed; inset:0; z-index:0; overflow:hidden; pointer-events:none; background:${RIFT_SCENE_BASE}; }
.rift-scene[data-artwork='loading'] { visibility:hidden; }
.rift-scene > img,.rift-scene > canvas { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:right center; }
.rift-scene > canvas { opacity:0; }
.rift-scene[data-renderer='webgl'] > canvas { opacity:1; }
.rift-scene::after { content:''; position:absolute; inset:0; background:${RIFT_SCENE_SCRIM}; }
.rift-signature { position:absolute; right:32px; bottom:24px; z-index:1; color:#e7f5ef; text-align:right; font:10px/1.7 ui-monospace,monospace; letter-spacing:.24em; text-shadow:0 1px 10px #071519; }
.rift-signature strong { display:block; font-size:17px; font-weight:400; letter-spacing:.42em; }
/* Only the freestanding home title sits directly on artwork; controls stay native light/dark. */
html[data-rift-theme] #root [class*='_headline']:has([data-slot='conversation.hero.brand.mark']) {
 --dsw-alias-label-primary:#edf7f2; --dsw-alias-label-secondary:#d2e6df;
 color:#edf7f2; text-shadow:0 2px 12px #08181d;
 background:radial-gradient(ellipse at center,rgb(9 22 28 / 78%),rgb(9 22 28 / 0%) 74%);
}
html[data-rift-theme] #root [data-slot='conversation.hero.brand.mark'] .rift-hero-mark { color:#a9f3db; }
html[data-rift-theme] #root [class*='_heroWorkspaceRow'] {
 align-self:flex-start; max-width:100%; box-sizing:border-box; padding:6px 10px;
 border:1px solid var(--rift-rim); border-radius:3px 10px 3px 10px; background:var(--rift-panel);
}
html[data-rift-theme] .xiaohei-draft-label { color:#dbece4; text-shadow:0 1px 5px #071519; }
/* Slot wrappers use display:contents; paint the real header, not its slot. */
html[data-rift-theme] #root [data-slot='conversation.header'] > header { background:var(--rift-panel); }
/* A separate daylight illustration, not a dark scene bleached by an overlay. */
html[data-xiaohei-appearance='light'] .rift-scene { background:${RIFT_LIGHT_SCENE_BASE}; }
html[data-xiaohei-appearance='light'] .rift-scene::after { background:${RIFT_LIGHT_SCENE_SCRIM}; }
html[data-xiaohei-appearance='light'] .rift-signature { color:#315b54; text-shadow:0 1px 8px rgb(255 255 255 / 60%); }
html[data-rift-theme][data-xiaohei-appearance='light'] #root [class*='_headline']:has([data-slot='conversation.hero.brand.mark']) {
 --dsw-alias-label-primary:#253e40; --dsw-alias-label-secondary:#3c4e50;
 color:#253e40; text-shadow:0 1px 12px rgb(255 255 255 / 65%); background:none;
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-slot='conversation.hero.brand.mark'] .rift-hero-mark { color:#246b60; }
html[data-rift-theme][data-xiaohei-appearance='light'] .xiaohei-draft-label { color:#3c4e50; text-shadow:none; }
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-conversation-scroll]:has([data-chat-flow-kind]) {
 background:transparent; color:#242832; --dsw-alias-label-primary:#242832; --dsw-alias-label-secondary:#3c4e50; --dsw-alias-label-tertiary:#3c4e50;
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind] {
 --rift-muted:#24342e;
 --rift-glass:rgb(244 250 246 / 68%); --rift-plate:${RIFT_LIGHT_USER_BUBBLE};
 color:var(--rift-text); --dsw-alias-label-primary:var(--rift-text); --dsw-alias-label-secondary:var(--rift-muted); --dsw-alias-label-tertiary:var(--rift-muted);
 --dsw-alias-label-primary-bluish:var(--rift-text); --dsw-alias-label-primary-dimmed:var(--rift-muted);
 --dsw-alias-label-caption:var(--rift-muted); --dsw-alias-label-dimmed:var(--rift-muted);
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind] .dsh-knowledge-writeback-notice {
 --knowledge-text-primary:#242832; --knowledge-text-secondary:#24342e; --knowledge-text-tertiary:#24342e;
 --knowledge-border:rgb(36 107 96 / 30%); --knowledge-control:rgb(244 250 246 / 85%);
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-slot='conversation.composer'] {
 color:var(--rift-text); --dsw-alias-label-primary:var(--rift-text); --dsw-alias-label-secondary:var(--rift-muted); --dsw-alias-label-tertiary:#606b7a;
}
/* Scope the clearer glass to conversation surfaces; menus and sidebar keep
   their solid reading palette. No screen-sized blur or milky overlay. */
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-composer-card='true'] {
 --rift-plate:linear-gradient(115deg,rgb(228 241 232 / 72%),rgb(248 252 249 / 66%));
 --rift-muted:#24342e; --dsw-alias-label-secondary:#24342e; --dsw-alias-label-tertiary:#24342e;
 box-shadow:0 12px 32px -24px var(--rift-shadow),inset 0 0 0 1px rgb(255 255 255 / 20%) !important;
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind='user'] [class*='_actions'] {
 --dsw-alias-label-secondary:#3c4e50; --dsw-alias-label-tertiary:#3c4e50;
 color:#3c4e50; background:rgb(244 250 246 / 80%); border-radius:5px;
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind]:not([data-chat-flow-kind='user']):not([data-chat-flow-kind='assistant-step']):not(:has(> [data-slot='conversation.chat.node']:empty)) {
 background:transparent;
}
/* Only the content receives a local reading surface; the scroll area stays clear. */
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind]:not([data-chat-flow-kind='user']):not([data-chat-flow-kind='assistant-step']) > [data-slot='conversation.chat.node'] > :first-child {
 background:rgb(244 250 246 / 68%); border-radius:3px 10px 3px 10px;
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind='assistant-step']:not(:has(> [data-slot='conversation.chat.node']:empty)) {
 background:${RIFT_LIGHT_BUBBLE}; box-shadow:none;
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind] :is(pre,code) {
 color:#242832; background-color:rgb(232 240 235 / 72%);
}
html[data-rift-theme][data-xiaohei-appearance='light'] :is([data-submission-echo],[data-pending-steering],.xiaohei-draft-bubble) {
 --rift-plate:${RIFT_LIGHT_USER_BUBBLE};
 color:#242832; --dsw-alias-label-primary:#242832; --dsw-alias-label-secondary:#3c4e50;
}
/* Fade paint only, never the bubble element: text, links and selection remain
   fully opaque. Remove the outgoing bubble's hard right rim and cast shadow. */
html[data-rift-theme][data-xiaohei-appearance='light'] #root :is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering'],[data-submission-echo],[data-pending-steering]) [class*='_bubble'],
html[data-rift-theme][data-xiaohei-appearance='light'] .xiaohei-draft-bubble {
 border-color:transparent; border-left-color:var(--rift-rim); box-shadow:none;
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root :is([data-chat-flow-kind='assistant-step'],[data-chat-flow-kind='user'],[data-chat-flow-kind='steering'],[data-submission-echo],[data-pending-steering]),
html[data-rift-theme][data-xiaohei-appearance='light'] .xiaohei-draft-bubble {
 -webkit-text-stroke:2px rgb(249 252 249 / 90%); paint-order:stroke fill; text-shadow:none;
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind] :is(pre,code,button) { -webkit-text-stroke:0; text-shadow:none; }
/* A fully transparent right edge cannot guarantee contrast over all artwork.
   Honor the explicit increased-contrast preference with the solid fallback. */
@media(prefers-contrast:more){
 html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind='assistant-step']:not(:has(> [data-slot='conversation.chat.node']:empty)) { background:rgb(249 252 249 / 94%); -webkit-text-stroke:0; text-shadow:none; }
 html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-chat-flow-kind],
 html[data-rift-theme][data-xiaohei-appearance='light'] :is([data-submission-echo],[data-pending-steering],.xiaohei-draft-bubble) { --rift-plate:rgb(246 251 247 / 94%); -webkit-text-stroke:0; text-shadow:none; }
}
@media(max-width:760px){
 .rift-signature { display:none; }
 .rift-scene > img { object-position:78% center; }
 .rift-scene > canvas { display:none; }
}
@media(forced-colors:active){.rift-scene{display:none}}
`
