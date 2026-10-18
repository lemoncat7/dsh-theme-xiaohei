"""Build a compact, original-art rig atlas. Run explicitly; not part of npm build.

Input blink images come from the authorized DSH image plugin. Only small eyelid
patches are retained; original face, hair, ears and colors are preserved.
Atlas rows: exposed-background repair, head silhouette, closed eyes,
smooth eye deformation mask. Geometry is calibrated in the reference crop.
"""
import argparse
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT=Path(__file__).resolve().parents[1]
CROP=(1150,160,1580,510)
SIZE=(430,350)
HEAD=[(140,36),(105,160),(110,260),(125,280),(105,310),(80,380),(80,430),(100,450),(135,427),(126,470),(138,500),(113,514),(121,536),(148,558),(151,590),(171,575),(181,617),(204,638),(224,643),(240,632),(265,655),(320,696),(390,720),(460,728),(510,713),(520,735),(535,761),(555,737),(594,765),(645,760),(637,729),(678,721),(714,731),(737,710),(744,678),(781,678),(817,654),(826,641),(789,610),(798,591),(858,578),(870,549),(847,535),(903,485),(953,407),(975,361),(967,346),(885,315),(806,292),(749,285),(808,287),(785,247),(764,229),(779,202),(773,166),(749,137),(758,180),(733,192),(691,165),(647,161),(666,126),(668,85),(650,60),(613,40),(578,41),(609,75),(617,121),(610,146),(590,119),(560,96),(508,78),(460,82),(420,92),(386,84),(348,86),(341,93),(296,77),(231,54),(167,36)]
EYES=[[(252,481),(267,470),(287,475),(316,497),(332,531),(337,565),(330,588),(311,602),(288,606),(270,597),(258,578),(250,551)],[(469,566),(488,546),(523,548),(552,555),(578,570),(594,581),(589,613),(577,638),(557,650),(521,658),(489,653),(468,638),(465,602)]]

def polygon(points,blur=.45):
    mask=Image.new('L',(1032,840))
    ImageDraw.Draw(mask).polygon(points,fill=255)
    return mask.resize(SIZE,Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(blur))

def repair_border(im,mask):
    """Extend neighboring background inward for the <= 7px exposed by motion.
    Never synthesize/repaint the visible scenery outside the head silhouette.
    """
    data=np.array(im).astype(np.float32)
    known=np.array(mask)<2
    for _ in range(24):
        padded=np.pad(data,((1,1),(1,1),(0,0)),mode='edge')
        valid=np.pad(known,1,mode='edge')
        sums=np.zeros_like(data);counts=np.zeros(known.shape,dtype=np.float32)
        for dx,dy in [(0,1),(2,1),(1,0),(1,2),(0,0),(0,2),(2,0),(2,2)]:
            v=valid[dy:dy+SIZE[1],dx:dx+SIZE[0]]
            sums+=padded[dy:dy+SIZE[1],dx:dx+SIZE[0]]*v[:,:,None];counts+=v
        fill=(~known)&(counts>0)
        data[fill]=sums[fill]/counts[fill,None];known|=fill
    # These pixels are never exposed by the bounded head motion. Do not ship
    # duplicate face/background pixels in the repair plate.
    data[(~known)|(np.array(mask)==0)]=0
    return Image.fromarray(np.uint8(np.clip(data,0,255)))

def build(mode,closed_path):
    im=Image.open(ROOT/'src/assets/rift'/('scene-detail.webp' if mode=='dark' else 'scene-light-detail.webp')).convert('RGB').crop(CROP)
    closed=Image.open(closed_path).convert('RGB').resize(SIZE,Image.Resampling.LANCZOS)
    head=polygon(HEAD).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(.55))
    aperture=Image.new('L',SIZE)
    for points in EYES:
        # Fade the displacement to zero before the eyelid. No extracted iris,
        # replacement eye white or moving alpha boundary remains.
        eye=polygon(points,.25).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(2))
        aperture=Image.fromarray(np.maximum(np.array(aperture),np.array(eye)))
    blink=im.copy()
    # Keep the generated patch inside the face, away from the hair/eyebrows.
    eyelids=Image.new('L',(1032,840));d=ImageDraw.Draw(eyelids)
    d.ellipse((238,460,352,625),fill=255);d.ellipse((450,530,614,677),fill=255)
    eyelids=eyelids.resize(SIZE,Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(2))
    blink.paste(closed,(0,0),eyelids)
    rows=[repair_border(im,head).convert('RGBA'),Image.new('RGBA',SIZE),blink.convert('RGBA'),Image.new('RGBA',SIZE)]
    # Head RGB is sampled directly from the scene in the shader: no second
    # lossy compression/color mismatch at the face or hair boundary.
    rows[1].putalpha(head);rows[2].putalpha(eyelids);rows[3].putalpha(aperture)
    atlas=Image.new('RGBA',(SIZE[0],SIZE[1]*len(rows)))
    for i,row in enumerate(rows):atlas.paste(row,(0,SIZE[1]*i))
    path=ROOT/'src/assets/rift'/('character-'+mode+'.webp')
    atlas.save(path,'WEBP',quality=86,method=6)
    preview=Image.new('RGB',(SIZE[0]*3,SIZE[1]))
    for i,row in enumerate([im,blink,aperture.convert('RGB')]):preview.paste(row,(i*SIZE[0],0))
    preview.save('/tmp/rift8-head-'+mode+'.png')
    print(mode,path.stat().st_size)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--dark',required=True);parser.add_argument('--light',required=True)
    args=parser.parse_args();build('dark',args.dark);build('light',args.light)
