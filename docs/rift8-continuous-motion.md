# Rift 8 — continuous eyes, floating scenery, clearer daylight

## Changes

- Removed extracted iris compositing and synthetic eye-white fill. The shader
  samples the original scene RGB for the whole head and deforms the eye interior
  with an eroded, feathered mask. Eyelid displacement falls continuously to zero.
  Effective gaze travel is capped at 1.495 × .975 source pixels; it fades out as
  eyes close. This also avoids recompressing the face separately from the scene.
- Four-row rig atlas instead of five: edge repair, silhouette, existing blink
  patches, continuous eye mask. Combined size 36,608 bytes, down from 61,902.
  No new generated images or external assets; original art and blink provenance
  remain in `rift7-character-interaction.md`.
- Existing architecture gets broad, smooth displacement fields (up to 5 source
  pixels per architectural region). Hand/sleeve move together at 1–2 px; the hem
  adds a slower wave around 3 px. Regions share the existing clock and draw pass,
  with different slow periods, no sawtooth resets, no added objects or timers.
- Light assistant surface opacity: .76 → .62; tool surfaces .80 → .68; user
  bubbles and composer use lower-opacity glass. Dark CSS/palette is unchanged.
  Darker secondary text retains 4.5:1 contrast even over black artwork beneath
  the light assistant surface. No new blur layer or full-screen reading veil.
- Existing pause, reduced-motion, compact, visibility and save-data gates remain.

## Verification

- `npm test`: 149 tests; 148 passed, one existing skipped, zero failures.
- Added regression checks for continuous original-image eye sampling, bounded
  region shader structure and worst-case light reading contrast.
- Browser visual review covers both eyes at left/right extremes, blink and head
  pose; scenery frozen at 0/5/12 seconds; light/dark message and composer layers.
  Browser-only fixtures do not submit messages or save host settings.

## Deployment — 2026-10-18

- Installed `0.5.0-rift.8` in `dsh-docker-dsh-1`, DSH `0.2.0-rc.2`.
- Preview and installed-package browser acceptance passed; zero page errors,
  zero paused frames; light/dark appearance, boot, sidebar, focus, blink, gaze,
  dust decay, settings and compact/reduced-motion behavior verified.
- First attempt rolled back after startup authentication timed out. Acceptance
  now reads only the current container start's logs with a larger bounded tail
  and retries transient startup failures for a bounded interval. Retry passed.
- All 21 package files matched the archive; other plugins and dependency graph
  unchanged; container healthy after installation.
- Archive SHA-256:
  `a3717c021f7a71c34b874645665b4f56019da3eeb1859f4796de134b816616bf`.
- Rollback backup:
  `/home/moye/Online Document/dsh-docker/backups/theme-rift-KFk3oF`.
- Entry 48,193 bytes; deferred decorations 267,579 bytes (previously 299,859).
- Still on `feat/luoxiaohei-spirit-realm`; no push, merge or npm publication.
