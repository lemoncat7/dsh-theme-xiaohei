import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { SylvaLivingWorldScene } from '../shaders/sylva-living-world/SylvaLivingWorldScene.js'
import threeUiStyle from '../shaders/threeui.css?raw'
import {
  installXiaoheiSylvaPointerBridge,
  prepareXiaoheiSylvaPointerFrame,
} from './pointer-bridge.js'
import { prepareXiaoheiSylvaAvatarFrame } from './avatar-model.js'

export const XIAOHEI_SYLVA_STYLE_ID = 'dsh-theme-xiaohei/threeui-style'

/** Mount the exact registered ThreeUI scene into the theme-owned world layer. */
export function mountXiaoheiSylvaBackground(host: HTMLElement): () => void {
  const doc = host.ownerDocument
  doc.getElementById(XIAOHEI_SYLVA_STYLE_ID)?.remove()

  const style = doc.createElement('style')
  style.id = XIAOHEI_SYLVA_STYLE_ID
  style.textContent = threeUiStyle
  doc.head.append(style)

  /* Render while detached so the authored WebGL document receives its
     movement adapter before its first navigation. Rewriting srcDoc after a
     connected iframe has started would boot the large scene twice. */
  const mount = doc.createElement('div')
  mount.className = 'xiaohei-scene__world-mount'
  const root = createRoot(mount)
  flushSync(() => root.render(<SylvaLivingWorldScene variant="living-green" />))
  const renderedScene = mount.firstElementChild?.cloneNode(true) as HTMLElement | undefined
  const extractedFrame = renderedScene?.querySelector('iframe') ?? null
  const frame = extractedFrame === null ? null : doc.createElement('iframe')
  if (frame !== null && extractedFrame !== null) {
    for (const attribute of extractedFrame.attributes) {
      if (attribute.name !== 'srcdoc') frame.setAttribute(attribute.name, attribute.value)
    }
    frame.setAttribute('srcdoc', extractedFrame.getAttribute('srcdoc') ?? '')
    extractedFrame.replaceWith(frame)
  }
  const frameWindow = doc.defaultView
  let reactMounted = true
  if (renderedScene !== undefined && frameWindow !== null && frame instanceof frameWindow.HTMLIFrameElement) {
    prepareXiaoheiSylvaAvatarFrame(frame)
    prepareXiaoheiSylvaPointerFrame(frame)
    const sceneHost = renderedScene
    sceneHost.dataset.state = 'loading'
    frame.addEventListener('load', () => {
      sceneHost.dataset.state = 'ready'
    }, { once: true })

    /* The registered component is the authoritative source builder. Its
       detached iframe may already have acquired a browsing context, though,
       so mutating that node can leave the first unadapted document running.
       Clone the authored host but create a fresh iframe, dispose the extractor,
       then connect only the fully adapted document. Reusing a cloned iframe
       can retain its first navigation snapshot in Chromium. This keeps one
       WebGL boot and one renderer. */
    root.unmount()
    reactMounted = false
    mount.replaceChildren(renderedScene)
  }
  host.append(mount)
  const removePointerBridge = installXiaoheiSylvaPointerBridge(
    host,
    prepareXiaoheiSylvaAvatarFrame,
  )

  return () => {
    removePointerBridge()
    if (reactMounted) root.unmount()
    mount.remove()
    style.remove()
  }
}
