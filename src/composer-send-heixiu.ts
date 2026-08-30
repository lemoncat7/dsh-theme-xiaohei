import { XIAOHEI_HEIXIU_BLINK, XIAOHEI_HEIXIU_OPEN } from './generated-keyart.js'
import { XIAOHEI_HOST_SELECTORS } from './host-contract.js'
import { subscribeXiaoheiHostDom } from './host-dom.js'

const SEND_BUTTON_SELECTOR = ':scope > :last-child > :last-child > button:last-child'
const SEND_ATTRIBUTE = 'data-xiaohei-send-heixiu'
const BLINK_ATTRIBUTE = 'data-xiaohei-blink'
const HEIXIU_CLASS = 'xiaohei-composer-send-heixiu'
const BLINK_DELAY_MIN_MS = 4600
const BLINK_DELAY_MAX_MS = 8200
const BLINK_CLOSED_MS = 128

/** Keep idle blinks sparse without making their rhythm mechanical. */
export function resolveXiaoheiSendBlinkDelay(random: () => number = Math.random): number {
  const sample = Math.min(1, Math.max(0, random()))
  return Math.round(BLINK_DELAY_MIN_MS + sample * (BLINK_DELAY_MAX_MS - BLINK_DELAY_MIN_MS))
}

function createFrame(doc: Document, source: string, className: string): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = className
  image.src = source
  image.alt = ''
  image.draggable = false
  return image
}

function createHeixiu(doc: Document): HTMLElement {
  const element = doc.createElement('span')
  element.className = HEIXIU_CLASS
  element.setAttribute('aria-hidden', 'true')
  element.append(
    createFrame(doc, XIAOHEI_HEIXIU_OPEN, `${HEIXIU_CLASS}__open`),
    createFrame(doc, XIAOHEI_HEIXIU_BLINK, `${HEIXIU_CLASS}__blink`),
  )
  return element
}

/** The Host renders a rect only when the primary action has become Stop. */
function isSendAction(button: HTMLButtonElement): boolean {
  const hostGlyph = [...button.children].find(child => child.localName === 'svg')
  return hostGlyph !== undefined && hostGlyph.querySelector('rect') === null
}

/**
 * Turn the Host's real primary button into Heixiu without replacing its click,
 * keyboard, disabled, tooltip, or accessible-name behaviour.
 */
export function installXiaoheiComposerSendHeixiu(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc?.body === undefined || doc.defaultView === null) return () => {}

  const win = doc.defaultView
  const reducedMotion = win.matchMedia('(prefers-reduced-motion: reduce)')
  const decorations = new Map<HTMLButtonElement, HTMLElement>()
  let blinkTimer = 0
  let reopenTimer = 0

  const canBlink = (): boolean => (
    decorations.size > 0
    && doc.visibilityState !== 'hidden'
    && !reducedMotion.matches
  )

  const setClosed = (closed: boolean): void => {
    for (const decoration of decorations.values()) {
      if (closed) decoration.setAttribute(BLINK_ATTRIBUTE, 'closed')
      else decoration.removeAttribute(BLINK_ATTRIBUTE)
    }
  }

  const clearTimers = (): void => {
    if (blinkTimer !== 0) win.clearTimeout(blinkTimer)
    if (reopenTimer !== 0) win.clearTimeout(reopenTimer)
    blinkTimer = 0
    reopenTimer = 0
  }

  const scheduleBlink = (): void => {
    if (!canBlink() || blinkTimer !== 0 || reopenTimer !== 0) return
    blinkTimer = win.setTimeout(() => {
      blinkTimer = 0
      if (!canBlink()) return
      setClosed(true)
      reopenTimer = win.setTimeout(() => {
        reopenTimer = 0
        setClosed(false)
        scheduleBlink()
      }, BLINK_CLOSED_MS)
    }, resolveXiaoheiSendBlinkDelay())
  }

  const restartBlink = (): void => {
    clearTimers()
    setClosed(false)
    scheduleBlink()
  }

  const detach = (button: HTMLButtonElement, decoration: HTMLElement): void => {
    decoration.remove()
    button.removeAttribute(SEND_ATTRIBUTE)
    decorations.delete(button)
  }

  const reconcile = (): void => {
    const candidates = new Set<HTMLButtonElement>()
    for (const card of doc.querySelectorAll<HTMLElement>(XIAOHEI_HOST_SELECTORS.composerCard)) {
      const button = card.querySelector<HTMLButtonElement>(SEND_BUTTON_SELECTOR)
      if (button !== null && isSendAction(button)) candidates.add(button)
    }

    const hadDecorations = decorations.size > 0
    for (const [button, decoration] of decorations) {
      if (candidates.has(button) && decoration.parentElement === button) continue
      detach(button, decoration)
    }
    for (const button of candidates) {
      if (decorations.has(button)) continue
      const decoration = createHeixiu(doc)
      button.setAttribute(SEND_ATTRIBUTE, 'true')
      button.insertBefore(decoration, button.firstChild)
      decorations.set(button, decoration)
    }

    if (!hadDecorations && decorations.size > 0) scheduleBlink()
    else if (hadDecorations && decorations.size === 0) restartBlink()
  }

  const onEnvironmentChange = (): void => restartBlink()
  reconcile()
  const unsubscribeHostDom = subscribeXiaoheiHostDom(doc, reconcile)
  doc.addEventListener('visibilitychange', onEnvironmentChange)
  reducedMotion.addEventListener('change', onEnvironmentChange)

  return () => {
    clearTimers()
    unsubscribeHostDom()
    doc.removeEventListener('visibilitychange', onEnvironmentChange)
    reducedMotion.removeEventListener('change', onEnvironmentChange)
    for (const [button, decoration] of decorations) detach(button, decoration)
    decorations.clear()
  }
}
