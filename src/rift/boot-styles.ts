import { RIFT_FLOW_IMAGE } from './boot-flow.js'
/** Native loading lifetime owns the effect: no fake progress, timer or second overlay. */
export const RIFT_BOOT_LOADING_CSS = `
div:has(> [data-dsh-boot-spinner]) {
 position:relative; width:min(680px,92vw); padding:24px 0!important;
 border:0!important; border-radius:0!important; background:none!important; box-shadow:none!important;
 color:var(--rift-boot-text)!important; text-align:center;
}
div:has(> [data-dsh-boot-spinner]) > :first-child:not([data-dsh-boot-spinner]) {
 font-size:11px!important; letter-spacing:.42em!important;
}
div:has(> [data-dsh-boot-spinner]) > :first-child:not([data-dsh-boot-spinner])::before {
 content:'界隙'; display:block; margin:0 0 12px .42em;
 font:28px/1.4 'Noto Serif SC','Songti SC',serif; letter-spacing:.42em;
}
[data-dsh-boot-spinner] {
 position:relative!important; width:100%!important; height:260px!important;
 margin:20px auto 26px!important; border:0!important; border-radius:0!important;
 background:linear-gradient(100deg,transparent 12%,#81bdff 38%,#f2fbff 50%,#81bdff 62%,transparent 88%) center/60% 2px no-repeat,
 radial-gradient(ellipse 32% 12% at center,rgb(186 226 255 / 60%),rgb(89 167 247 / 18%) 50%,transparent 100%)!important;
 animation:rift-flow-arrive 650ms cubic-bezier(.16,1,.3,1) both!important;
 mask:none!important; -webkit-mask:none!important; box-shadow:none!important;
 overflow:hidden; pointer-events:none;
}
[data-dsh-boot-spinner]::before,[data-dsh-boot-spinner]::after {
 content:''!important; position:absolute!important; pointer-events:none; inset:0!important;
 width:auto!important; border:0!important; border-radius:0!important;
 background:url('${RIFT_FLOW_IMAGE}') center/100% 100% no-repeat!important;
 mask:none!important; -webkit-mask:none!important; box-shadow:none!important;
 animation:rift-flow-in 2.8s cubic-bezier(.22,.61,.36,1) infinite;
}
[data-dsh-boot-spinner]::after { animation-name:rift-flow-return; animation-delay:-1.4s; }
div:has(> [data-dsh-boot-spinner]) > [data-dsh-boot-spinner] + * {
 display:table; max-width:100%; box-sizing:border-box; margin:0 auto!important;
 padding:8px 16px; border-radius:8px; font-size:12px!important; letter-spacing:.08em;
 color:var(--rift-boot-text)!important; opacity:1!important;
 background:color-mix(in srgb,var(--rift-boot-base) 90%,transparent);
}
@keyframes rift-flow-arrive { from { opacity:0; transform:scaleX(.45); } to { opacity:1; transform:scaleX(1); } }
@keyframes rift-flow-in {
 0% { transform:translateX(-14%) scaleY(1.1); opacity:0; }
 24% { opacity:1; }
 76% { opacity:.85; }
 100% { transform:translateX(15%) scaleY(.36); opacity:0; }
}
@keyframes rift-flow-return {
 0% { transform:rotate(180deg) translateX(-14%) scaleY(1.1); opacity:0; }
 24% { opacity:1; }
 76% { opacity:.85; }
 100% { transform:rotate(180deg) translateX(15%) scaleY(.36); opacity:0; }
}
@media(prefers-reduced-motion:reduce) { [data-dsh-boot-spinner],[data-dsh-boot-spinner]::before,[data-dsh-boot-spinner]::after { animation:none!important; } }
@media(prefers-reduced-motion:reduce) { [data-dsh-boot-spinner]::after { transform:rotate(180deg); } }
@media(forced-colors:active) {
 div:has(> [data-dsh-boot-spinner]) { color:CanvasText!important; }
 [data-dsh-boot-spinner]::before,[data-dsh-boot-spinner]::after { box-shadow:none; border:1px solid CanvasText!important; }
}
`
