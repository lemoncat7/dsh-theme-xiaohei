import { useEffect, useState } from 'react'
import { bindRiftInteractions } from './interaction.js'
import { createRiftImpulse } from './impulse.js'
import { bindRiftPresentation } from './view.js'

/** React owns the lifetime; the contour follows the actual control in body,
 * not the potentially transformed shell.overlay coordinate system. */
export function RiftField() {
  useEffect(() => bindRiftPresentation(document, () => {
    const impulse = createRiftImpulse(document)
    const unbind = bindRiftInteractions(document, (signal, target) => impulse.show(signal, target))
    return () => { unbind(); impulse.dispose() }
  }), [])
  return null
}

export function RiftResonance() {
  const [state, setState] = useState('idle')
  useEffect(() => {
    const root = document.documentElement
    const update = () => setState(root.getAttribute('data-xiaohei-state') || 'idle')
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['data-xiaohei-state'] }); update()
    return () => observer.disconnect()
  }, [])
  return <div className="rift-resonance" data-state={state} aria-hidden="true">
      <span>{({ idle: '领域待命', thinking: '正在聚能', streaming: '正在回应', tool: '正在执行', waiting: '等待你的回应', complete: '本轮结束', error: '执行异常' } as Record<string, string>)[state] || '领域待命'}</span>
      <span className="rift-resonance__trace"/>
    </div>
}
