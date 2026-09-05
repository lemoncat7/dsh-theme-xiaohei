"""Prepare complete, reviewed v8 poses; preserve the v7 seated coordinate system.

Run after the bundled imagegen chroma extraction:
  uv run --with pillow python scripts/prepare-wallpaper-v8.py /path/to/output/imagegen
No anatomy warping or skeletal deformation; only whole-canvas registration,
shared stone/feet below the pose changes, alpha edging and lossless web export.
"""
from pathlib import Path
import sys
from PIL import Image, ImageChops

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / 'src/assets/background'
base = {}
for mode, suffix in [('light', ''), ('dark', '-dark')]:
    base[mode] = Image.open(source / f'xiaohei-v7-seated{suffix}-alpha.png').convert('RGBA')
base['dark'] = base['dark'].resize(base['light'].size, Image.Resampling.LANCZOS)
union = ImageChops.lighter(base['light'].getchannel('A'), base['dark'].getchannel('A'))
seated_box = union.point(lambda v: 255 if v >= 40 else 0).getbbox()

for pose in ('chin', 'doze', 'halfpeek'):
    pair = {}
    for mode, suffix in [('light', ''), ('dark', '-dark')]:
        pair[mode] = Image.open(source / f'xiaohei-v8-{pose}{suffix}-alpha.png').convert('RGBA')
    size = base['light'].size if pose != 'halfpeek' else pair['light'].size
    pair = {mode: image.resize(size, Image.Resampling.LANCZOS) for mode, image in pair.items()}
    box = seated_box
    if pose == 'halfpeek':
        alpha = ImageChops.lighter(pair['light'].getchannel('A'), pair['dark'].getchannel('A'))
        box = alpha.point(lambda v: 255 if v >= 40 else 0).getbbox()
    for mode, image in pair.items():
        if pose != 'halfpeek':
            # The lower legs, sneakers and stone below the hands never change.
            # Reuse those exact original pixels to avoid the ledge shimmering.
            blend = Image.new('L', (1, size[1]), 0)
            for y in range(940, size[1]):
                blend.putpixel((0, y), min(255, round((y - 940) / 16 * 255)))
            image = Image.composite(base[mode], image, blend.resize(size))
        image = image.crop(box)
        if pose != 'halfpeek':
            alpha = image.getchannel('A')
            start = int(image.height * .975)
            ramp = Image.new('L', (1, image.height), 255)
            for y in range(start, image.height):
                ramp.putpixel((0, y), round(255 * (image.height - 1 - y) / max(1, image.height - 1 - start)))
            image.putalpha(ImageChops.multiply(alpha, ramp.resize(image.size)))
        width = 360 if pose == 'halfpeek' else 720
        image = image.resize((width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
        destination = target / f'xiaohei-{pose}-v8-{mode}.webp'
        image.save(destination, lossless=True, method=6)
        print(destination.name, image.size, destination.stat().st_size)
