# Generated wind-layer rig (2026-10-20)

## Current motion selection

At the user's request, only index 0 (the ahoge/curl) is active. The side locks,
arm/sleeve and hem stay at their exact original pixels: their clock slots are
zero and their shader paint calls are omitted. The full atlas/source layers
remain available for reference, not animated. Head tilt/nod and fallback head
parallax are also disabled; ear response and existing eye interactions remain.
The bottom-right foreground building is pinned, including overlap from the
far-right architecture. Distant slabs and existing UI interactions are unchanged.

`wind-layer-config.ts` is the single enabled-joint list shared by controller and
shader. Tests cover disabled joints even when nonzero uniforms are supplied,
and a 49-frame WebGL grid check covers the foreground building. The following
sections document how the underlying layers were made, not which are enabled.

Replaces the previous wallpaper hair/arm displacement and narrow cuff rig.
The user explicitly authorized the existing DSH image service, rather than
the unavailable built-in image-generation tool. Four reference-edit requests
were made through the installed `generate_image` tool, using its configured
`gpt-image-2.5` model and saved credential. No secrets are saved in this repo.

## Art production

The original face, hands, ink and accepted light/dark wallpapers are unchanged.
The generated body plate removes the outstretched arm/sleeve and loose hem;
it reconstructs the sky, shirt and trousers underneath them. The generated
hair plate removes the curl and two peripheral locks, reconstructing the
previously hidden background/hair/skin. Only uncovered pixels of those plates
are ever visible. This is not five independently redrawn characters.

Full prompts and service workflow: `scripts/generate-wind-layer-plates.mjs`.
Local artifacts: `output/wind-layers-v1/{light,dark}-{body,hair}/` contains
reference, request, result and generated image. `{light,dark}-layers/` contains
five transparent original-art PNGs, clean base, review sheet and provenance
manifest. They are intentionally not shipped in the npm package.

`prepare-wind-layer-references.py` creates aspect-matched crops.
`build-wind-layers.py` builds the five layers and packed atlas. Run these
explicitly, not during ordinary npm builds (which never call the image API).

## Runtime

`wind-layer-geometry.ts` records shared source-space pivots/origins. Each layer
uses an anchored joint: attachment zones stay at source coordinates, a smooth
weight transitions inside the layer, and free tips rotate. This fixes the old
rig's moving alpha-faded roots which detached from the scalp. Generated hidden
RGB and original alpha coverage share a 640×1280 atlas; visible RGB samples
the untouched source artwork, avoiding a second lossy pass on the face/hand.

The first 320-pixel column stores repair RGB and an independent opaque cleanup
mask covering old ink and antialiased fringes. The second holds foreground
alpha. Repair RGB is preserved outside foreground coverage too (WebP otherwise
discards transparent pixels), preventing black seams. Cleanup fades with travel
below 1.25 source pixels so near-stationary joints do not flash. Finger masks
include the drawn outline, not only the warm skin interior. Face/shoulder and
hem attachment zones are pinned. Ear response peaks around 3.5 degrees with a
1.25-second damped return, retaining the existing proximity dwell/cooldown.

Three hair locks, the connected arm/sleeve, and hem have damped angular joints
on the existing clock. The skull stays fixed for layer registration; existing
blink, gaze and ear responses remain. Old experimental cloth/arm modules are
retained for comparison but are not bundled into the deployed renderer.

No new animation loop, API calls, or network requests at runtime. Atlases load
only with decorations, selected by appearance; the pair is under 40 KB. The
entire decorations bundle remains under 500 KB. Failure keeps the original
static character and existing scenery/interaction, not incomplete layers.
Hidden/blur/reduced-motion/disabled behavior is unchanged.

This is a layered 2D illustration, not physical cloth simulation or 3D anatomy.

## Checks

- `npm test`: damping/continuity, pause/seek, 18/24/60 fps, deferred budget,
  absence of legacy warps, shape fallback and renderer cleanup.
- `review-wind-layers.mjs`: real WebGL, both palettes, 19 frames each;
  exact neutral/fallback artwork; face/torso and three hair roots remain
  unchanged, including positive/negative angular extremes. Vacated finger-ink
  pixels must equal their generated repair pixels (no old silhouette residue).
- `verify-rift-wind.mjs`: full renderer compile, real artwork screenshots,
  both ear response extremes, paired header style and small-screen layout.
- Live deployed check: atlas-ready uniform, all layer updates, reduced-motion
  pause/resume and browser errors.
