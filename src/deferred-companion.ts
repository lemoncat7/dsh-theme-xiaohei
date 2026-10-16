import { installDeferredDecorations } from './deferred-decorations.js'
import type * as Companion from './companion-entry.js'
import type { HeixiuSignals } from './bloub-heixiu/signals.js'

declare const require: { async(path: string): Promise<typeof Companion> }

/** Keep the SVG engine and its initialization off the conversation's first paint. */
export function installDeferredCompanion(
  signals: HeixiuSignals,
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
  load: () => Promise<typeof Companion> = () => require.async('./client.companion.js'),
): () => void {
  return installDeferredDecorations(doc, async () => {
    const module = await load()
    return { installDecorations: (target: Document) => module.installComposerBloub(target, signals) }
  }, '#root [data-composer-card="true"]')
}
