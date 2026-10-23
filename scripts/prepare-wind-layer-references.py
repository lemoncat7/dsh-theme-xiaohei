"""Reference crops only. AI underpainting uses the authorized DSH image tool."""
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/wind-layers-v1'
CROPS={'body':(1024,400,1624,800),'hair':(1080,125,1650,505)}
for mode in ['light','dark']:
    name='scene-light-detail.webp' if mode=='light' else 'scene-detail.webp'
    scene=Image.open(ROOT/'src/assets/rift'/name).convert('RGB')
    for part,box in CROPS.items():
        dest=OUT/f'{mode}-{part}'
        dest.mkdir(parents=True,exist_ok=True)
        scene.crop(box).resize((1536,1024),Image.Resampling.LANCZOS).save(dest/'reference.png')
        print(mode,part,box)
