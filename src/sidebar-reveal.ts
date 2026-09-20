/** Synchronize native wide content with the visible column, without changing
 * Host layout/state or adding a competing animation timer. */
export function createSidebarReveal(doc: Document) {
  let shell: HTMLElement | undefined
  let observer: MutationObserver | undefined
  let phase = '', width = 0, waiting = false
  const attribute = 'data-xiaohei-sidebar-reveal'
  const readPhase = () => {
    const state = shell?.closest('[data-sidebar-collapsed]')?.getAttribute('data-sidebar-collapsed')
    if (state === 'true') return 'rail'
    if (state === 'false') return 'wide'
    if (shell?.querySelector("button[aria-label='Collapse sidebar'], button[aria-label='收起侧边栏']")) return 'wide'
    return 'rail'
  }
  const apply = () => {
    if (!shell) return
    // The Host freezes its shell at the requested width during grid motion.
    // Reading the inline target does not force a layout.
    const target = Number.parseFloat(shell.style.width)
    if (waiting && phase === 'wide' && (!Number.isFinite(target) || width >= target - 2)) waiting = false
    const value = waiting ? 'waiting' : 'ready'
    if (shell.getAttribute(attribute) !== value) shell.setAttribute(attribute, value)
  }
  const changed = () => {
    const next = readPhase()
    if (next === 'wide' && phase !== 'wide') waiting = true
    if (next === 'rail') waiting = false
    phase = next
    apply()
  }
  return {
    setColumn(column: HTMLElement | undefined) {
      const next = column?.querySelector?.<HTMLElement>("[data-slot='sidebar'] > div") ?? undefined
      if (next === shell) return
      observer?.disconnect(); shell?.removeAttribute(attribute)
      shell = next; waiting = false; phase = readPhase()
      if (!shell) return
      observer = new doc.defaultView!.MutationObserver(changed)
      observer.observe(column!, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-sidebar-collapsed', 'aria-label', 'style'] })
      apply()
    },
    resize(nextWidth: number) { width = nextWidth; apply() },
    dispose() { observer?.disconnect(); shell?.removeAttribute(attribute); shell = undefined },
  }
}
