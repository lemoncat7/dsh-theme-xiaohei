"""Prepare matched first-paint/detail wallpapers from original PNGs.

Only the hand crop uses the reviewed DSH image-edit outputs. Never regenerate
the face/scene or upscale the whole wallpaper: the existing rig is calibrated
in 1672x940 source coordinates. Run explicitly, not during package builds.
"""
import argparse
import io
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SIZE = (1672, 940)
CROP = (1010, 360, 1280, 565)


def prepare(mode, source, hand, thumb=None):
    original = Image.open(source).convert('RGB').resize(SIZE, Image.Resampling.LANCZOS)
    edited = Image.open(hand).convert('RGB').resize((270, 205), Image.Resampling.LANCZOS)
    if thumb:
        correction = Image.open(thumb).convert('RGB').resize((270, 205), Image.Resampling.LANCZOS)
        thumb_mask = Image.new('L', (270, 205))
        # Confine the second edit to the thumb, web and thenar base. Preserve
        # the other four finger silhouettes from the previous reviewed image.
        ImageDraw.Draw(thumb_mask).polygon([
            (112, 40), (153, 40), (167, 119), (149, 144),
            (129, 128), (111, 108), (107, 91), (118, 82),
        ], fill=255)
        thumb_mask = thumb_mask.filter(ImageFilter.GaussianBlur(2))
        edited.paste(correction, (0, 0), thumb_mask)
    mask = Image.new('L', (270, 205))
    # All five fingertips are inside the opaque region. Fade only in the
    # surrounding atmosphere and unchanged forearm, never across a fingertip.
    ImageDraw.Draw(mask).rectangle((44, 38, 184, 175), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    original.paste(edited, CROP[:2], mask)
    out = ROOT / 'src/assets/rift'
    stem = 'scene' if mode == 'dark' else 'scene-light'
    original.save(out / (stem + '-detail.webp'), 'WEBP', quality=92, method=6)
    # Small inline first-paint asset keeps startup independent of decoration JS.
    for quality in range(78, 29, -2):
        stream = io.BytesIO()
        original.save(stream, 'WEBP', quality=quality, method=6)
        if stream.tell() <= 90_000:
            (out / (stem + '.webp')).write_bytes(stream.getvalue())
            break
    else:
        raise RuntimeError('First-paint asset exceeds budget')
    print(mode, 'first-paint quality', quality, 'first-paint bytes', stream.tell(),
          'detail bytes', (out / (stem + '-detail.webp')).stat().st_size)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    for name in ['dark', 'light', 'dark-hand', 'light-hand']:
        parser.add_argument('--' + name, required=True, type=Path)
    for name in ['dark-thumb', 'light-thumb']:
        parser.add_argument('--' + name, type=Path)
    args = parser.parse_args()
    prepare('dark', args.dark, args.dark_hand, args.dark_thumb)
    prepare('light', args.light, args.light_hand, args.light_thumb)
