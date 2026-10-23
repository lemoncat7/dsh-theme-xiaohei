"""Deterministic original-art cutouts, not generated/redrawn fabric.

Two 256x160 atlas cells store repaired background RGB + cutout coverage alpha.
Visible cloth RGB is ALWAYS sampled from the original scene by the shader.
Run explicitly after reviewing the traced contours; never in the normal build.
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
SIZE=(256,160)
PARTS=[
    ('cuff',(1120,480),[
        (1167,521),(1169,540),(1173,554),(1180,569),(1188,580),
        (1200,591),(1213,598),(1227,601),(1242,599),(1258,594),
        (1273,586),(1285,575),(1296,559),(1304,541),(1308,522),
        (1288,514),(1266,521),(1245,533),(1224,537),(1207,537),(1187,532),
    ]),
    ('hem',(1110,620),[
        (1158,749),(1153,738),(1150,724),(1149,714),(1152,708),
        (1160,704),(1175,700),(1192,694),(1208,684),(1228,672),
        (1254,662),(1280,653),(1300,649),(1318,652),
        (1290,662),(1264,677),(1242,695),(1219,714),(1197,732),(1177,746),
    ]),
]

def coverage(origin,points):
    mask=Image.new('L',(SIZE[0]*4,SIZE[1]*4))
    ImageDraw.Draw(mask).polygon([((x-origin[0])*4,(y-origin[1])*4) for x,y in points],fill=255)
    # Include the complete ink/antialias fringe in the cutout, not just the
    # flat fill. Otherwise the old outline remains behind when it rotates.
    return mask.resize(SIZE,Image.Resampling.LANCZOS).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(.35))

def repair(im,mask):
    data=np.array(im).astype(np.float32)
    # Exclude antialiasing/ink pixels at the old silhouette before extending
    # the surroundings into the small area exposed by a bounded rotation.
    known=np.array(mask.filter(ImageFilter.MaxFilter(9)))<1
    for _ in range(48):
        padded=np.pad(data,((1,1),(1,1),(0,0)),mode='edge')
        valid=np.pad(known,1,mode='edge')
        sums=np.zeros_like(data);counts=np.zeros(known.shape,dtype=np.float32)
        for dx,dy in [(0,1),(2,1),(1,0),(1,2),(0,0),(0,2),(2,0),(2,2)]:
            v=valid[dy:dy+SIZE[1],dx:dx+SIZE[0]]
            sums+=padded[dy:dy+SIZE[1],dx:dx+SIZE[0]]*v[:,:,None];counts+=v
        fill=(~known)&(counts>0)
        data[fill]=sums[fill]/counts[fill,None];known|=fill
    data[(np.array(mask)==0)]=0
    out=Image.fromarray(np.uint8(np.clip(data,0,255))).convert('RGBA')
    out.putalpha(mask)
    return out

def build(mode):
    source=Image.open(ROOT/'src/assets/rift'/('scene-detail.webp' if mode=='dark' else 'scene-light-detail.webp')).convert('RGB')
    atlas=Image.new('RGBA',(256,320))
    preview=Image.new('RGB',(768,320),(65,74,80))
    for i,(name,origin,points) in enumerate(PARTS):
        x,y=origin
        crop=source.crop((x,y,x+256,y+160));mask=coverage(origin,points)
        plate=repair(crop,mask)
        if name=='hem':
            # The lifted flap exposes trousers below/right, not sky sampled
            # from above its outer edge. Continue that existing fabric only.
            trousers=source.crop((x+28,y+24,x+284,y+184)).convert('RGBA')
            trousers.putalpha(mask);plate=trousers
        atlas.paste(plate,(0,i*160))
        preview.paste(crop,(0,i*160))
        preview.paste(crop,(256,i*160),mask)
        preview.paste(plate.convert('RGB'),(512,i*160))
    path=ROOT/'src/assets/rift'/f'cloth-{mode}.webp'
    atlas.save(path,'WEBP',lossless=True,method=6)
    preview.resize((1536,640)).save(f'/tmp/cloth-rig-{mode}.png')
    print(mode,path.stat().st_size)

if __name__=='__main__':
    for mode in ['light','dark']:build(mode)
