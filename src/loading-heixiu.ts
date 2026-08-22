import {
  XIAOHEI_LOADING_HEIXIU_BLINK,
  XIAOHEI_LOADING_HEIXIU_OPEN,
} from './generated-loading-assets.js'

export const XIAOHEI_PLUGIN_LOADING_STYLE_ID = 'dsh-theme-xiaohei/plugin-loading-style'
export const XIAOHEI_PLUGIN_LOADING_CLASS = 'xiaohei-plugin-loader__track'

const LOADING_HINTS = new Set(['Loading plugins...', 'Loading plugins…'])

/** Only the normal plugin boot state is decorated. Failure output stays native. */
export function isXiaoheiPluginLoadingHint(value: string | null | undefined): boolean {
  return LOADING_HINTS.has(value?.trim() ?? '')
}

export const XIAOHEI_PLUGIN_LOADING_CSS = `
[data-xiaohei-plugin-loading='true'] > [class*='_spinner_'] {
  position: relative;
  overflow: visible;
  border-color: transparent !important;
  animation: none !important;
}

.xiaohei-plugin-loader__track {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  width: 10.5rem;
  height: 2.75rem;
  overflow: visible;
  contain: layout;
  pointer-events: none;
  user-select: none;
  transform: translate3d(-50%, -50%, 0);
}

.xiaohei-plugin-loader__runner {
  position: relative;
  flex: none;
  display: block;
  width: 2rem;
  aspect-ratio: 1;
  opacity: 0.78;
  transform: translate3d(0, 0, 0);
  animation: xiaohei-plugin-loader-hop 1.45s cubic-bezier(0.34, 0, 0.2, 1) infinite;
  animation-delay: var(--xiaohei-loader-delay);
  will-change: transform, opacity;
  filter:
    drop-shadow(0 0.18rem 0.38rem rgb(91 218 194 / 24%))
    drop-shadow(0 0.36rem 0.7rem rgb(5 13 14 / 18%));
}

.xiaohei-plugin-loader__runner > img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  object-fit: contain;
  filter: brightness(1.08) contrast(1.04) saturate(0.82);
}

.xiaohei-plugin-loader__runner-open {
  opacity: 1;
  animation: xiaohei-plugin-loader-open 2.7s step-end infinite;
  animation-delay: calc(var(--xiaohei-loader-index) * -370ms);
}

.xiaohei-plugin-loader__runner-blink {
  opacity: 0;
  animation: xiaohei-plugin-loader-blink 2.7s step-end infinite;
  animation-delay: calc(var(--xiaohei-loader-index) * -370ms);
}

html[data-xiaohei-appearance='light'] .xiaohei-plugin-loader__runner {
  filter:
    drop-shadow(0 0.16rem 0.32rem rgb(47 133 118 / 16%))
    drop-shadow(0 0.32rem 0.58rem rgb(45 64 56 / 12%));
}

html[data-xiaohei-appearance='light'] .xiaohei-plugin-loader__runner > img {
  filter: brightness(1.01) contrast(1.05) saturate(0.76);
}

@keyframes xiaohei-plugin-loader-hop {
  0%, 18%, 58%, 100% { transform: translate3d(0, 0, 0) scale(0.96, 1.02); }
  32% { transform: translate3d(0, -0.58rem, 0) scale(1, 0.98); }
  45% { transform: translate3d(0, 0, 0) scale(1.03, 0.94); }
}

@keyframes xiaohei-plugin-loader-open {
  0%, 71.9%, 78%, 100% { opacity: 1; }
  72%, 77.9% { opacity: 0; }
}

@keyframes xiaohei-plugin-loader-blink {
  0%, 71.9%, 78%, 100% { opacity: 0; }
  72%, 77.9% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .xiaohei-plugin-loader__track {
    gap: 0.35rem;
  }

  .xiaohei-plugin-loader__runner {
    position: relative;
    width: 2rem;
    opacity: 0.72;
    transform: none;
    animation: none;
    will-change: auto;
  }

  .xiaohei-plugin-loader__runner-open,
  .xiaohei-plugin-loader__runner-blink {
    animation: none;
  }
}

@media (forced-colors: active) {
  .xiaohei-plugin-loader__track { display: none; }
  [data-xiaohei-plugin-loading='true'] > [class*='_spinner_'] {
    border-color: ButtonText !important;
    border-top-color: Highlight !important;
    animation: xiaohei-plugin-loader-fallback-spin 0.8s linear infinite !important;
  }
}

@keyframes xiaohei-plugin-loader-fallback-spin {
  to { transform: rotate(360deg); }
}
`

/** Replace DSH's normal spinner after this plugin joins the boot queue. */
export function installXiaoheiPluginLoading(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc?.head === undefined || doc.body === undefined || doc.defaultView === null) return () => {}
  if (doc.documentElement.getAttribute('data-xiaohei-boot-loader') === 'host') return () => {}

  const win = doc.defaultView
  let disposed = false
  let decoratedCard: HTMLElement | undefined

  doc.getElementById(XIAOHEI_PLUGIN_LOADING_STYLE_ID)?.remove()
  const style = doc.createElement('style')
  style.id = XIAOHEI_PLUGIN_LOADING_STYLE_ID
  style.textContent = XIAOHEI_PLUGIN_LOADING_CSS
  doc.head.append(style)

  const clearCard = (): void => {
    if (decoratedCard === undefined) return
    decoratedCard.removeAttribute('data-xiaohei-plugin-loading')
    decoratedCard.querySelector(`.${XIAOHEI_PLUGIN_LOADING_CLASS}`)?.remove()
    decoratedCard = undefined
  }

  const findHint = (): HTMLElement | undefined => {
    for (const element of doc.querySelectorAll<HTMLElement>('div')) {
      if (isXiaoheiPluginLoadingHint(element.textContent) && element.children.length === 0) return element
    }
    return undefined
  }

  const sync = (): void => {
    if (disposed) return
    const hint = findHint()
    if (hint === undefined || hint.parentElement === null) {
      clearCard()
      return
    }
    const card = hint.parentElement
    if (card === decoratedCard && card.querySelector(`.${XIAOHEI_PLUGIN_LOADING_CLASS}`) !== null) return

    clearCard()
    decoratedCard = card
    card.setAttribute('data-xiaohei-plugin-loading', 'true')
    const track = createLoadingTrack(doc)
    const spinner = card.querySelector<HTMLElement>(":scope > [class*='_spinner_']")
    if (spinner === null) return
    spinner.append(track)
  }

  let syncQueued = false
  const queueSync = (): void => {
    if (syncQueued || disposed) return
    syncQueued = true
    queueMicrotask(() => {
      syncQueued = false
      sync()
    })
  }

  sync()
  const observer = new win.MutationObserver(queueSync)
  observer.observe(doc.body, { childList: true, subtree: true })

  return () => {
    disposed = true
    observer.disconnect()
    clearCard()
    style.remove()
  }
}

function createLoadingTrack(doc: Document): HTMLDivElement {
  const track = doc.createElement('div')
  track.className = XIAOHEI_PLUGIN_LOADING_CLASS
  track.setAttribute('aria-hidden', 'true')

  for (let index = 0; index < 4; index += 1) {
    const runner = doc.createElement('span')
    runner.className = 'xiaohei-plugin-loader__runner'
    runner.style.setProperty('--xiaohei-loader-index', String(index))
    runner.style.setProperty('--xiaohei-loader-delay', `${index * 130}ms`)
    runner.append(
      createLoadingImage(doc, XIAOHEI_LOADING_HEIXIU_OPEN, 'xiaohei-plugin-loader__runner-open'),
      createLoadingImage(doc, XIAOHEI_LOADING_HEIXIU_BLINK, 'xiaohei-plugin-loader__runner-blink'),
    )
    track.append(runner)
  }

  return track
}

function createLoadingImage(doc: Document, source: string, className: string): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = className
  image.alt = ''
  image.decoding = 'async'
  image.src = source
  return image
}
