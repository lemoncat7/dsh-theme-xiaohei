/** Shared by the server first paint and mounted UI; quiet modes retain readable paired colors. */
export const RIFT_QUIET_DARK = '--rift-quiet-base:#19212d;--rift-quiet-glow:radial-gradient(ellipse at 90% 0%,#2a3b53 0%,transparent 65%),linear-gradient(135deg,#19212d,#202c3b)'
export const RIFT_QUIET_LIGHT = '--rift-quiet-base:#f2f5f9;--rift-quiet-glow:radial-gradient(ellipse at 90% 0%,#dbe8f7 0%,transparent 65%),linear-gradient(135deg,#f5f7fb,#e9eff7)'
export const RIFT_VIEW_CSS = `
html[data-xiaohei-appearance='dark'] { ${RIFT_QUIET_DARK}; }
html[data-xiaohei-appearance='light'] { ${RIFT_QUIET_LIGHT}; }
html:is([data-rift-view='gradient'],[data-rift-view='solid']) {
 background:var(--rift-quiet-base)!important;
}
html[data-rift-view='gradient'] { background:var(--rift-quiet-glow) fixed!important; }
html:is([data-rift-view='gradient'],[data-rift-view='solid']) body { background:transparent!important; }
html:is([data-rift-view='gradient'],[data-rift-view='solid']) :is(.rift-scene,.rift-resonance,.rift-mark,.rift-hero-mark,.xiaohei-bloub,.rift-impulse) { display:none!important; }
html:is([data-rift-view='gradient'],[data-rift-view='solid']) .rift-brand :is(strong,small) { display:none; }
html:is([data-rift-view='gradient'],[data-rift-view='solid']) .rift-brand::after { content:'工作台';font-size:16px;letter-spacing:.04em;font-weight:550; }
html:is([data-rift-view='gradient'],[data-rift-view='solid']) .xiaohei-draft-label { color:var(--rift-muted);text-shadow:none; }
html:is([data-rift-view='gradient'],[data-rift-view='solid']) [data-dsh-boot-spinner]::before,
html:is([data-rift-view='gradient'],[data-rift-view='solid']) [data-dsh-boot-spinner]::after { display:none!important; }
html:is([data-rift-view='gradient'],[data-rift-view='solid']) [data-dsh-boot-spinner] { display:none!important; }
html:is([data-rift-view='gradient'],[data-rift-view='solid']) div:has(> [data-dsh-boot-spinner]) > :first-child:not([data-dsh-boot-spinner])::before { content:'工作台';font:500 20px/1.5 system-ui;letter-spacing:.08em; }
.rift-view-panel { width:min(392px,calc(100vw - 32px));max-height:calc(100dvh - 48px);padding:0;border:1px solid var(--rift-edge);border-radius:18px;background:var(--rift-surface);color:var(--rift-text);box-shadow:0 24px 80px -18px var(--rift-shadow); }
.rift-view-panel::backdrop { background:rgb(10 18 30 / 36%); }
.rift-view-content { padding:20px; }
.rift-view-heading { display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:6px; }
.rift-view-heading h2 { font-size:16px;margin:0;font-weight:600; }
.rift-view-close { display:grid;place-items:center;width:32px;height:32px;padding:0;border:0;background:transparent;color:var(--rift-muted);border-radius:8px;cursor:pointer; }
.rift-view-close:hover { background:var(--rift-hover); }
.rift-view-hint { color:var(--rift-muted);font-size:12px;line-height:1.6;margin:0 0 16px; }
.rift-view-options { display:grid;gap:8px;border:0;padding:0;margin:0;min-width:0; }
.rift-view-option { display:flex;align-items:center;gap:12px;padding:12px;border:1px solid var(--rift-edge);border-radius:12px;cursor:pointer; }
.rift-view-option:has(input:checked) { border-color:var(--rift-silver);background:var(--rift-hover); }
.rift-view-option input { margin:0;accent-color:var(--rift-silver);width:16px;height:16px;flex-shrink:0; }
.rift-view-option strong { display:block;font-size:13px;font-weight:550; }
.rift-view-option small { display:block;font-size:11px;color:var(--rift-muted);margin-top:4px;line-height:1.5; }
.rift-view-motion { display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px;padding-top:14px;border-top:1px solid var(--rift-edge);font-size:12px; }
.rift-view-motion input { width:16px;height:16px;accent-color:var(--rift-silver); }
.rift-view-motion:has(input:disabled) { opacity:.55; }
@media(forced-colors:active){.rift-view-option:has(input:checked){outline:2px solid Highlight}}
`
