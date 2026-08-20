/** Semantic material tokens shared by every themed control surface. */
export const XIAOHEI_CHROME_TOKENS_CSS = `
html {
  --xiaohei-chrome-accent: rgb(101 209 190 / 92%);
  --xiaohei-chrome-accent-strong: #78DDCB;
  --xiaohei-chrome-accent-soft: rgb(101 209 190 / 14%);
  --xiaohei-chrome-edge: rgb(139 229 213 / 22%);
  --xiaohei-chrome-edge-strong: rgb(139 229 213 / 42%);
  --xiaohei-chrome-surface: rgb(11 27 30 / 94%);
  --xiaohei-chrome-surface-raised: rgb(19 45 45 / 96%);
  --xiaohei-chrome-shadow: rgb(1 9 10 / 34%);
  --xiaohei-chrome-focus-shadow: rgb(101 209 190 / 18%);
}

html[data-xiaohei-appearance='light'] {
  --xiaohei-chrome-accent: rgb(47 133 118 / 90%);
  --xiaohei-chrome-accent-strong: #2F8576;
  --xiaohei-chrome-accent-soft: rgb(47 133 118 / 10%);
  --xiaohei-chrome-edge: rgb(36 94 81 / 18%);
  --xiaohei-chrome-edge-strong: rgb(36 94 81 / 34%);
  --xiaohei-chrome-surface: rgb(247 250 247 / 96%);
  --xiaohei-chrome-surface-raised: rgb(251 252 250 / 98%);
  --xiaohei-chrome-shadow: rgb(44 73 60 / 14%);
  --xiaohei-chrome-focus-shadow: rgb(47 133 118 / 14%);
}
`
