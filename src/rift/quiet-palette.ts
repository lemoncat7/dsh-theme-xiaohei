import { createPalette, RIFT_DARK, RIFT_LIGHT, type PaletteColors } from './palette.js'
import { watchView, type RiftView } from './view.js'
import type { ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'

type QuietColors = PaletteColors & { nav: string; hover: string; selected: string; bubble: string; canvas: string; pane: string; message: string }
export const QUIET_COLORS: Record<'gradient' | 'solid', Record<'dark' | 'light', QuietColors>> = {
  gradient: {
    light: {base:'#f2f5f9',surface:'#fbfcfe',raised:'#ffffff',text:'#243247',secondary:'#536278',muted:'#5d6b7e',edge:'#d2dbe7',accent:'#3c608f',onAccent:'#ffffff',nav:'#eaf0f8',hover:'#e5ecf6',selected:'#dbe6f5',bubble:'#e6eef9',canvas:'linear-gradient(135deg,#f5f7fb,#e9eff7)',pane:'linear-gradient(160deg,#edf2fa,#e6edf6)',message:'linear-gradient(120deg,#e4edf9,#edf1f9)'},
    dark: {base:'#19212d',surface:'#252e3b',raised:'#2c3746',text:'#e5ebf3',secondary:'#b3bdcb',muted:'#a7b3c4',edge:'#414c5e',accent:'#9abce6',onAccent:'#182333',nav:'#222d3c',hover:'#303e51',selected:'#384b63',bubble:'#303e51',canvas:'linear-gradient(135deg,#19212d,#202c3b)',pane:'linear-gradient(160deg,#263448,#1d2735)',message:'linear-gradient(120deg,#303e51,#293648)'},
  },
  solid: {
    light: {base:'#f5f5f5',surface:'#ffffff',raised:'#fafafa',text:'#242424',secondary:'#55575c',muted:'#62646b',edge:'#d8dade',accent:'#475569',onAccent:'#ffffff',nav:'#eeeeef',hover:'#e6e7e9',selected:'#dcdee2',bubble:'#e8e9ec',canvas:'#f5f5f5',pane:'#eeeeef',message:'#e8e9ec'},
    dark: {base:'#202124',surface:'#292b2f',raised:'#33353a',text:'#eeeff1',secondary:'#bec1c7',muted:'#aeb2ba',edge:'#474a51',accent:'#c2c8d0',onAccent:'#24262b',nav:'#25262a',hover:'#36383e',selected:'#42454d',bubble:'#35383e',canvas:'#202124',pane:'#25262a',message:'#35383e'},
  },
}
function quietPalette(p: QuietColors, dark: boolean): Record<string,string> {
  return {...createPalette(p,dark),
    '--dsw-alias-button-primary-hover':p.secondary,'--dsw-alias-button-info-hover':p.secondary,
    '--dsw-alias-button-primary-dimmed':p.edge,
    '--dsw-alias-interactive-bg-active':p.selected,'--dsw-alias-interactive-bg-hover':p.hover,
    '--dsw-alias-interactive-bg-hover-accent':p.hover,'--dsw-alias-interactive-bg-hover-solid':p.hover,
    '--dsw-alias-bg-skeleton':p.hover,'--dsw-alias-markdown-code-block':p.raised,
    '--dsw-specific-bubble':p.bubble,'--dsw-specific-bubble-highlight':p.selected,
    '--dsw-specific-sidebar-fill':p.nav,'--dsw-specific-sidebar-nav-item-active-accent':p.selected,
    '--dsw-specific-sidebar-nav-item-active':p.selected,'--dsw-specific-sidebar-nav-item-hover':p.hover,
    '--dsw-alias-tooltip-bg':dark?p.raised:p.text,
    ...Object.fromEntries(['bg-l1','bg-l2','hover-l1','hover-l2'].map(key=>[`--dsw-alias-scrollbar-${key}`,key.startsWith('hover')?p.muted:p.edge])),
  }
}
export function viewPalette(mode: RiftView, scheme: 'light' | 'dark'): Record<string,string> {
  return mode==='full' ? (scheme==='dark'?RIFT_DARK:RIFT_LIGHT) : quietPalette(QUIET_COLORS[mode][scheme],scheme==='dark')
}
export function bindViewPalette(theme: {overrideTokens(source:string,tokens:ThemeTokenOverrides):()=>void}, win:Window):()=>void {
  let release:(()=>void)|undefined,previous:RiftView|undefined
  const off=watchView(win,mode=>{
    win.document.documentElement.setAttribute('data-rift-view',mode)
    if(mode===previous)return
    previous=mode;release?.()
    const light=viewPalette(mode,'light'),dark=viewPalette(mode,'dark')
    release=theme.overrideTokens('@lemoncat7/dsh-theme-xiaohei',Object.fromEntries(Object.keys(light).map(key=>[key,{light:light[key]!,dark:dark[key]!}])))
  })
  return()=>{off();release?.()}
}
export function quietVariables(p:QuietColors):string {
  return `--rift-base:${p.base};--rift-surface:${p.surface};--rift-panel:${p.nav};--rift-text:${p.text};--rift-muted:${p.muted};--rift-edge:${p.edge};--rift-silver:${p.accent};--rift-hover:${p.hover};--rift-input:${p.surface};--rift-shadow:rgb(0 0 0 / 16%);--quiet-selected:${p.selected};--quiet-pane:${p.pane};--quiet-message:${p.message};--rift-quiet-base:${p.base};--rift-quiet-glow:${p.canvas}`
}
/** Same four complete palettes at first paint and after native appearance hydration. */
export function quietPaletteCss(preference?:'light'|'dark'|'system'):string {
  return (['gradient','solid'] as const).map(mode=>{
    const root=`html[data-rift-view='${mode}']`
    return (preference ? `${root}{${quietVariables(QUIET_COLORS[mode][preference==='light'?'light':'dark'])}}${preference==='system'?`@media(prefers-color-scheme:light){${root}:not([data-xiaohei-appearance]){${quietVariables(QUIET_COLORS[mode].light)}}}`:''}`:'')+
      (['light','dark'] as const).map(scheme=>`${root}[data-xiaohei-appearance='${scheme}']{${quietVariables(QUIET_COLORS[mode][scheme])}}`).join('')
  }).join('\n')
}
