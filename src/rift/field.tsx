import { useEffect, useState, type CSSProperties } from 'react'
import { bindRiftInteractions, type RiftSignal } from './interaction.js'

/** Mounted by a native React slot; ornaments never accept pointer events. */
export function RiftField() {
  const [signal, setSignal] = useState<RiftSignal | null>(null)
  useEffect(() => {
    let timer = 0
    const dispose = bindRiftInteractions(document, next => {
      window.clearTimeout(timer); setSignal(next)
      timer = window.setTimeout(() => setSignal(null), 1100)
    })
    return () => { dispose(); window.clearTimeout(timer) }
  }, [])
  return signal && <div key={signal.serial} className="rift-impulse" data-kind={signal.kind} aria-hidden="true"
    style={{ left: signal.x, top: signal.y, width: signal.width, height: signal.height } as CSSProperties}>
    <span className="rift-impulse__edge"/><span className="rift-impulse__shard rift-impulse__shard--a"/><span className="rift-impulse__shard rift-impulse__shard--b"/>
  </div>
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
      <span className="rift-resonance__glyph"><i/><i/><i/></span>
      <span>{({ idle: '领域待命', thinking: '正在聚能', streaming: '正在回应', tool: '正在执行', waiting: '等待你的回应', complete: '本轮结束', error: '执行异常' } as Record<string, string>)[state] || '领域待命'}</span>
      <span className="rift-resonance__trace"/>
    </div>
}
