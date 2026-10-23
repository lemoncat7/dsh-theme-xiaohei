"""Save human-readable animation previews beside the generated layer assets."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/wind-layers-v1'
for mode in ['light','dark']:
    frames=[Image.open(OUT/'review'/f'{mode}-{frame}.png').convert('RGB') for frame in range(0,217,12)]
    frames[0].save(OUT/f'{mode}-motion.webp','WEBP',save_all=True,append_images=frames[1:],duration=500,loop=0,quality=88,method=6)
    print(OUT/f'{mode}-motion.webp')
