import { installXiaoheiWallpaperCharacter } from './scene/wallpaper-character.js'
import { XIAOHEI_WALLPAPER_CHARACTER_CSS } from './scene/wallpaper-character-styles.js'

/** Self-contained native DSH chunk; no new HTTP routes or Desktop origin assumptions. */
export function installDecorations(doc: Document): () => void {
  const style = doc.createElement('style')
  style.id = 'dsh-theme-xiaohei/character-style'
  style.textContent = XIAOHEI_WALLPAPER_CHARACTER_CSS
  doc.head.append(style)
  try {
    const disposeCharacter = installXiaoheiWallpaperCharacter(doc)
    return () => { disposeCharacter(); style.remove() }
  } catch (error) { style.remove(); throw error }
}
