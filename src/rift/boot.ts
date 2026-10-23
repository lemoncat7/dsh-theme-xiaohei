import { RIFT_SCENE_IMAGE, RIFT_LIGHT_SCENE_IMAGE } from './assets.js'
import { RIFT_BOOT_LOADING_CSS } from './boot-styles.js'
import { RIFT_VIEW_BOOT } from './view.js'
import { RIFT_VIEW_CSS, RIFT_QUIET_DARK, RIFT_QUIET_LIGHT } from './view-styles.js'
import { quietPaletteCss } from './quiet-palette.js'
import { RIFT_SCENE_BASE, RIFT_SCENE_SCRIM, RIFT_LIGHT_SCENE_BASE, RIFT_LIGHT_SCENE_SCRIM } from './scene-styles.js'
export const RIFT_BOOT_ID='dsh-theme-xiaohei/rift-boot'
/** Read only the official, literal bootstrap preference. Never evaluate page code. */
export function bootPreference(html:string):'light'|'dark'|'system' {
  for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)){
    const script=match[1]||''
    if(!script.includes('document.documentElement.dataset.dsThemeSource = preference')||!script.includes("document.body.toggleAttribute('data-ds-dark-theme', dark)"))continue
    const preference=/\bconst preference\s*=\s*["'](light|dark|system)["']/.exec(script)?.[1]
    if(preference==='light'||preference==='dark'||preference==='system')return preference
  }
  return 'system'
}
/** Early wallpaper and native loader styling; one bounded read of local presentation preference. */
export function injectRiftBoot(html:string):string{
  if(html.includes(`id="${RIFT_BOOT_ID}"`))return html
  const preference=bootPreference(html)
  const light=`color-scheme:light!important;--rift-boot-image:var(--rift-boot-light);--rift-boot-base:${RIFT_LIGHT_SCENE_BASE};--rift-boot-scrim:${RIFT_LIGHT_SCENE_SCRIM};--rift-boot-text:#242832`
  const dark=`color-scheme:dark!important;--rift-boot-image:var(--rift-boot-dark);--rift-boot-base:${RIFT_SCENE_BASE};--rift-boot-scrim:${RIFT_SCENE_SCRIM};--rift-boot-text:#ecebe7`
  const style=`<script>${RIFT_VIEW_BOOT}</script><style id="${RIFT_BOOT_ID}" data-preference="${preference}">
  html{--rift-boot-dark:url('${RIFT_SCENE_IMAGE}');--rift-boot-light:url('${RIFT_LIGHT_SCENE_IMAGE}');${preference==='light'?light:dark};background:var(--rift-boot-base) var(--rift-boot-image) right center/cover fixed no-repeat}
  ${preference==='system'?`@media(prefers-color-scheme:light){html:not([data-xiaohei-appearance]){${light}}}`:''}
  html[data-xiaohei-appearance='light']{${light}}
  html[data-xiaohei-appearance='dark']{${dark}}
  body{background:var(--rift-boot-scrim)!important;color:var(--rift-boot-text)}
  body>#root{background:transparent!important}
  ${RIFT_BOOT_LOADING_CSS}
  html{${preference==='light'?RIFT_QUIET_LIGHT:RIFT_QUIET_DARK}}
  ${preference==='system'?`@media(prefers-color-scheme:light){html:not([data-xiaohei-appearance]){${RIFT_QUIET_LIGHT}}}`:''}
  ${RIFT_VIEW_CSS}
  ${quietPaletteCss(preference)}
  </style>`
  const close=html.search(/<\/head\s*>/i);return close<0?style+html:html.slice(0,close)+style+html.slice(close)
}
