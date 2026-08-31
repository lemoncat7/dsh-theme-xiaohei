export const XIAOHEI_SYLVA_POINTER_CHANNEL = 'dsh-theme-xiaohei/sylva-pointer-v1'
export const XIAOHEI_SYLVA_POINTER_ACK_CHANNEL = 'dsh-theme-xiaohei/sylva-pointer-ack-v1'
export const XIAOHEI_SYLVA_POINTER_MARKER = 'data-xiaohei-pointer-bridge'

export type XiaoheiSylvaPointerMessage = {
  channel: typeof XIAOHEI_SYLVA_POINTER_CHANNEL
  event: 'move' | 'leave'
  x?: number
  y?: number
  pointerType?: string
}

type FrameBounds = Pick<DOMRectReadOnly, 'left' | 'top' | 'width' | 'height'>

/** Translate a host-page pointer into the isolated scene viewport. */
export function resolveXiaoheiSylvaPointer(
  clientX: number,
  clientY: number,
  bounds: FrameBounds,
): Pick<XiaoheiSylvaPointerMessage, 'event' | 'x' | 'y'> {
  const x = clientX - bounds.left
  const y = clientY - bounds.top
  if (bounds.width <= 0 || bounds.height <= 0 || x < 0 || y < 0 || x > bounds.width || y > bounds.height) {
    return { event: 'leave' }
  }
  return { event: 'move', x, y }
}

const RECEIVER = `
  /* ${XIAOHEI_SYLVA_POINTER_MARKER}="true" — host pointer coordinates enter
     the authored scene here, while actions remain owned by DSH. */
  var XIAOHEI_POINTER_CHANNEL = ${JSON.stringify(XIAOHEI_SYLVA_POINTER_CHANNEL)};
  var XIAOHEI_POINTER_ACK_CHANNEL = ${JSON.stringify(XIAOHEI_SYLVA_POINTER_ACK_CHANNEL)};
  function xiaoheiAcknowledgePointer(eventName) {
    parent.postMessage({
      channel: XIAOHEI_POINTER_ACK_CHANNEL,
      event: eventName,
      pointerX: pointer.x,
      pointerY: pointer.y,
      ndcX: ndc.x,
      ndcY: ndc.y,
      reducedMotion: REDUCED
    }, '*');
  }
  window.addEventListener('message', function (message) {
    if (message.source !== parent) return;
    var data = message.data;
    if (!data || data.channel !== XIAOHEI_POINTER_CHANNEL) return;
    if (data.event === 'leave') {
      pointer.x = pointer.y = 0;
      ndc.x = 10;
      xiaoheiAcknowledgePointer('leave');
      return;
    }
    if (data.event !== 'move' || !Number.isFinite(data.x) || !Number.isFinite(data.y)) return;
    pointer.x = (data.x / window.innerWidth) * 2 - 1;
    pointer.y = (data.y / window.innerHeight) * 2 - 1;
    var xiaoheiHeroRect = hero.getBoundingClientRect();
    ndc.x = ((data.x - xiaoheiHeroRect.left) / xiaoheiHeroRect.width) * 2 - 1;
    ndc.y = -((data.y - xiaoheiHeroRect.top) / xiaoheiHeroRect.height) * 2 + 1;
    /* Reduced motion keeps ambient animation still, but direct manipulation
       must remain responsive. Render only the pointer-driven moss response. */
    if (REDUCED && renderer && camera && typeof updateMouse === 'function') {
      var xiaoheiReduced = REDUCED;
      REDUCED = false;
      updateMouse(0.016);
      renderer.render(scene, camera);
      REDUCED = xiaoheiReduced;
    }
    xiaoheiAcknowledgePointer('move');
  });
`

/** Add the receiver to a derived srcDoc without changing the registered ThreeUI source. */
export function injectXiaoheiSylvaPointerBridge(source: string): string {
  if (source.includes(`${XIAOHEI_SYLVA_POINTER_MARKER}="true"`)) return source
  const runtimeEnd = source.lastIndexOf('\n})();\n</script>')
  if (runtimeEnd < 0) return source
  return `${source.slice(0, runtimeEnd)}${RECEIVER}${source.slice(runtimeEnd)}`
}

/** Prepare a frame before it is connected, so WebGL boots exactly once. */
export function prepareXiaoheiSylvaPointerFrame(frame: HTMLIFrameElement): boolean {
  const source = frame.getAttribute('srcdoc')
  if (source === null) return false
  const bridgedSource = injectXiaoheiSylvaPointerBridge(source)
  if (bridgedSource === source && !source.includes(`${XIAOHEI_SYLVA_POINTER_MARKER}="true"`)) return false
  frame.dataset.xiaoheiPointerBridge = 'true'
  if (bridgedSource !== source) frame.setAttribute('srcdoc', bridgedSource)
  return true
}

/** Install a movement-only bridge. It never forwards clicks or presses. */
export function installXiaoheiSylvaPointerBridge(
  host: HTMLElement,
  prepareSceneFrame: (frame: HTMLIFrameElement) => void = () => {},
): () => void {
  const win = host.ownerDocument.defaultView
  if (win === null) return () => {}

  let frame: HTMLIFrameElement | null = null
  let lastFrameWindow: Window | null = null

  const prepareFrame = (): void => {
    const nextFrame = host.querySelector('iframe')
    if (!(nextFrame instanceof win.HTMLIFrameElement)) return
    frame = nextFrame
    lastFrameWindow = nextFrame.contentWindow

    prepareSceneFrame(frame)
    prepareXiaoheiSylvaPointerFrame(frame)
  }

  const post = (message: Omit<XiaoheiSylvaPointerMessage, 'channel'>): void => {
    frame?.contentWindow?.postMessage({ channel: XIAOHEI_SYLVA_POINTER_CHANNEL, ...message }, '*')
  }

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch' || frame === null) return
    const point = resolveXiaoheiSylvaPointer(event.clientX, event.clientY, frame.getBoundingClientRect())
    post({ ...point, pointerType: event.pointerType || 'mouse' })
  }

  const onPointerDown = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch' || frame === null) return
    const point = resolveXiaoheiSylvaPointer(event.clientX, event.clientY, frame.getBoundingClientRect())
    post({ ...point, pointerType: 'touch' })
  }

  const onPointerEnd = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') post({ event: 'leave', pointerType: 'touch' })
  }

  const onPointerLeave = (event: PointerEvent): void => {
    post({ event: 'leave', pointerType: event.pointerType || 'mouse' })
  }

  const onBlur = (): void => post({ event: 'leave', pointerType: 'mouse' })
  const onMessage = (event: MessageEvent): void => {
    if (event.source !== lastFrameWindow) return
    const data = event.data as Record<string, unknown> | null
    if (data === null || data.channel !== XIAOHEI_SYLVA_POINTER_ACK_CHANNEL || frame === null) return
    frame.dataset.xiaoheiPointerState = data.event === 'move' ? 'active' : 'idle'
    frame.dataset.xiaoheiPointerX = String(data.pointerX ?? '')
    frame.dataset.xiaoheiPointerY = String(data.pointerY ?? '')
    frame.dataset.xiaoheiPointerReducedMotion = String(data.reducedMotion === true)
  }
  const observer = new win.MutationObserver(prepareFrame)
  observer.observe(host, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['srcdoc'],
  })
  prepareFrame()
  win.addEventListener('pointermove', onPointerMove, { passive: true, capture: true })
  win.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true })
  win.addEventListener('pointerup', onPointerEnd, { passive: true, capture: true })
  win.addEventListener('pointercancel', onPointerEnd, { passive: true, capture: true })
  win.addEventListener('pointerleave', onPointerLeave, { capture: true })
  win.addEventListener('blur', onBlur)
  win.addEventListener('message', onMessage)

  return () => {
    observer.disconnect()
    win.removeEventListener('pointermove', onPointerMove, { capture: true })
    win.removeEventListener('pointerdown', onPointerDown, { capture: true })
    win.removeEventListener('pointerup', onPointerEnd, { capture: true })
    win.removeEventListener('pointercancel', onPointerEnd, { capture: true })
    win.removeEventListener('pointerleave', onPointerLeave, { capture: true })
    win.removeEventListener('blur', onBlur)
    win.removeEventListener('message', onMessage)
  }
}
