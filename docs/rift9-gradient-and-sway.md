# Rift 9 — fading bubbles and visible buoyancy

## Scope

- Light assistant bubbles fade horizontally from the previous .62 opacity to
  zero; outgoing and draft bubbles fade from .72 to zero. No opacity/mask is
  applied to the content, so links, selection, text and controls remain intact.
- Removed the hard right border and cast shadow on light outgoing bubbles.
  A small light glyph halo supports reading over the artwork. Code surfaces,
  composer, tool states and dark bubble colors remain unchanged.
- A fully transparent edge cannot guarantee text contrast against every artwork
  pixel. `prefers-contrast: more` opts into .94 opacity without the text halo.
  The regression contrast check covers the left edge only, not the entire fade.
- Existing scenery displacement is enlarged roughly 2–3×, with shorter smooth
  periods: architecture 7–12 px vertical amplitude; hand 4.8 px; sleeve 4 px;
  hem 8.5 px horizontal. These are source pixels, scaled with the artwork.
  Hand and sleeve remain in phase; continuous region falloff is preserved.
- Eye tracking, head/ear motion, atlases and frame/draw budgets are unchanged.
  No new timer, texture, network request or draw pass. Existing visibility,
  reduced-motion, compact and manual pause controls still apply.

## Verification

- 151 tests: 150 passed, one existing skipped, zero failures.
- Browser fixture captures both appearances at 0/2/7 seconds to compare motion
  extremes, plus real conversations, gradient text and native interaction state.
- Branch remains `feat/luoxiaohei-spirit-realm`; no push or npm publication.

## Deployment — 2026-10-18

- Production `dsh-docker-dsh-1`: theme `0.5.0-rift.9`, healthy. All 21 package
  files match the archive; other plugins and dependency graph unchanged.
- Full visual preview and installed-package interaction acceptance passed with
  zero page errors and zero paused frames. Separate CSS browser verification
  covered opaque text, unchanged controls/dark mode and increased contrast.
- Slab edge matching between t=2 and t=7 captures measured (7,19) screen-pixel
  displacement in both appearances at the tested 1440×1000 viewport.
- First install rolled back after the headless browser crashed while taking a
  screenshot. Visual screenshots remain part of preview; installed-package
  acceptance runs the same interaction assertions without duplicate GPU
  readbacks. One browser-only retry is allowed for native browser crashes,
  never for assertion failures. The next installation passed.
- Cold-host workspace hydration needed explicit re-expansion before asserting
  expanded state; this is an acceptance-fixture change, not a host/plugin edit.
- SHA-256: `3d3bbe2670d7eb6fe3d8a637ccef9e89706978479cfa10ab3d5d486c81f3c47d`.
- Backup: `/home/moye/Online Document/dsh-docker/backups/theme-rift-TVVAAT`.
- Entry 50,095 bytes; deferred decorations 267,582 bytes; package ~368 KB.
