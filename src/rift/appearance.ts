import type { ThemeSnapshot, ThemeTokenOverrides } from '@deepseek-ai/dsh-client-ui-theme/client'
import { viewPalette } from './quiet-palette.js'
import { validView } from './view.js'

type Preference = 'light' | 'dark' | 'system'
interface ThemeForm {
  getSnapshot(): { status: 'loading' | 'ready' | 'unavailable'; value: unknown }
  subscribe(listener: () => void): () => void
}
/** Only the public, read-only ConfigForm surface is needed; never write preferences. */
export interface RiftAppearanceContext {
  theme: {
    getTheme(): ThemeSnapshot
    overrideTokens(source: string, tokens: ThemeTokenOverrides): () => void
  }
  configForms: { get(namespace: string): ThemeForm }
  on(event: 'theme/change', listener: (snapshot: ThemeSnapshot) => void): () => void
}

/** Preserve Host first paint until settings are actually accepted, not until a timer expires. */
export function bindRiftAppearance(ctx: RiftAppearanceContext, doc: Document = document): () => void {
  const root = doc.documentElement, win = doc.defaultView
  const boot = doc.getElementById('dsh-theme-xiaohei/rift-boot')?.getAttribute('data-preference')
  const initial: Preference | undefined = boot === 'light' || boot === 'dark' || boot === 'system' ? boot : undefined
  const form = ctx.configForms.get('ui-theme')
  const media = win?.matchMedia('(prefers-color-scheme: dark)')
  let disposed = false, updating = false
  let bridged: string | undefined, release: (() => void) | undefined
  const sync = (): void => {
    if (disposed || updating) return
    const snapshot = ctx.theme.getTheme()
    const pending = form.getSnapshot().status === 'loading' && initial !== undefined
    const preference = pending ? initial : snapshot.preference
    const scheme = preference === 'system' && media ? (media.matches ? 'dark' : 'light')
      : preference === 'light' || preference === 'dark' ? preference : snapshot.active.colorScheme
    root.setAttribute('data-xiaohei-appearance', scheme)
    // Native UI tokens must match the wallpaper while the Host briefly exposes its schema default.
    const view = validView(root.getAttribute('data-rift-view'))
    const bridge = snapshot.active.colorScheme !== scheme ? `${view}:${scheme}` : undefined
    if (bridge === bridged) return
    updating = true
    try {
      release?.(); release = undefined; bridged = bridge
      if (bridge) {
        const palette = viewPalette(view, scheme)
        release = ctx.theme.overrideTokens('@lemoncat7/dsh-theme-xiaohei/appearance-handoff',
          Object.fromEntries(Object.entries(palette).map(([key, value]) => [key, { light: value, dark: value }])))
      }
    } finally { updating = false }
  }
  const offTheme = ctx.on('theme/change', sync), offForm = form.subscribe(sync)
  media?.addEventListener('change', sync)
  win?.addEventListener('pageshow', sync)
  doc.addEventListener('visibilitychange', sync)
  sync()
  return () => {
    disposed = true; offTheme(); offForm()
    media?.removeEventListener('change', sync)
    win?.removeEventListener('pageshow', sync)
    doc.removeEventListener('visibilitychange', sync)
    release?.()
    root.removeAttribute('data-xiaohei-appearance')
  }
}
