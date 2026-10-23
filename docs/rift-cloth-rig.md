# Original-art cloth rig

The previous ellipse displacement stretched the drawn sleeve and hem. It is
disabled. `scene-motion.ts` pins the entire shirt, arm and trousers; it only
moves scenery. The new cloth pass replaces two independently traced cutouts:

- Lower cuff: hinge `(1242, 534)`, maximum target angle `0.13` radians.
- Left hem flap: hinge `(1280, 665)`, maximum target angle `0.125` radians.
- Outstretched arm: shoulder pivot `(1290, 477)`, maximum target `0.018`
  radians (about one degree), slower response than the fabric. Hand, fingers
  and forearm share a rigid coordinate rotation; falloff is outside their
  contours and inside the upper sleeve attachment. The face, waist and other
  arm stay fixed. `arm-shader.ts` remaps both the original scene and cuff
  pass together, so neither the original arm nor a detached cuff is left behind.

`cloth-shader.ts` rotates source coordinates rigidly, preserving distances,
stroke width and fold geometry. Narrow fixed attachment zones cover the roots.
This is a 2D articulated illustration, not a physical cloth simulation.

`prepare-cloth-rig.py` deterministically extracts coverage from the original
light/dark artwork. No image generation or source artwork replacement is used.
The compact lossless atlas stores coverage and hidden-background repairs; actual
cloth color is sampled from the original wallpaper. The hem exposes the existing
trouser material, not sky extrapolated across the removed flap. Rest-state
coverage replacement is identity, including antialiased edges.

`cloth-motion.ts` owns three damped angular joints driven by the shared prevailing
wind envelope. It advances on the existing scene clock, with bounded integration
and no new animation loop. Hidden/blurred/reduced-motion/disabled scenes keep the
existing pause behavior. Missing/corrupt cloth data leaves the original clothing
static without disabling the rest of the scene.

Assets load only with deferred decorations, under a combined 32 KB budget. The
renderer owns and deletes the one additional texture. No first-paint assets,
native input behavior or theme preference are changed.

Validation: `npm test`, `verify-rift-motion-pins.mjs`,
`verify-rift-wind-composite.mjs`, `verify-rift-cloth.mjs`,
`verify-rift-arm.mjs`, `verify-rift-wind.mjs` (light/dark real artwork frames in
`/tmp/rift-wind-review`). The scenery-only pin test deliberately excludes the
new arm pass; the arm test separately checks rigid hand geometry, fixed
face/torso and nonfolding transition pixels at the full permitted amplitude.
