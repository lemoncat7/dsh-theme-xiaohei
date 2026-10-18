# Rift 6 — edge metal ribbons

- Replaces the hand-local ring with 192 deterministic angular metal sprites in two vertical bands. Chrome facets and angle-dependent highlights, not additive white dots. Light/dark share geometry, not colors.
- Visually informed by React Bits AeroShards; independently implemented in the existing WebGL context. No WebGPU dependency, multipass bloom, CPU per-particle updates, extra image assets, or new animation loop.
- Measures the visible conversation scrollport on resize/session changes, not every frame. Sidebars can collapse without hiding the effect. Center reading area does not attract particles. Decorative canvas remains pointer-events:none.
- Pointer repulsion is local to the edges; passive conversation scrolling accelerates the flow briefly, then decays. There is no click/hold burst or scroll interception.
- Rendering remains capped at 1.2 M pixels, 18 fps idle / 24 fps interactive. Hidden, unfocused, reduced-motion, compact and save-data views stop animation. WebGL failure keeps the wallpaper.
- First paint reads the official DSH literal bootstrap preference; system media query is used only for system/fallback preference. Native theme markers bridge to runtime ownership. No new storage, boot script, or observer is introduced.

Verification: unit tests, six pre-plugin preference/system combinations, dark/light screenshots, side-boundary and center-pointer assertions, scroll-flow acceleration, pause/reduced-motion/mobile checks, native dialogs and sidebar controls. Deployment uses a package-scoped backup and rollback, with dependencies and other plugins protected.

## Deployment — 2026-10-17

- Installed `0.5.0-rift.6` in `dsh-docker-dsh-1`; health check passed. Verified all 21 packaged files; other plugins and dependency graph unchanged.
- Archive SHA-256: `d9bff95e947b0fd2ed269583a48b186c97d9e58a7e59928b1e23f796f14aeccd`.
- Backup: `/home/moye/Online Document/dsh-docker/backups/theme-rift-EhFkY9`.
- Unit tests: 140 passed, 1 historical test skipped, 0 failures.
- Final preview and installed-package browser checks passed, including native bootstrap detection and six first-paint combinations. Live: zero page errors; zero draw calls while paused. One earlier headless run crashed without a captured cause; subsequent full preview and live runs completed normally. Do not treat this as a comprehensive hardware performance benchmark.
- Local evidence: `/tmp/rift6-test.log`, `/tmp/rift6-preview-final.log`, `/tmp/rift6-deploy.log`, `/tmp/rift6-browser-result.json`. Visual captures: `/tmp/rift6-dark.png`, `/tmp/rift6-light.png`, `/tmp/rift6-conversation.png`, `/tmp/rift6-conversation-light.png`.
- Kept on `feat/luoxiaohei-spirit-realm`; no push, npm release or main merge in this task.
