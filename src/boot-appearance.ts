export const XIAOHEI_BOOT_APPEARANCE_ATTRIBUTE = 'data-xiaohei-boot-appearance'
export const XIAOHEI_BOOT_APPEARANCE_STYLE_ID = 'dsh-theme-xiaohei/boot-appearance-style'

/**
 * Keep the document on the resolved DSH palette until the complete Xiaohei
 * theme has synchronously taken ownership of the page.
 */
export const XIAOHEI_BOOT_APPEARANCE_CSS = `
html:not([data-xiaohei-boot-appearance]) body:not([data-ds-dark-theme]),
html:not([data-xiaohei-boot-appearance]) body:not([data-ds-dark-theme]) > #root {
  color: #364044;
  background-color: #E7ECEC !important;
}

html:not([data-xiaohei-boot-appearance]) body[data-ds-dark-theme],
html:not([data-xiaohei-boot-appearance]) body[data-ds-dark-theme] > #root {
  color: #D5DEDC;
  background-color: #151C1E !important;
}

html[data-xiaohei-boot-appearance='light'] {
  color-scheme: light !important;
  background-color: #E7ECEC !important;
}

html[data-xiaohei-boot-appearance='light'] body,
html[data-xiaohei-boot-appearance='light'] body > #root {
  color: #364044;
  background-color: #E7ECEC !important;
}

html[data-xiaohei-boot-appearance='dark'] {
  color-scheme: dark !important;
  background-color: #151C1E !important;
}

html[data-xiaohei-boot-appearance='dark'] body,
html[data-xiaohei-boot-appearance='dark'] body > #root {
  color: #D5DEDC;
  background-color: #151C1E !important;
}
`

/** Release the first-frame palette only after ThemeRuntime is authoritative. */
export function releaseXiaoheiBootAppearance(doc: Document): void {
  doc.documentElement.removeAttribute(XIAOHEI_BOOT_APPEARANCE_ATTRIBUTE)
  doc.getElementById(XIAOHEI_BOOT_APPEARANCE_STYLE_ID)?.remove()
}
