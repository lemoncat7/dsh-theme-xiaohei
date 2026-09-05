"""Prepare reviewed keyed PNGs after the imagegen chroma-removal step.

Usage: python scripts/prepare-wallpaper-v7.py /path/to/output/imagegen
Requires Pillow; not part of the normal build or installation.
"""
from pathlib import Path
import sys
from PIL import Image, ImageChops

source = Path(sys.argv[1])
target = Path(__file__).resolve().parents[1] / 'src/assets/background'
for mode in ('light', 'dark'):
    # This area of the approved v6 art contains only atmosphere, no character
    # or ledge. No generated scene detail is painted over or sharpened.
    image = Image.open(source / f'xiaohei-quiet-v6-desktop-{mode}.png').convert('RGB')
    image.crop((0, 0, 1100, image.height)).save(target / f'xiaohei-sky-v7-{mode}.webp', quality=88, method=6)

for pose, max_width in [('seated', 720), ('peek', 360)]:
    day = Image.open(source / f'xiaohei-v7-{pose}-alpha.png').convert('RGBA')
    night = Image.open(source / f'xiaohei-v7-{pose}-dark-alpha.png').convert('RGBA')
    if night.size != day.size:
        night = night.resize(day.size, Image.Resampling.LANCZOS)
    # Identical crop for both modes avoids a lighting switch changing placement.
    union = ImageChops.lighter(day.getchannel('A'), night.getchannel('A'))
    box = union.point(lambda v: 255 if v >= 40 else 0).getbbox()
    for mode, image in [('light', day), ('dark', night)]:
        image = image.crop(box)
        if pose == 'seated':
            # Only soften the bottom of the stone face, below shoes and tail.
            alpha = image.getchannel('A')
            start = int(image.height * .975)
            ramp = Image.new('L', (1, image.height), 255)
            for y in range(start, image.height):
                ramp.putpixel((0, y), round(255 * (image.height - 1 - y) / max(1, image.height - 1 - start)))
            image.putalpha(ImageChops.multiply(alpha, ramp.resize(image.size)))
        if image.width > max_width:
            image = image.resize((max_width, round(image.height * max_width / image.width)), Image.Resampling.LANCZOS)
        destination = target / f'xiaohei-{pose}-v7-{mode}.webp'
        image.save(destination, lossless=True, method=6)
        print(destination.name, image.size, destination.stat().st_size)
