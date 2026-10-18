"""Compress existing forest backgrounds; human poses use existing WebP art."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent / 'src/assets/character'
for appearance in ('light', 'dark'):
    with Image.open(root.parent / f'xiaohei-forest-city-{appearance}-v1.webp') as source:
        source.resize((1600, 900), Image.Resampling.LANCZOS).save(
            root.parent / 'background' / f'xiaohei-realm-{appearance}.webp',
            'WEBP', quality=78, method=6)
