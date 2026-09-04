import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { SylvaLivingWorldScene } from '../shaders/sylva-living-world/SylvaLivingWorldScene.js'
import threeUiStyle from '../shaders/threeui.css?raw'
import {
  injectXiaoheiSylvaPointerBridge,
  installXiaoheiSylvaPointerBridge,
} from './pointer-bridge.js'
import { injectXiaoheiSylvaPerformanceProfile } from './sylva-performance.js'

export const XIAOHEI_SYLVA_STYLE_ID = 'dsh-theme-xiaohei/threeui-style'

/** Mount the exact registered ThreeUI scene into the theme-owned world layer. */
export function mountXiaoheiSylvaBackground(host: HTMLElement): () => void {
  const doc = host.ownerDocument
  doc.getElementById(XIAOHEI_SYLVA_STYLE_ID)?.remove()

  const style = doc.createElement('style')
  style.id = XIAOHEI_SYLVA_STYLE_ID
  style.textContent = threeUiStyle
  doc.head.append(style)

  /* React assigns srcDoc during this synchronous render. Intercept that one
     assignment so the authored iframe's very first navigation already holds
     both adapters. Rewriting srcDoc afterwards leaves Chromium's running
     document on the original snapshot even when the attribute looks updated. */
  const mount = doc.createElement('div')
  mount.className = 'xiaohei-scene__world-mount'
  const root = createRoot(mount)
  const frameWindow = doc.defaultView
  if (frameWindow === null) {
    root.unmount()
    style.remove()
    return () => {}
  }

  const elementPrototype = frameWindow.Element.prototype
  const iframePrototype = frameWindow.HTMLIFrameElement.prototype
  const nativeSetAttribute = elementPrototype.setAttribute
  const srcDocDescriptor = Object.getOwnPropertyDescriptor(iframePrototype, 'srcdoc')
  const composeSource = (source: string): string => (
    source.includes('<title>Interactive procedural moss root world</title>')
      ? injectXiaoheiSylvaPointerBridge(injectXiaoheiSylvaPerformanceProfile(source))
      : source
  )

  const patchedSetAttribute = function setXiaoheiAttribute(
    this: Element,
    name: string,
    value: string,
  ): void {
    const isSceneSource = this instanceof frameWindow.HTMLIFrameElement && name.toLowerCase() === 'srcdoc'
    nativeSetAttribute.call(this, name, isSceneSource ? composeSource(String(value)) : value)
  }
  elementPrototype.setAttribute = patchedSetAttribute
  const patchedSrcDocSetter = function setXiaoheiSrcDoc(this: HTMLIFrameElement, value: string): void {
    srcDocDescriptor?.set?.call(this, composeSource(String(value)))
  }
  if (srcDocDescriptor?.set !== undefined && srcDocDescriptor.configurable) {
    Object.defineProperty(iframePrototype, 'srcdoc', {
      ...srcDocDescriptor,
      set: patchedSrcDocSetter,
    })
  }

  const restoreSourceInterceptors = (): void => {
    if (elementPrototype.setAttribute === patchedSetAttribute) {
      elementPrototype.setAttribute = nativeSetAttribute
    }
    const currentDescriptor = Object.getOwnPropertyDescriptor(iframePrototype, 'srcdoc')
    if (currentDescriptor?.set === patchedSrcDocSetter && srcDocDescriptor !== undefined) {
      Object.defineProperty(iframePrototype, 'srcdoc', srcDocDescriptor)
    }
  }
  try {
    flushSync(() => root.render(<SylvaLivingWorldScene variant="living-green" />))
  } catch (error) {
    restoreSourceInterceptors()
    throw error
  }

  const frame = mount.querySelector('iframe')
  if (frame instanceof frameWindow.HTMLIFrameElement) {
    frame.dataset.xiaoheiPointerBridge = 'true'
  }
  host.append(mount)
  const removePointerBridge = installXiaoheiSylvaPointerBridge(host)

  return () => {
    removePointerBridge()
    restoreSourceInterceptors()
    root.unmount()
    mount.remove()
    style.remove()
  }
}
