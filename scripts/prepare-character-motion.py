"""Build bounded lossless motion patches from existing approved illustrations.

Closed eyelids come from the existing doze pose, ears use a root-anchored local
warp, and the tail bends over a plate sampled from adjacent stone. No API.
Run `build`, then `review` to inspect a local contact sheet.
"""
from pathlib import Path
import sys
import json
from math import sin, pi, cos
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'src/assets/background'
OUT = ROOT / 'output/imagegen/character-motion'
POSES = {
    'peek': ('v7', [(73,192,128,252),(164,231,221,289)]),
    'seated': ('v7', [(274,193,332,257),(365,193,424,256)]),
    'chin': ('v8', [(241,228,299,285),(332,204,390,263)]),
    'halfpeek': ('v8', [(81,352,174,443)]),
}
EARS = {
    'peek': [(26,5,149,109,83,99,22),(280,111,359,217,294,178,-26)],
    'seated': [(213,58,290,143,247,124,22),(427,65,535,179,475,145,-24)],
    'chin': [(150,100,220,189,192,168,22),(371,33,481,157,413,132,-24)],
    'halfpeek': [(221,143,359,309,277,254,-24)],
}

def source(pose, mode):
    return Image.open(ART / f'xiaohei-{pose}-{POSES[pose][0]}-{mode}.webp').convert('RGBA')

def local_ear(image, region, phase):
    left,top,right,bottom,px,py,angle = region
    patch=image.crop((left,top,right,bottom))
    # Smooth displacement vanishes at the roots and patch boundaries.
    mesh=[]
    def point(x,y):
        gx,gy=x+left,y+top
        edge=max(0,sin(pi*x/patch.width))*max(0,sin(pi*y/patch.height))
        weight=edge * max(0,min(1,(py-gy+12)/max(1,py-top)))
        a=angle*phase*weight*pi/180
        dx,dy=gx-px,gy-py
        return px+dx*cos(a)+dy*sin(a)-left,py-dx*sin(a)+dy*cos(a)-top
    for y in range(0,patch.height,3):
        for x in range(0,patch.width,3):
            r,b=min(x+3,patch.width),min(y+3,patch.height)
            mesh.append(((x,y,r,b),(*point(x,y),*point(x,b),*point(r,b),*point(r,y))))
    return patch.transform(patch.size,Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)

def blink(image,mode,eyes):
    closed=Image.open(ART / f'xiaohei-doze-v8-{mode}.webp').convert('RGBA')
    result=image.copy()
    for i,box in enumerate(eyes):
        patch=closed.crop((280,230,342,284) if i==0 else (372,216,435,270))
        target=image.crop(box)
        patch=patch.resize(target.size,Image.Resampling.LANCZOS)
        # Match the source pose's skin illumination without changing eyelid ink.
        ref=target.getpixel((target.width//2,target.height-2))
        sample=patch.getpixel((patch.width//2,patch.height-2))
        channels=patch.split()
        patch=Image.merge('RGBA',tuple(channels[c].point(lambda v,c=c: max(0,min(255,v+ref[c]-sample[c]))) for c in range(3))+(channels[3],))
        mask=Image.new('L',target.size,0)
        ImageDraw.Draw(mask).ellipse((2,1,target.width-2,target.height-1),fill=255)
        mask=mask.filter(ImageFilter.GaussianBlur(1.4))
        result.paste(Image.composite(patch,target,mask),box)
    return result

def tail_frames(image):
    box=(550,650,700,953)
    patch=image.crop(box)
    points=[(563,653),(583,653),(609,670),(635,698),(654,722),(666,751),(667,777),(657,810),(644,841),(634,871),(638,895),(652,914),(656,927),(647,936),(630,939),(614,934),(603,918),(596,896),(592,875),(594,850),(602,824),(612,793),(621,767),(620,746),(612,723),(598,702),(580,683)]
    mask=Image.new('L',image.size,0)
    ImageDraw.Draw(mask).polygon(points,fill=255)
    allowed=mask.crop(box).filter(ImageFilter.MaxFilter(39))
    # Reuse adjacent stone pixels as a clean plate; ledge/hand outside the tail
    # silhouette remain bit-identical. No whole-background warping.
    stone=image.crop((box[0]-120,box[1],box[2]-120,box[3]))
    mask=Image.new('L',patch.size,0)
    for y in range(patch.height):
        for x in range(patch.width):
            if not allowed.getpixel((x,y)): continue
            r,g,b,_=patch.getpixel((x,y));sr,sg,sb,_=stone.getpixel((x,y))
            ratio=(r+g+b)/max(1,sr+sg+sb)
            green=g>b*1.08 and g>r*1.03
            coverage=1 if green else max(0,min(1,(.91-ratio)/.1))
            mask.putpixel((x,y),round(255*coverage))
    mask=mask.filter(ImageFilter.GaussianBlur(.45))
    tail=patch.copy();tail.putalpha(mask)
    clean=Image.composite(stone,patch,mask.filter(ImageFilter.MaxFilter(5)))
    frames=[]
    for phase in [0,.35,.7,1,.7,.2,-.4,-.75,-.4,0]:
        if phase==0: frames.append(patch);continue
        mesh=[]
        def point(x,y):
            bend=max(0,(y-18)/(patch.height-18))**1.8
            return x-phase*16*bend,y
        for y in range(0,patch.height,4):
            for x in range(0,patch.width,4):
                r,b=min(x+4,patch.width),min(y+4,patch.height)
                mesh.append(((x,y,r,b),(*point(x,y),*point(x,b),*point(r,b),*point(r,y))))
        moved=tail.transform(tail.size,Image.Transform.MESH,mesh,Image.Resampling.BICUBIC)
        frame=clean.copy();frame.alpha_composite(moved);frames.append(frame)
    return box,frames

def build():
    target=ROOT/'src/assets/character-motion';target.mkdir(exist_ok=True)
    catalog={}
    for pose,(_,eyes) in POSES.items():
        catalog[pose]={}
        for mode in ('light','dark'):
            image=source(pose,mode)
            eye_box=(min(b[0] for b in eyes)-2,min(b[1] for b in eyes)-2,max(b[2] for b in eyes)+2,max(b[3] for b in eyes)+2)
            opened=image.crop(eye_box);shut=blink(image,mode,eyes).crop(eye_box)
            actions={'blink':(eye_box,[opened,Image.blend(opened,shut,.65),shut,shut,Image.blend(opened,shut,.45),opened],55)}
            for i,region in enumerate(EARS[pose]):
                frames=[local_ear(image,region,p) for p in (0,.5,1,.3,-.5,-.15,0)]
                frames[0]=image.crop(region[:4]);frames[-1]=frames[0]
                actions[f'ear{i}']=(region[:4],frames,80)
            if pose=='seated':
                box,frames=tail_frames(image);actions['tail']=(box,frames,100)
            catalog[pose][mode]={}
            for action,(box,frames,interval) in actions.items():
                # At most 250 CSS pixels on screen; half-resolution patches
                # already cover 1.4x DPR without decoding oversized atlases.
                width,height=round(frames[0].width/2),round(frames[0].height/2)
                frames=[f.resize((width,height),Image.Resampling.LANCZOS) for f in frames]
                strip=Image.new('RGBA',(frames[0].width*len(frames),frames[0].height))
                for n,frame in enumerate(frames):strip.paste(frame,(n*frame.width,0))
                name=f'{pose}-{mode}-{action}.webp'
                strip.save(target/name,lossless=True,method=6,exact=True)
                x,y=round(box[0]/2),round(box[1]/2)
                catalog[pose][mode][action]={'file':name,'box':(x,y,x+width,y+height),'size':tuple(round(n/2) for n in image.size),'frames':len(frames),'interval':interval}
    (target/'catalog.json').write_text(json.dumps(catalog,indent=2)+'\n')
    print('Motion patches:',sum(p.stat().st_size for p in target.glob('*.webp')),'bytes')

def review():
    OUT.mkdir(parents=True,exist_ok=True)
    catalog=json.loads((ROOT/'src/assets/character-motion/catalog.json').read_text())
    sheet=Image.new('RGB',(1200,800),'#bcc5cc')
    for col,pose in enumerate(POSES):
        image=source(pose,'light')
        size=tuple(round(n/2) for n in image.size)
        image=image.resize(size,Image.Resampling.LANCZOS)
        for row,action in enumerate(('blink','tail' if pose=='seated' else 'ear0')):
            p=catalog[pose]['light'][action];x,y,r,b=p['box'];w,h=r-x,b-y
            strip=Image.open(ROOT/'src/assets/character-motion'/p['file'])
            frame=image.copy();frame.paste(strip.crop((w*2,0,w*3,h)),(x,y))
            frame.thumbnail((300,400))
            sheet.paste(frame,(col*300,row*400),frame)
    sheet.save(OUT/'motion-review.png')

if __name__ == '__main__':
    if sys.argv[1] == 'build': build()
    elif sys.argv[1] == 'review': review()
