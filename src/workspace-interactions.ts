/** Stable semantic selector owned by DSH's workspace browser. */
const WORKSPACE_FOLDER_SELECTOR = "#root [data-slot='sidebar.workspaces'] [role='treeitem'][aria-expanded]"
const RELEASE_DURATION_MS = 720

function workspaceFolderAt(target: EventTarget | null): HTMLElement | undefined {
  if (!(target instanceof Element)) return undefined
  return target.closest<HTMLElement>(WORKSPACE_FOLDER_SELECTOR) ?? undefined
}

/**
 * Bind delegated workspace-folder feedback without observing or rewriting the
 * host tree. Dynamic workspace rows are handled by the same document listeners.
 */
export function installXiaoheiWorkspaceInteractions(
  doc: Document | undefined = typeof document === 'undefined' ? undefined : document,
): () => void {
  if (doc === undefined) return () => {}

  const win = doc.defaultView
  if (win === null) return () => {}

  let activeRow: HTMLElement | undefined
  let animationFrame = 0
  let pendingPoint: { row: HTMLElement; x: number; y: number } | undefined
  const releaseTimers = new Map<HTMLElement, number>()

  const clearHover = (): void => {
    if (activeRow === undefined) return
    activeRow.removeAttribute('data-xiaohei-workspace-hover')
    activeRow.style.removeProperty('--xiaohei-workspace-pointer-x')
    activeRow.style.removeProperty('--xiaohei-workspace-pointer-y')
    activeRow = undefined
  }

  const applyPointerPoint = (): void => {
    animationFrame = 0
    if (pendingPoint === undefined) return
    const { row, x, y } = pendingPoint
    pendingPoint = undefined
    if (!row.isConnected) return
    row.style.setProperty('--xiaohei-workspace-pointer-x', `${x.toFixed(1)}px`)
    row.style.setProperty('--xiaohei-workspace-pointer-y', `${y.toFixed(1)}px`)
  }

  const onPointerMove = (event: PointerEvent): void => {
    if (event.pointerType === 'touch') return
    const row = workspaceFolderAt(event.target)
    if (row === undefined) {
      clearHover()
      return
    }

    if (activeRow !== row) {
      clearHover()
      activeRow = row
      row.setAttribute('data-xiaohei-workspace-hover', 'true')
    }

    if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = row.getBoundingClientRect()
    pendingPoint = {
      row,
      x: Math.min(rect.width, Math.max(0, event.clientX - rect.left)),
      y: Math.min(rect.height, Math.max(0, event.clientY - rect.top)),
    }
    if (animationFrame === 0) animationFrame = win.requestAnimationFrame(applyPointerPoint)
  }

  const onPointerOut = (event: PointerEvent): void => {
    if (activeRow === undefined) return
    const nextRow = workspaceFolderAt(event.relatedTarget)
    if (nextRow !== activeRow) clearHover()
  }

  const onClick = (event: MouseEvent): void => {
    const row = workspaceFolderAt(event.target)
    if (row === undefined) return
    if (event.target instanceof Element && event.target.closest('button') !== null) return

    const previousTimer = releaseTimers.get(row)
    if (previousTimer !== undefined) win.clearTimeout(previousTimer)
    row.removeAttribute('data-xiaohei-workspace-release')
    void row.offsetWidth
    row.setAttribute('data-xiaohei-workspace-release', 'true')
    const timer = win.setTimeout(() => {
      row.removeAttribute('data-xiaohei-workspace-release')
      releaseTimers.delete(row)
    }, RELEASE_DURATION_MS)
    releaseTimers.set(row, timer)
  }

  doc.addEventListener('pointermove', onPointerMove)
  doc.addEventListener('pointerout', onPointerOut)
  doc.addEventListener('click', onClick)

  return () => {
    doc.removeEventListener('pointermove', onPointerMove)
    doc.removeEventListener('pointerout', onPointerOut)
    doc.removeEventListener('click', onClick)
    if (animationFrame !== 0) win.cancelAnimationFrame(animationFrame)
    clearHover()
    for (const [row, timer] of releaseTimers) {
      win.clearTimeout(timer)
      row.removeAttribute('data-xiaohei-workspace-release')
    }
    releaseTimers.clear()
  }
}
