# Rift 7 — character-led interaction

Replaces Rift 6's rejected, continuously emitting edge shard ribbons. No new
objects orbit Xiaohei. The existing human-child artwork and day/night background
remain intact; changes are concentrated on the character's face and ears.

## Behavior and boundaries

- Nearby pointer: bounded eye tracking (2.3 x 1.5 source pixels), <= .008 rad head
  tilt. A .65 s dwell triggers a blink/ear response with a 5 s cooldown.
- Input focus: looks toward the composer using its visual event coordinates,
  without reading draft text or subscribing to every keystroke.
- Beginning a response: a <= 2.4 px, .65 s nod. Idle blinks have varied intervals.
- Background pointer dust: 24 maximum, no idle emission; expires within 1.1 s.
  Text, controls, composer, dialogs, menus and sidebars suppress dust emission.
- Existing passive <= 10 px scroll parallax remains; head adds <= 3.5 px depth.
- One WebGL context and shared clock; no new animation timer, gateway event,
  persistent session data or dependencies. Blur, hidden, reduced motion, compact,
  save-data and user-disable policies continue to gate animation.
- Atlas decode failure keeps the static original wallpaper. Cold start CSS still
  uses the stored DSH theme preference, with no character atlas in the boot HTML.

## Assets and provenance

Image-generation skill used through the previously user-authorized **DSH image
plugin**, not the built-in image_gen tool or the OpenAI CLI fallback. Configured
model: `gpt-image-2.5`. Inputs are close-up edit targets of the existing art.

Full prompt sets and original generated images are retained locally:

- `/home/moye/Online Document/output/imagegen/xiaohei-interaction-20261018/dark/request.json`
- `/home/moye/Online Document/output/imagegen/xiaohei-interaction-20261018/light/request.json`
- The corresponding `generated/` subdirectories contain original outputs.

Prompt intent: change only the eyes to a calm natural blink; preserve exact face,
head angle, white hair, cat ears, pose, lighting, colors and crop; no new objects,
particles, text or expression changes. Only the eyelid patches survive into the
final asset, not the generator's replacement hair/background pixels.

Workspace assets:

- `src/assets/rift/character-dark.webp`
- `src/assets/rift/character-light.webp`
- `scripts/prepare-character-rig.py` reconstructs five calibrated atlas layers:
  exposed-background repair, iris-free head, eyelids, irises and eye aperture.

Atlas total: 61,902 bytes. The entry and boot-image budgets are unchanged. Deferred
decorations budget becomes 330 KB to accommodate the new independently composited
head/iris/eyelid layers. No source from React Bits was copied.

## Verification

Unit tests cover source-to-viewport coordinates, dwell/cooldown, bounded gaze,
blink envelope, focus/response/reset, ephemeral dust, cleanup and asset isolation.
Browser acceptance also freezes rendering at rest/closed/maximal movement for
visual inspection, then verifies real pointer-driven pose changes and dust decay.
The visual test's forced appearance is browser-local and never persists a host
theme setting. Production deployment remains package-scoped with rollback.

### Verified deployment — 2026-10-18

- `npm test`: 146 tests, 145 passed, one existing skipped, zero failures.
- Preview and installed-package browser checks passed: both appearances; six
  boot-preference combinations; blink, ear response and gaze return; dust decay;
  sidebar/composer/settings contracts; reduced motion, blur, manual pause and
  narrow viewport. No page errors; paused renderer emitted zero frames.
- Inspected rest, closed eyes and maximum movement in both appearances. The
  composer-focus fixture was explicitly blurred before asserting neutral gaze.
- Headless browser crashed intermittently during preliminary checks; a full
  preview run and the final installed-package run both completed successfully.
- Initial deployment was rolled back when its authentication probe encountered
  a boot-time socket reset. The acceptance script now retries bounded transient
  transport failures; the second deployment completed and verified successfully.
- Production: `dsh-docker-dsh-1`, DSH `0.2.0-rc.2`, theme `0.5.0-rift.7`, healthy.
  All 21 installed package files matched the archive. Other plugins unchanged.
- Archive SHA-256:
  `9aa89deb0a83965061efcc85693ff4708e9f3fe5be381cc253086661ceed0cc8`.
- Rollback backup:
  `/home/moye/Online Document/dsh-docker/backups/theme-rift-oxcL1c`.
- Entry: 47,694 bytes; deferred decorations: 299,859 bytes; packed archive ~400 KB.
- Still on `feat/luoxiaohei-spirit-realm`; not pushed, published or merged.
