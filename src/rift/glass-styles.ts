/** Two bounded decorative panes. Never filter a native menu/dialog ancestor. */
const panes = `html[data-rift-theme] #root [data-slot='sidebar'] > div,
html[data-rift-theme] #root :is([data-slot='conversation.header'],[data-chain-overlay-fallback='conversation.header']) > header`
const glass = panes.split(',\n').map(selector=>`${selector}::before`).join(',\n')
export const RIFT_GLASS_CSS = `
html[data-rift-theme] {
 --rift-nav-pane:linear-gradient(155deg,rgb(36 48 66 / 86%),rgb(24 33 49 / 80%) 52%,rgb(28 39 56 / 84%));
 --rift-glass-highlight:rgb(230 243 255 / 12%);
}
html[data-rift-theme][data-xiaohei-appearance='light'] {
 --rift-nav-pane:linear-gradient(155deg,rgb(242 248 255 / 86%),rgb(225 237 252 / 80%) 52%,rgb(236 245 255 / 84%));
 --rift-glass-highlight:rgb(255 255 255 / 68%);
}
html[data-rift-theme] #root [data-slot='sidebar'] {
 background:transparent; box-shadow:none;
 --rift-aura:#b2d7ff; --rift-aura-rgb:178 215 255;
 --rift-rim:rgb(var(--rift-aura-rgb) / 40%); --rift-plate:var(--rift-nav-pane);
}
html[data-rift-theme][data-xiaohei-appearance='light'] #root [data-slot='sidebar'] {
 --rift-aura:#315d8a; --rift-aura-rgb:49 93 138;
}
${panes} { position:relative; border-radius:16px!important; background:var(--rift-nav-pane)!important; box-shadow:inset 0 1px var(--rift-glass-highlight),inset 0 0 0 1px rgb(var(--rift-aura-rgb) / 16%)!important; }
${glass} {
 content:''; position:absolute; inset:0; z-index:-1; pointer-events:none; border-radius:inherit;
 -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px);
 background:linear-gradient(130deg,rgb(255 255 255 / 4%),transparent 45%);
}
@media(prefers-reduced-transparency:reduce),(prefers-contrast:more){
 ${glass} { -webkit-backdrop-filter:none; backdrop-filter:none; }
 ${panes} { background:var(--rift-panel)!important; }
}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
 ${panes} { background:var(--rift-panel)!important; }
}
@media(forced-colors:active){
 ${glass} { display:none; }
 ${panes} { background:Canvas!important; box-shadow:none!important; }
}
`
