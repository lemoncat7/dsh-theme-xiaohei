import type { ThemeDefinition } from '@deepseek-ai/dsh-client-ui-theme/client'

/** Stable id used by DSH's theme registry. */
export const XIAOHEI_NIGHT_THEME_ID = 'xiaohei-night'

/**
 * Xiaohei Night keeps DSH's native layout and uses translucent ink-black
 * surfaces so the moonlit forest remains present without reducing legibility.
 */
export const XIAOHEI_NIGHT_THEME = {
  id: XIAOHEI_NIGHT_THEME_ID,
  colorScheme: 'dark',
  tokens: {
    '--dsw-alias-bg-base': 'rgb(8 16 20 / 42%)',
    '--dsw-alias-bg-layer-1': 'rgb(11 24 27 / 70%)',
    '--dsw-alias-bg-layer-2': 'rgb(15 32 34 / 84%)',
    '--dsw-alias-bg-layer-3': 'rgb(20 42 42 / 92%)',
    '--dsw-alias-bg-overlay': '#193333',
    '--dsw-alias-bg-module-platform': 'rgb(10 22 25 / 76%)',
    '--dsw-alias-bg-multi-select': '#142A2A',
    '--dsw-alias-bg-skeleton': 'rgb(101 209 190 / 9%)',

    '--dsw-alias-border-inverted2': 'rgb(113 221 201 / 7%)',
    '--dsw-alias-border-inverted': 'rgb(113 221 201 / 10%)',
    '--dsw-alias-border-l1': 'rgb(113 221 201 / 8%)',
    '--dsw-alias-border-l2-darkmode-thin': 'rgb(113 221 201 / 11%)',
    '--dsw-alias-border-l2': 'rgb(113 221 201 / 15%)',
    '--dsw-alias-border-l3': 'rgb(113 221 201 / 23%)',
    '--dsw-alias-border-l4': 'rgb(113 221 201 / 32%)',

    '--dsw-alias-brand-primary': '#65D1BE',
    '--dsw-alias-brand-primary-invert': '#07221E',
    '--dsw-alias-brand-primary-new-colorprimary-new-color': '#65D1BE',
    '--dsw-alias-brand-text': '#78DDCB',
    '--dsw-alias-button-contrast-fill': '#E7F3F0',
    '--dsw-alias-button-primary-fill': '#65D1BE',
    '--dsw-alias-button-primary-hover': '#7BE0CE',
    '--dsw-alias-button-primary-dimmed': '#356F65',
    '--dsw-alias-button-elevated-fill': '#193333',
    '--dsw-alias-button-floating-fill': '#142A2A',
    '--dsw-alias-button-floating-hover': '#1E3D3B',
    '--dsw-alias-button-ghost-active-border': '#356F65',
    '--dsw-alias-button-ghost-active-fill': 'rgb(101 209 190 / 16%)',
    '--dsw-alias-button-ghost-active-hover': 'rgb(101 209 190 / 23%)',
    '--dsw-alias-button-info-fill': '#65D1BE',
    '--dsw-alias-button-info-hover': '#7BE0CE',

    '--dsw-alias-interactive-bg-active': 'rgb(101 209 190 / 18%)',
    '--dsw-alias-interactive-bg-hover-accent': 'rgb(101 209 190 / 24%)',
    '--dsw-alias-interactive-bg-hover-solid': '#193333',
    '--dsw-alias-interactive-bg-hover': 'rgb(101 209 190 / 10%)',

    '--dsw-alias-label-primary': '#E7F3F0',
    '--dsw-alias-label-primary-bluish': '#E7F3F0',
    '--dsw-alias-label-primary-dimmed': '#CFDFDB',
    '--dsw-alias-label-primary-foreground': '#07221E',
    '--dsw-alias-label-primary-inverted': '#193333',
    '--dsw-alias-label-secondary': '#B9D0CB',
    '--dsw-alias-label-tertiary': '#91AAA5',
    '--dsw-alias-label-caption': '#809994',
    '--dsw-alias-label-dimmed': '#617773',

    '--dsw-alias-markdown-citation': '#193333',
    '--dsw-alias-markdown-code-block-banner': '#0F2022',
    '--dsw-alias-markdown-code-block': '#071114',
    '--dsw-alias-markdown-code-segment-selected': '#193333',
    '--dsw-alias-markdown-code-segment-unselected': '#0B181B',
    '--dsw-alias-markdown-inline-code': '#142A2A',
    '--dsw-alias-markdown-placeholder': '#0F2022',
    '--dsw-alias-markdown-tag': '#142A2A',

    '--dsw-alias-scrollbar-bg-l1': '#294A47',
    '--dsw-alias-scrollbar-bg-l2': '#35605B',
    '--dsw-alias-scrollbar-hover-l1': '#42746D',
    '--dsw-alias-scrollbar-hover-l2': '#4E877E',

    '--dsw-alias-state-error-primary': '#FF7D86',
    '--dsw-alias-state-error-secondary': '#FF9AA1',
    '--dsw-alias-state-business-primary': '#65D1BE',
    '--dsw-alias-state-business-tertiary': '#193333',
    '--dsw-alias-state-success-primary': '#82D29A',
    '--dsw-alias-state-success-secondary': '#9BDEAC',
    '--dsw-alias-state-success-tertiary': '#173722',
    '--dsw-alias-state-warn-label': '#E9BD68',
    '--dsw-alias-state-warn-primary': '#E9BD68',
    '--dsw-alias-state-warn-secondary': '#F2CC82',
    '--dsw-alias-state-warn-tertiary': '#3A2D14',

    '--dsw-alias-toast-bg': '#193333',
    '--dsw-alias-tooltip-bg': '#193333',
    '--dsw-specific-bubble': 'rgb(15 32 34 / 94%)',
    '--dsw-specific-bubble-highlight': '#193333',
    '--dsw-specific-input-major': 'rgb(15 32 34 / 94%)',
    '--dsw-specific-login-input': 'rgb(11 24 27 / 92%)',
    '--dsw-specific-menu': '#142A2A',
    '--dsw-specific-selector': '#193333',
    '--dsw-specific-sidebar-fill': 'rgb(7 17 20 / 72%)',
    '--dsw-specific-sidebar-nav-item-active-accent': '#244A45',
    '--dsw-specific-sidebar-nav-item-active': '#193333',
    '--dsw-specific-sidebar-nav-item-hover': '#0F2022',
    '--dsw-specific-tip': '#142A2A',
  },
} satisfies ThemeDefinition
