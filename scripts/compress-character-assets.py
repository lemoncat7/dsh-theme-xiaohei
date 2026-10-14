"""Generate reviewed lossy runtime derivatives; never overwrite source artwork.
Requires Pillow only when regenerating assets, not during npm builds.
"""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

root = Path(__file__).resolve().parent.parent / 'src' / 'assets'
catalog = json.loads((root / 'character-motion/catalog.json').read_text())
poses = {'seated': 'v7', 'peek': 'v7', 'chin': 'v8', 'doze': 'v8', 'halfpeek': 'v8'}
files = [f'background/xiaohei-{pose}-{version}-{mode}.webp'
         for pose, version in poses.items() for mode in ('light', 'dark')]
files += sorted({f'character-motion/{layer["file"]}' for modes in catalog.values()
                 for rig in modes.values() for layer in rig['layers'].values()})
records = {}
for name in files:
    source = root / name
    target = root / 'runtime' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    original = Image.open(source).convert('RGBA')
    original.save(target, 'WEBP', lossless=False, quality=82, method=6, exact=True)
    encoded = Image.open(target).convert('RGBA')
    assert encoded.size == original.size
    assert ImageChops.difference(original.getchannel('A'), encoded.getchannel('A')).getbbox() is None, name
    records[name] = {'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                     'runtimeSha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                     'before': source.stat().st_size, 'after': target.stat().st_size,
                     'width': original.width, 'height': original.height}
(root / 'runtime/manifest.json').write_text(json.dumps({'quality': 82, 'assets': records}, indent=2) + '\n')
print(json.dumps({'files': len(records), 'before': sum(r['before'] for r in records.values()),
                  'after': sum(r['after'] for r in records.values())}))
# Human review: original/compressed pairs at displayed size on both palettes.
sheet = Image.new('RGB', (1040, 800), '#d4d5d5')
draw = ImageDraw.Draw(sheet)
for row, mode in enumerate(('light', 'dark')):
    y = row * 400
    draw.rectangle((0, y, 1040, y + 400), fill='#d4d5d5' if mode == 'light' else '#151c26')
    for col, (pose, kind) in enumerate((('seated', 'original'), ('seated', 'compressed'), ('chin', 'original'), ('chin', 'compressed'))):
        name = f'background/xiaohei-{pose}-{poses[pose]}-{mode}.webp'
        art = Image.open(root / ('runtime/' if kind == 'compressed' else '') / name).convert('RGBA')
        art.thumbnail((240, 350), Image.Resampling.LANCZOS)
        sheet.paste(art, (col * 260 + 10, y + 35), art)
        draw.text((col * 260 + 10, y + 10), f'{pose} {kind} Q82', fill='black' if mode == 'light' else 'white')
sheet.save('/tmp/xiaohei-compression-review.png')
