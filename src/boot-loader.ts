import {
  XIAOHEI_LOADING_HEIXIU_BLINK,
  XIAOHEI_LOADING_HEIXIU_OPEN,
} from './generated-loading-assets.js'
import { XIAOHEI_PLUGIN_LOADING_CSS } from './loading-heixiu.js'
import {
  XIAOHEI_BOOT_APPEARANCE_ATTRIBUTE,
  XIAOHEI_BOOT_APPEARANCE_CSS,
  XIAOHEI_BOOT_APPEARANCE_STYLE_ID,
} from './boot-appearance.js'

export const XIAOHEI_BOOT_LOADER_SCRIPT_ID = 'dsh-theme-xiaohei/boot-loader-script'
export const XIAOHEI_BOOT_LOADER_MARKER = 'data-xiaohei-boot-loader'

interface XiaoheiBootLoaderConfig {
  appearanceAttribute: string
  css: string
  openImage: string
  blinkImage: string
  scriptId: string
}

/** Inject the bootstrap immediately after body opens, before DSH's module script. */
export function injectXiaoheiBootLoader(html: string): string {
  if (html.includes(`id="${XIAOHEI_BOOT_LOADER_SCRIPT_ID}"`)) return html
  const config: XiaoheiBootLoaderConfig = {
    appearanceAttribute: XIAOHEI_BOOT_APPEARANCE_ATTRIBUTE,
    css: XIAOHEI_PLUGIN_LOADING_CSS,
    openImage: XIAOHEI_LOADING_HEIXIU_OPEN,
    blinkImage: XIAOHEI_LOADING_HEIXIU_BLINK,
    scriptId: XIAOHEI_BOOT_LOADER_SCRIPT_ID,
  }
  const payload = escapeInlineScriptJson(config)
  const script = `<script id="${XIAOHEI_BOOT_LOADER_SCRIPT_ID}">(${runXiaoheiBootLoader.toString()})(${payload});</script>`
  const withAppearance = injectBootAppearanceStyle(html)
  const body = /<body(?:\s[^>]*)?>/i.exec(withAppearance)
  if (body === null) return `${withAppearance}${script}`
  const insertionPoint = resolveBootLoaderInsertionPoint(
    withAppearance,
    body.index + body[0].length,
  )
  return `${withAppearance.slice(0, insertionPoint)}${script}${withAppearance.slice(insertionPoint)}`
}

/** Install the critical palette before the parser reaches the body. */
function injectBootAppearanceStyle(html: string): string {
  const style = `<style id="${XIAOHEI_BOOT_APPEARANCE_STYLE_ID}">${XIAOHEI_BOOT_APPEARANCE_CSS}</style>`
  const headEnd = /<\/head\s*>/i.exec(html)
  if (headEnd !== null) {
    return `${html.slice(0, headEnd.index)}${style}${html.slice(headEnd.index)}`
  }
  return `${style}${html}`
}

/** Start after DSH has synchronously resolved its persisted theme preference. */
function resolveBootLoaderInsertionPoint(html: string, bodyStart: number): number {
  const themeMutation = html.indexOf('document.body.toggleAttribute', bodyStart)
  const themeMarker = themeMutation < 0
    ? -1
    : html.indexOf('data-ds-dark-theme', themeMutation)
  if (themeMarker < 0) return bodyStart

  const themeScriptEnd = html.indexOf('</script>', themeMarker)
  return themeScriptEnd < 0 ? bodyStart : themeScriptEnd + '</script>'.length
}

function escapeInlineScriptJson(value: XiaoheiBootLoaderConfig): string {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

/** Self-contained browser bootstrap serialized into index.html by the Host. */
function runXiaoheiBootLoader(config: XiaoheiBootLoaderConfig): void {
  const root = document.documentElement
  if (root.getAttribute('data-xiaohei-boot-loader') === 'host') return
  root.setAttribute('data-xiaohei-boot-loader', 'host')

  const syncAppearance = (): void => {
    const dark = root.style.colorScheme === 'dark'
      || document.body.hasAttribute('data-ds-dark-theme')
    root.setAttribute(config.appearanceAttribute, dark ? 'dark' : 'light')
  }

  syncAppearance()

  const style = document.createElement('style')
  style.id = `${config.scriptId}/style`
  style.textContent = config.css
  document.head.append(style)

  let decoratedCard: HTMLElement | undefined
  let loadingSeen = false
  let disposed = false

  const isLoadingHint = (value: string | null | undefined): boolean => {
    const normalized = value?.trim() ?? ''
    return normalized === 'Loading plugins...' || normalized === 'Loading plugins…'
  }

  const findHint = (): HTMLElement | undefined => {
    for (const element of document.querySelectorAll<HTMLElement>('div')) {
      if (element.children.length === 0 && isLoadingHint(element.textContent)) return element
    }
    return undefined
  }

  const createImage = (source: string, className: string): HTMLImageElement => {
    const image = document.createElement('img')
    image.className = className
    image.alt = ''
    image.decoding = 'async'
    image.src = source
    return image
  }

  const createTrack = (): HTMLDivElement => {
    const track = document.createElement('div')
    track.className = 'xiaohei-plugin-loader__track'
    track.setAttribute('aria-hidden', 'true')
    for (let index = 0; index < 4; index += 1) {
      const runner = document.createElement('span')
      runner.className = 'xiaohei-plugin-loader__runner'
      runner.style.setProperty('--xiaohei-loader-index', String(index))
      runner.style.setProperty('--xiaohei-loader-delay', `${index * -700}ms`)
      const sprite = document.createElement('span')
      sprite.className = 'xiaohei-plugin-loader__sprite'
      sprite.append(
        createImage(config.openImage, 'xiaohei-plugin-loader__runner-open'),
        createImage(config.blinkImage, 'xiaohei-plugin-loader__runner-blink'),
      )
      runner.append(sprite)
      track.append(runner)
    }
    return track
  }

  const clearCard = (): void => {
    if (decoratedCard === undefined) return
    decoratedCard.removeAttribute('data-xiaohei-plugin-loading')
    decoratedCard.querySelector('.xiaohei-plugin-loader__track')?.remove()
    decoratedCard = undefined
  }

  let observer: MutationObserver
  const dispose = (): void => {
    if (disposed) return
    disposed = true
    observer.disconnect()
    clearCard()
    style.remove()
  }

  const sync = (): void => {
    if (disposed) return
    const hint = findHint()
    if (hint === undefined || hint.parentElement === null) {
      if (loadingSeen) dispose()
      return
    }
    loadingSeen = true
    const card = hint.parentElement
    if (card === decoratedCard && card.querySelector('.xiaohei-plugin-loader__track') !== null) return
    clearCard()
    decoratedCard = card
    const spinner = card.querySelector<HTMLElement>(":scope > [class*='_spinner_']")
    if (spinner === null) return
    card.setAttribute('data-xiaohei-plugin-loading', 'true')
    spinner.append(createTrack())
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

  observer = new MutationObserver(queueSync)
  observer.observe(document, { childList: true, subtree: true })
  sync()
}
