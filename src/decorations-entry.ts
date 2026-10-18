import { installRiftScene } from './rift/runtime.js'

/** Self-contained native DSH chunk; no new HTTP routes or Desktop origin assumptions. */
export function installDecorations(doc: Document): () => void {
  return installRiftScene(doc)
}
