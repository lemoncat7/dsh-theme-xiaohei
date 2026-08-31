import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { SylvaLivingWorldScene } from '../shaders/sylva-living-world/SylvaLivingWorldScene.js'
import threeUiStyle from '../shaders/threeui.css?raw'
import {
  installXiaoheiSylvaPointerBridge,
  prepareXiaoheiSylvaPointerFrame,
} from './pointer-bridge.js'

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
  const frame = mount.querySelector('iframe')
  const frameWindow = doc.defaultView
  if (frameWindow !== null && frame instanceof frameWindow.HTMLIFrameElement) {
    prepareXiaoheiSylvaPointerFrame(frame)
  }
  host.append(mount)
  const removePointerBridge = installXiaoheiSylvaPointerBridge(host)

  return () => {
    removePointerBridge()
    root.unmount()
    mount.remove()
    style.remove()
  }
}
