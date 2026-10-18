import { RIFT_SCENE_IMAGE, RIFT_LIGHT_SCENE_IMAGE } from './assets.js'
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
/** Early wallpaper only: no DOM observer, timer, script, or duplicated loading UI. */
export function injectRiftBoot(html:string):string{
  if(html.includes(`id="${RIFT_BOOT_ID}"`))return html
  const preference=bootPreference(html)
  const light=`--rift-boot-image:var(--rift-boot-light);--rift-boot-base:${RIFT_LIGHT_SCENE_BASE};--rift-boot-scrim:${RIFT_LIGHT_SCENE_SCRIM};--rift-boot-text:#242832`
  const dark=`--rift-boot-image:var(--rift-boot-dark);--rift-boot-base:${RIFT_SCENE_BASE};--rift-boot-scrim:${RIFT_SCENE_SCRIM};--rift-boot-text:#ecebe7`
  const style=`<style id="${RIFT_BOOT_ID}">
  html{--rift-boot-dark:url('${RIFT_SCENE_IMAGE}');--rift-boot-light:url('${RIFT_LIGHT_SCENE_IMAGE}');${preference==='light'?light:dark};background:var(--rift-boot-base) var(--rift-boot-image) right center/cover fixed no-repeat}
  ${preference==='system'?`@media(prefers-color-scheme:light){html:not([data-xiaohei-appearance]){${light}}}`:''}
  html:not([data-xiaohei-appearance])[data-ds-theme-source='light'],html:not([data-xiaohei-appearance]):has(>body:not([data-ds-dark-theme]))[data-ds-theme-source='system']{${light}}
  html:not([data-xiaohei-appearance])[data-ds-theme-source='dark'],html:not([data-xiaohei-appearance]):has(>body[data-ds-dark-theme]){${dark}}
  html[data-xiaohei-appearance='light']{${light}}
  html[data-xiaohei-appearance='dark']{${dark}}
  body{background:var(--rift-boot-scrim)!important;color:var(--rift-boot-text)}
  body>#root{background:transparent!important}
  </style>`
  const close=html.search(/<\/head\s*>/i);return close<0?style+html:html.slice(0,close)+style+html.slice(close)
}
