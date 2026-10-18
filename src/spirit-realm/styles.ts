/** Spirit Realm skin. Decorative paint never contains host controls or dialogs. */
export const SPIRIT_REALM_CSS = `
html {
  --xiaohei-spirit:#7edbbb;--xiaohei-spirit-strong:#b3f3d5;
  --xiaohei-spirit-soft:rgb(111 225 177 / 12%);--xiaohei-edge:rgb(131 222 186 / 22%);
  --xiaohei-sidebar-glass-fill:rgb(9 30 29 / 77%);
  --xiaohei-sidebar-glass-edge:rgb(142 225 195 / 23%);
  --xiaohei-sidebar-glass-highlight:rgb(175 240 205 / 17%);
  --xiaohei-sidebar-glass-radius:22px;
  --xiaohei-workspace-row-active:rgb(107 215 166 / 15%);
  --xiaohei-workspace-row-active-hover:rgb(107 215 166 / 23%);
  --xiaohei-workspace-row-active-edge:rgb(136 232 189 / 28%);
  --xiaohei-composer-edge:rgb(150 218 186 / 22%);
  --xiaohei-composer-edge-focus:rgb(150 238 193 / 58%);
  --xiaohei-composer-focus:rgb(116 220 174 / 10%);
  --xiaohei-conversation-assistant:rgb(17 30 31 / 88%);
  --xiaohei-conversation-user:rgb(26 43 42 / 90%);
  --realm-glow:rgb(121 246 194 / 30%);--realm-caption:#b4ecd7;
}
html[data-xiaohei-appearance='light'] {
  --xiaohei-spirit:#246b56;--xiaohei-spirit-strong:#164d3e;
  --xiaohei-spirit-soft:rgb(25 114 82 / 10%);--xiaohei-edge:rgb(37 105 83 / 25%);
  --xiaohei-sidebar-glass-fill:rgb(231 244 235 / 87%);
  --xiaohei-sidebar-glass-edge:rgb(46 110 83 / 24%);
  --xiaohei-sidebar-glass-highlight:rgb(255 255 255 / 70%);
  --xiaohei-workspace-row-active:rgb(46 128 89 / 14%);
  --xiaohei-workspace-row-active-hover:rgb(46 128 89 / 21%);
  --xiaohei-workspace-row-active-edge:rgb(46 128 89 / 25%);
  --xiaohei-composer-edge:rgb(41 107 74 / 25%);
  --xiaohei-composer-edge-focus:rgb(33 122 78 / 65%);
  --xiaohei-conversation-assistant:rgb(244 249 244 / 92%);
  --xiaohei-conversation-user:rgb(224 239 226 / 94%);
  --realm-glow:rgb(97 181 135 / 20%);--realm-caption:#245d4b;
}
.xiaohei-scene__world { background-position:center!important }
.xh-realm {position:absolute;inset:0;overflow:hidden;pointer-events:none;contain:strict}
.xh-realm canvas {position:absolute;inset:0;width:100%;height:100%;opacity:.85}
.xh-realm__vignette {position:absolute;inset:0;background:linear-gradient(90deg,rgb(3 17 21 / 32%),transparent 35%,transparent 68%,rgb(4 20 22 / 15%))}
html[data-xiaohei-appearance='light'] .xh-realm__vignette {background:linear-gradient(90deg,rgb(231 246 235 / 24%),transparent 40%)}
.xh-realm__island {position:absolute;right:3%;top:12%;width:clamp(180px,min(21vw,28vh),320px);aspect-ratio:1;transform:translate(var(--realm-dx,0px),var(--realm-dy,0px));transition:transform 1.2s ease-out}
.xh-realm__orbit {position:absolute;inset:0;border:1px solid rgb(163 247 213 / 50%);border-radius:50%;transform:rotate(-28deg) scaleY(.68);box-shadow:0 0 24px var(--realm-glow),inset 0 0 18px var(--realm-glow)}
.xh-realm__orbit::after {content:'';position:absolute;inset:12%;border:1px dashed rgb(151 236 207 / 28%);border-radius:50%;animation:xh-realm-orbit 48s linear infinite}
.xh-realm__orbit::before {content:'';position:absolute;inset:-6px;border:2px solid transparent;border-top-color:#9bf1cc;border-bottom-color:rgb(155 241 204 / 35%);border-radius:50%;animation:xh-realm-orbit 28s linear infinite}
.xh-realm__character {position:absolute;inset:-8% -8% 0;transform-origin:50% 80%;animation:xh-realm-breathe 7s ease-in-out infinite;filter:drop-shadow(0 12px 18px rgb(0 13 12 / 35%));mask-image:linear-gradient(#000 83%,transparent 100%)}
.xh-realm__character img {position:absolute;width:100%;height:100%;object-fit:contain;transition:opacity .6s}
.xh-realm__active {opacity:0}
html:is([data-xiaohei-state='thinking'],[data-xiaohei-state='streaming'],[data-xiaohei-state='tool']) .xh-realm__active {opacity:1}
html:is([data-xiaohei-state='thinking'],[data-xiaohei-state='streaming'],[data-xiaohei-state='tool']) .xh-realm__rest {opacity:0}
.xh-realm__caption {position:absolute;top:100%;width:100%;text-align:center;font:500 11px/1.8 system-ui;letter-spacing:.4em;color:var(--realm-caption);text-shadow:0 1px 8px rgb(5 22 15 / 20%)}
.xh-realm__caption small {display:block;font-size:8px;letter-spacing:.25em;opacity:.7}
[id='dsh-theme-xiaohei/sidebar-glass'] {background:radial-gradient(240px circle at var(--realm-light-x,50%) var(--realm-light-y,15%),var(--realm-glow),transparent 75%),var(--xiaohei-sidebar-glass-fill)!important}
[id='dsh-theme-xiaohei/sidebar-glass']::before {content:'';position:absolute;pointer-events:none;right:-85px;top:20%;width:180px;height:380px;border:1px solid var(--xiaohei-edge);border-radius:50%;transform:rotate(26deg);box-shadow:0 0 0 22px rgb(119 200 164 / 3%),0 0 0 44px rgb(119 200 164 / 3%)}
#root [data-slot='sidebar'] [data-row-key][aria-selected='true'] {box-shadow:inset 3px 0 var(--xiaohei-spirit),inset 0 0 0 1px var(--xiaohei-edge);border-radius:10px}
#root [data-slot='sidebar'] button:focus-visible {outline:2px solid var(--xiaohei-spirit);outline-offset:2px}
.xh-realm-brand {display:flex;align-items:center;gap:8px;min-width:0}
.xh-realm-brand__name {display:grid;line-height:1.25;gap:4px}
.xh-realm-brand__name strong {font-size:16px;letter-spacing:.12em;font-weight:650}
.xh-realm-brand__name small {font-size:9px;letter-spacing:.16em;color:var(--xiaohei-spirit)}
#root .xh-realm-motion {display:flex;align-items:center;gap:10px;flex-shrink:0;width:100%;min-height:32px;padding:6px 10px;border-radius:10px;border:1px solid transparent;color:var(--xiaohei-spirit-strong);background:transparent;font-size:12px;cursor:pointer}
#root .xh-realm-motion small {margin-left:auto;font-size:10px;border:1px solid var(--xiaohei-edge);border-radius:5px;padding:0 5px}
#root .xh-realm-motion[data-wide='false'] {width:32px;justify-content:center;padding:6px}
#root .xh-realm-motion:hover {background:var(--xiaohei-workspace-row-active-hover)}
@keyframes xh-realm-orbit {to{transform:rotate(360deg)}}
@keyframes xh-realm-breathe {0%,100%{transform:translateY(0) rotate(-.4deg)}50%{transform:translateY(-4px) rotate(.4deg)}}
html[data-xh-realm-paused] .xh-realm *,html[data-xh-realm-paused] .xh-realm *::before,html[data-xh-realm-paused] .xh-realm *::after {animation-play-state:paused!important;transition:none!important}
@media(max-width:1100px){.xh-realm__island{right:-48px;top:22%;width:190px;opacity:.5}.xh-realm__caption{display:none}}
@media(max-width:700px){.xh-realm__island{display:none}.xh-realm canvas{opacity:.45}}
@media(prefers-reduced-motion:reduce){.xh-realm *, .xh-realm *::before,.xh-realm *::after{animation:none!important;transition:none!important}}
@media(forced-colors:active){.xh-realm{display:none}.xh-realm-motion{border:1px solid ButtonText!important}}
@media(pointer:coarse){#root .xh-realm-motion{min-height:44px}}
`
