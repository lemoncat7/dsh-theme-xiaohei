/** Native slot/ARIA selectors first; rc.2 class suffixes only for structural details without a public hook. */
export const RIFT_UI_CSS = `
html[data-rift-theme] {
 --rift-aura:#a9f3db; --rift-aura-rgb:169 243 219; --rift-glass:rgb(19 30 35 / 94%);
 --rift-plate:linear-gradient(115deg,rgb(169 243 219 / 13%),rgb(25 31 43 / 94%) 48%,rgb(17 23 31 / 97%));
 --rift-rim:rgb(169 243 219 / 40%); --rift-fast:180ms; --rift-open:420ms;
}
html[data-rift-theme][data-xiaohei-appearance='light'] {
 --rift-aura:#246b60; --rift-aura-rgb:36 107 96; --rift-glass:rgb(237 246 240 / 97%);
 --rift-plate:linear-gradient(115deg,rgb(191 221 208 / 92%),rgb(246 248 244 / 98%) 62%,#e7eee8);
 --rift-rim:rgb(36 107 96 / 42%);
}
/* Left boundary: etched silver planes, a spectral seam, and deeply separated project layers. */
html[data-rift-theme] #root [data-slot='sidebar'] > div {
 background:linear-gradient(164deg,rgb(var(--rift-aura-rgb) / 12%),transparent 27%),repeating-linear-gradient(126deg,transparent 0 76px,rgb(var(--rift-aura-rgb) / 3%) 77px,transparent 78px 142px),var(--rift-panel) !important;
 box-shadow:inset -1px 0 var(--rift-rim),inset -5px 0 rgb(var(--rift-aura-rgb) / 5%) !important;
}
html[data-rift-theme] #root [data-slot='sidebar.brand.mark'] .rift-mark { width:38px; height:38px; color:var(--rift-aura); }
.rift-brand strong { font-family:'Noto Serif SC','Songti SC',serif; font-size:22px; letter-spacing:.24em; }
.rift-brand small { color:var(--rift-aura); }
.rift-hero-mark { color:var(--rift-aura); flex:none; overflow:visible; }
.rift-hero-mark path { transition:transform 480ms var(--rift-curve),opacity 480ms; transform-origin:center; }
html[data-rift-focus] .rift-hero-mark__left { transform:translate(-5px,-3px) rotate(-7deg); }
html[data-rift-focus] .rift-hero-mark__right { transform:translate(5px,3px) rotate(7deg); }
html[data-rift-focus] .rift-hero-mark__core { opacity:.55; }
html[data-rift-focus] #root [data-slot='sidebar.brand.mark'] .rift-mark { color:var(--rift-text); }
html[data-rift-theme] #root [data-slot='sidebar'] button[class*='_newSession'] {
 position:relative; background:var(--rift-plate); border:1px solid var(--rift-rim); border-radius:3px 13px 3px 13px;
 box-shadow:inset 0 1px rgb(var(--rift-aura-rgb) / 24%); color:var(--rift-aura);
}
html[data-rift-theme] #root [data-slot='sidebar'] button[class*='_newSession']::after {
 content:''; position:absolute; right:0; top:0; bottom:0; width:38px; pointer-events:none;
 background:linear-gradient(120deg,transparent 30%,rgb(var(--rift-aura-rgb) / 22%) 31%,transparent 33%,transparent 55%,rgb(var(--rift-aura-rgb) / 12%) 56%,transparent 58%);
}
html[data-rift-theme] #root [data-slot='sidebar'] button[class*='_newSession']:hover { box-shadow:inset 0 1px var(--rift-aura),0 0 23px -9px var(--rift-aura); }
html[data-rift-theme] #root [data-slot='sidebar'] button { transition:background-color var(--rift-fast),color var(--rift-fast),box-shadow var(--rift-fast); }
html[data-rift-theme] #root [data-slot='sidebar.panellist'] button:hover { color:var(--rift-aura); box-shadow:inset 3px 0 var(--rift-aura); }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [class*='_sectionHeader'] { border-bottom:1px solid var(--rift-rim); padding-bottom:10px; margin-bottom:9px; }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [class*='_sectionLabel'] { letter-spacing:.16em; color:var(--rift-aura); }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'] {
 position:relative; border:1px solid transparent; margin:3px 0; min-height:36px; box-sizing:border-box;
 border-radius:3px 12px 3px 12px; transition:background-color var(--rift-fast),border-color var(--rift-fast),box-shadow var(--rift-fast);
}
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem']::before {
 content:''; pointer-events:none; position:absolute; left:0; top:7px; bottom:7px; width:3px;
 background:var(--rift-aura); opacity:0; clip-path:polygon(0 16%,100% 0,100% 84%,0 100%); transition:opacity var(--rift-fast);
}
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem']:hover {
 background:radial-gradient(120px circle at var(--rift-pointer-x,25%) var(--rift-pointer-y,50%),rgb(var(--rift-aura-rgb) / 26%),transparent),linear-gradient(90deg,rgb(var(--rift-aura-rgb) / 12%),transparent) !important; border-color:rgb(var(--rift-aura-rgb) / 36%);
}
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem']:hover::before { opacity:.65; }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded='true'] {
 color:var(--rift-aura); background:linear-gradient(90deg,rgb(var(--rift-aura-rgb) / 12%),transparent); border-bottom-color:var(--rift-rim);
}
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded] [class*='_folder'] {
 color:var(--rift-aura); border:1px solid var(--rift-rim); border-radius:3px 7px 3px 7px; background:rgb(var(--rift-aura-rgb) / 8%);
}
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true'] {
 background:var(--rift-plate) !important; color:var(--rift-text); border-color:var(--rift-rim);
 box-shadow:inset 3px 0 var(--rift-aura),0 3px 14px rgb(0 0 0 / 12%) !important; border-radius:3px 12px 3px 12px;
}
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true']::before { opacity:1; }
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true']::after {
 content:''; position:absolute; pointer-events:none; left:14px; right:14px; bottom:-1px; height:1px;
 background:linear-gradient(90deg,transparent,var(--rift-aura),transparent); opacity:.8;
}
html[data-rift-theme] #root [data-slot='sidebar.workspaces'] [class*='_groupSection']:has([aria-expanded='true']) { border-left:1px solid var(--rift-rim); }
/* The footer is a React-owned status instrument, not a second task state machine. */
.rift-resonance { display:flex; align-items:center; gap:9px; color:var(--rift-aura); padding:9px 12px; margin:5px 8px 0; border-top:1px solid var(--rift-rim); font-size:11px; letter-spacing:.12em; }
.rift-resonance__glyph { position:relative; width:16px; height:20px; flex:none; }
.rift-resonance__glyph i { position:absolute; width:3px; background:currentColor; transform:skewY(-35deg); }
.rift-resonance__glyph i:nth-child(1){height:9px;left:0;top:6px}.rift-resonance__glyph i:nth-child(2){height:18px;left:6px;top:0}.rift-resonance__glyph i:nth-child(3){height:10px;left:12px;top:3px}
.rift-resonance__trace { flex:1; height:1px; background:linear-gradient(90deg,var(--rift-aura),transparent); opacity:.5; }
.rift-resonance[data-state='error'] { color:var(--dsw-alias-label-error,#edaaa4); }
.rift-resonance[data-state='waiting'] { color:var(--dsw-alias-label-warning,#c9b67a); }
/* Composer: a split metal vessel. Outer border is obvious even before focus. */
html[data-rift-theme] #root [data-composer-card='true'] {
 border:1px solid var(--rift-rim) !important; border-top:2px solid var(--rift-aura) !important;
 border-radius:4px 24px 4px 24px !important; background:var(--rift-plate) !important;
 box-shadow:0 16px 48px -22px var(--rift-shadow),inset 0 0 0 5px rgb(var(--rift-aura-rgb) / 4%) !important;
}
html[data-rift-theme] #root [data-composer-card='true']::before {
 content:''; position:absolute; pointer-events:none; inset:-7px; border:1px solid var(--rift-rim); border-radius:6px 29px 6px 29px;
 clip-path:polygon(0 0,22% 0,22% 3%,3% 3%,3% 37%,0 37%,0 0,100% 100%,78% 100%,78% 97%,97% 97%,97% 63%,100% 63%,100% 100%);
 opacity:.75; transition:opacity 220ms;
}
html[data-rift-theme] #root [data-composer-card='true']::after {
 left:14%; right:14%; bottom:-2px; width:auto; height:3px; opacity:.75; transform:none;
 background:linear-gradient(90deg,transparent,var(--rift-aura),#f5fcff,var(--rift-aura),transparent); transform-origin:center;
}
html[data-rift-theme] #root [data-composer-card='true']:focus-within {
 border-color:var(--rift-aura) !important; box-shadow:0 0 28px -7px rgb(var(--rift-aura-rgb) / 36%),0 20px 60px -24px var(--rift-shadow),inset 0 0 0 5px rgb(var(--rift-aura-rgb) / 7%) !important;
}
html[data-rift-theme] #root [data-composer-card='true'] [role='textbox'] { color:var(--rift-text); caret-color:var(--rift-aura); background:transparent !important; outline:0; }
html[data-rift-theme] #root [data-composer-card='true'] [class*='_row'] { border-top:1px solid rgb(var(--rift-aura-rgb) / 13%); padding-top:9px; }
html[data-rift-theme] #root [data-composer-card='true'] button { border-radius:4px 10px 4px 10px; }
html[data-rift-theme] #root [data-composer-card='true'] button[class*='_primary']:not(:disabled) { background:var(--rift-aura) !important; color:var(--rift-base); box-shadow:0 0 20px -6px rgb(var(--rift-aura-rgb) / 70%); }
/* Conversation: different structures for outgoing messages, responses and investigation. */
html[data-rift-theme] #root [data-chat-flow-kind='user'] { position:relative; }
html[data-rift-theme] #root :is([data-chat-flow-kind='user'],[data-chat-flow-kind='steering'],[data-submission-echo],[data-pending-steering]) [class*='_bubble']:not([role='tooltip']),
html[data-rift-theme] .xiaohei-draft-bubble {
 border:1px solid var(--rift-rim); border-right:3px solid var(--rift-aura); border-radius:18px 3px 18px 3px;
 background:var(--rift-plate); box-shadow:0 8px 22px -16px #000;
}
html[data-rift-theme] #root [data-chat-flow-kind='assistant-step'] {
 position:relative; border-left:2px solid var(--rift-rim); padding:12px 16px 12px 20px;
 border-radius:0 14px 14px 0; background:linear-gradient(90deg,rgb(var(--rift-aura-rgb) / 6%),transparent 70%);
}
html[data-rift-theme] #root [data-chat-flow-kind='assistant-step']::before {
 content:''; position:absolute; pointer-events:none; left:-4px; top:17px; width:6px; height:18px;
 background:var(--rift-aura); clip-path:polygon(0 25%,100% 0,100% 75%,0 100%);
}
html[data-rift-theme] #root [data-chat-flow-kind='assistant-step']:has(> [data-slot='conversation.chat.node']:empty) { padding:0; border:0; background:none; }
html[data-rift-theme] #root [data-chat-flow-kind='assistant-step']:has(> [data-slot='conversation.chat.node']:empty)::before { display:none; }
html[data-rift-theme] #root [data-chat-flow-kind='assistant-step'] > [data-slot='conversation.chat.node'] > div:first-child { background:transparent; }
html[data-rift-theme] #root [data-chat-flow-kind] pre { border:1px solid var(--rift-edge); border-left:2px solid var(--rift-rim); border-radius:3px 12px 3px 12px; }
html[data-rift-theme] #root [data-chat-flow-kind] blockquote { border-left:2px solid var(--rift-aura); background:rgb(var(--rift-aura-rgb) / 6%); }
html[data-rift-theme] #root [data-chat-flow-kind] :is(details,[data-tool-call]) { border:1px solid var(--rift-rim); border-radius:3px 10px 3px 10px; background:var(--rift-glass); }
html[data-rift-theme] #root :is([data-chat-flow-kind='tool-call'],[data-chat-flow-kind='command'],[data-chat-flow-kind='turn-process']) > [data-slot='conversation.chat.node'] > div:first-child,
html[data-rift-theme] #root [data-chat-flow-kind] [data-variant='others'] {
 padding:7px 10px; border:1px solid var(--rift-rim); border-left-width:3px; border-radius:3px 12px 3px 12px; background:var(--rift-glass);
}
html[data-rift-theme] #root [data-chat-flow-kind] div[data-variant][data-state='running'] { border-left-color:var(--rift-aura); }
html[data-rift-theme] #root [data-chat-flow-kind] div[data-variant][data-state='error'] { border-left-color:var(--dsw-alias-state-error-primary,#edaaa4); }
html[data-rift-theme] #root [data-chat-flow-kind] div[data-variant][data-state='ok'] { border-left-color:var(--rift-edge); }
/* Opposite boundary: right panel opens toward the conversation, not a generic slab. */
html[data-rift-theme] #root [data-slot='rightbar'] > div {
 background:linear-gradient(210deg,rgb(var(--rift-aura-rgb) / 11%),transparent 38%),var(--rift-panel) !important;
 border-left:1px solid var(--rift-rim); box-shadow:inset 5px 0 rgb(var(--rift-aura-rgb) / 5%);
}
html[data-rift-theme] #root [data-slot='rightbar'] [role='tab'][aria-selected='true'] { color:var(--rift-aura); border-bottom:2px solid var(--rift-aura); background:rgb(var(--rift-aura-rgb) / 10%); }
html[data-rift-theme] #root [data-slot='conversation.header'] { border-bottom:1px solid var(--rift-rim); background:linear-gradient(90deg,var(--rift-panel),transparent); }
html[data-rift-theme] :is([role='dialog'],[role='menu'],[role='listbox']) {
 background-image:linear-gradient(125deg,rgb(var(--rift-aura-rgb) / 9%),transparent 40%); border-color:var(--rift-rim);
 border-radius:4px 20px 4px 20px; box-shadow:0 28px 90px -18px var(--rift-shadow),inset 0 2px var(--rift-rim);
}
html[data-rift-theme] :is([role='dialog'],[role='menu'],[role='listbox']) button { border-radius:4px 9px 4px 9px; }
html[data-rift-theme] :is([role='menuitem'],[role='option']):hover { background:rgb(var(--rift-aura-rgb) / 14%); box-shadow:inset 2px 0 var(--rift-aura); }
html[data-rift-theme] [role='dialog'] :is(input:not([type='checkbox']):not([type='radio']),select,textarea) { border:1px solid var(--rift-edge); border-radius:4px 10px 4px 10px; }
/* Localized event fragments. No full-screen flash, no interception of native clicks. */
.rift-impulse { position:fixed; pointer-events:none; z-index:30; color:var(--rift-aura); }
.rift-impulse__edge { position:absolute; inset:-3px; border:1px solid currentColor; border-radius:3px 16px 3px 16px; animation:rift-impulse 900ms var(--rift-curve) both; }
.rift-impulse__shard { position:absolute; width:4px; height:32px; background:currentColor; clip-path:polygon(0 20%,100% 0,100% 80%,0 100%); animation:rift-shard 850ms var(--rift-curve) both; }
.rift-impulse__shard--a { left:-6px; top:10%; --rift-dx:-17px; --rift-dy:-22px; }
.rift-impulse__shard--b { right:-6px; bottom:10%; --rift-dx:17px; --rift-dy:22px; }
@keyframes rift-impulse { from{opacity:.9;transform:scale(.98)} to{opacity:0;transform:scale(1.035)} }
@keyframes rift-shard { from{opacity:.8;transform:translate(0,0)} to{opacity:0;transform:translate(var(--rift-dx),var(--rift-dy))} }
@keyframes rift-reveal { from{opacity:.25} to{opacity:1} }
@keyframes rift-energy { 0%,100%{opacity:.45;transform:scaleY(.7)} 50%{opacity:1;transform:scaleY(1.15)} }
@keyframes rift-travel { 0%{transform:scaleX(.2);opacity:.4} 50%{transform:scaleX(1);opacity:1} 100%{transform:scaleX(.2);opacity:.4} }
@media(prefers-reduced-motion:no-preference) {
 html[data-rift-theme]:not([data-rift-paused]) #root [data-slot='sidebar'] [class*='_wide']:not([class*='_sectionLabel']) { animation:rift-reveal 420ms var(--rift-curve) both; }
 html[data-rift-theme]:not([data-rift-paused]) #root [data-slot='sidebar.workspaces'] [data-row-key^='session:'] { animation:rift-reveal 360ms var(--rift-curve) both; }
 html[data-rift-theme]:not([data-rift-paused]) #root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-selected='true']::after { animation:rift-travel 3.5s ease-in-out 2; }
 html[data-rift-theme]:not([data-rift-paused]) .rift-resonance:is([data-state='thinking'],[data-state='streaming'],[data-state='tool']) i { animation:rift-energy 1.1s ease-in-out infinite; }
 html[data-rift-theme]:not([data-rift-paused]) .rift-resonance i:nth-child(2){animation-delay:140ms}
 html[data-rift-theme]:not([data-rift-paused]) .rift-resonance i:nth-child(3){animation-delay:280ms}
 html[data-rift-theme]:not([data-rift-paused]):is([data-xiaohei-state='thinking'],[data-xiaohei-state='streaming'],[data-xiaohei-state='tool']) #root [data-composer-card='true']::after { animation:rift-travel 1.8s ease-in-out infinite; }
 html[data-rift-theme]:not([data-rift-paused]):is([data-xiaohei-state='thinking'],[data-xiaohei-state='streaming'],[data-xiaohei-state='tool']) #root [data-slot='sidebar.workspaces'] [aria-selected='true']::after { animation:rift-travel 1.8s ease-in-out infinite; }
 html[data-rift-theme]:not([data-rift-paused]) #root [data-slot='rightbar'] > div { animation:rift-reveal 380ms var(--rift-curve); }
}
html[data-rift-paused] .rift-impulse { display:none; }
html[data-rift-paused] .rift-resonance i,html[data-rift-paused] #root [data-slot='sidebar.workspaces'] [role='treeitem']::after { animation:none!important; }
html[data-rift-theme] .rift-motion[data-wide='false'] ~ .rift-resonance { display:none; }
@media(max-width:760px){.rift-impulse{display:none}.rift-resonance{padding:7px;font-size:10px}html[data-rift-theme] #root [data-composer-card='true']::before{inset:-4px}}
@media(prefers-reduced-motion:reduce){.rift-impulse{display:none}html[data-rift-theme] *,html[data-rift-theme] *::before,html[data-rift-theme] *::after{animation:none!important;transition:none!important}}
`
