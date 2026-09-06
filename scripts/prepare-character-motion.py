"""Extract single rig layers from approved art. No animated images/frame atlases.
uv run --with pillow python scripts/prepare-character-motion.py
Layers are committed; builds need neither Python nor an image service.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFilter, ImageChops

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'src/assets/background'
TARGET = ROOT / 'src/assets/character-motion'
POSES = {
    'peek': ('v7', [(73,192,128,252),(164,231,221,289)]),
    'seated': ('v7', [(274,193,332,257),(365,193,424,256)]),
    'chin': ('v8', [(241,228,299,285),(332,204,390,263)]),
    'halfpeek': ('v8', [(81,352,174,443)]),
}
EARS = {
 'peek': [((35,10,146,117),(84,91)), ((282,109,360,222),(300,177))],
 'seated': [((219,58,283,155),(244,121)), ((426,62,534,174),(476,140))],
 'chin': [((151,106,216,198),(185,169)), ((368,32,474,152),(418,125))],
 'halfpeek': [((220,144,360,313),(278,263))],
}

def save(image, name):
    image.resize((round(image.width/2),round(image.height/2)),Image.Resampling.LANCZOS).save(TARGET/name,lossless=True,method=6,exact=True)

def extract_ear(image, box):
    crop=image.crop(box)
    mask=Image.new('L',crop.size)
    for y in range(crop.height):
        for x in range(crop.width):
            r,g,b,a=crop.getpixel((x,y))
            green=g>r*1.025 and g>b*1.12
            dark=max(r,g,b)<100
            if a and (green or dark): mask.putpixel((x,y),255)
    # Exclude detached ink/speckles belonging to the foreground hair.
    remaining=set((x,y) for y in range(crop.height) for x in range(crop.width) if mask.getpixel((x,y)))
    biggest=set()
    while remaining:
        seed=remaining.pop();stack=[seed];component={seed}
        while stack:
            x,y=stack.pop()
            for p in ((x-1,y),(x+1,y),(x,y-1),(x,y+1)):
                if p in remaining: remaining.remove(p);component.add(p);stack.append(p)
        if len(component)>len(biggest): biggest=component
    mask=Image.new('L',crop.size)
    for p in biggest: mask.putpixel(p,255)
    mask=mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.35))
    layer=crop.copy();layer.putalpha(ImageChops.multiply(crop.getchannel('A'),mask))
    body=crop.copy();body.putalpha(ImageChops.multiply(crop.getchannel('A'),ImageChops.invert(mask)))
    image.paste(body,box)
    return layer

def extract_tail(image):
    box=(550,650,700,953)
    patch=image.crop(box)
    points=[(563,653),(583,653),(609,670),(635,698),(654,722),(666,751),(667,777),(657,810),(644,841),(634,871),(638,895),(652,914),(656,927),(647,936),(630,939),(614,934),(603,918),(596,896),(592,875),(594,850),(602,824),(612,793),(621,767),(620,746),(612,723),(598,702),(580,683)]
    allowed=Image.new('L',image.size);ImageDraw.Draw(allowed).polygon(points,fill=255)
    allowed=allowed.crop(box).filter(ImageFilter.MaxFilter(39))
    stone=image.crop((430,650,580,953));mask=Image.new('L',patch.size)
    for y in range(patch.height):
        for x in range(patch.width):
            if not allowed.getpixel((x,y)): continue
            r,g,b,_=patch.getpixel((x,y));sr,sg,sb,_=stone.getpixel((x,y))
            ratio=(r+g+b)/max(1,sr+sg+sb)
            coverage=1 if g>b*1.08 and g>r*1.03 else max(0,min(1,(.91-ratio)/.1))
            mask.putpixel((x,y),round(255*coverage))
    mask=mask.filter(ImageFilter.GaussianBlur(.45))
    layer=patch.copy();layer.putalpha(mask)
    image.paste(Image.composite(stone,patch,mask.filter(ImageFilter.MaxFilter(5))),box)
    return box,layer

def blink(image, mode, eyes):
    closed=Image.open(ART/f'xiaohei-doze-v8-{mode}.webp').convert('RGBA')
    result=image.copy()
    for i,box in enumerate(eyes):
        patch=closed.crop((280,230,342,284) if i==0 else (372,216,435,270))
        target=image.crop(box);patch=patch.resize(target.size,Image.Resampling.LANCZOS)
        ref=target.getpixel((target.width//2,target.height-2));sample=patch.getpixel((patch.width//2,patch.height-2))
        channels=patch.split()
        patch=Image.merge('RGBA',tuple(channels[c].point(lambda v,c=c:max(0,min(255,v+ref[c]-sample[c]))) for c in range(3))+(channels[3],))
        mask=Image.new('L',target.size);ImageDraw.Draw(mask).ellipse((2,1,target.width-2,target.height-1),fill=255)
        result.paste(Image.composite(patch,target,mask.filter(ImageFilter.GaussianBlur(1.4))),box)
    return result

def half_box(box):
    x,y,r,b=box
    return [x/2,y/2,x/2+round((r-x)/2),y/2+round((b-y)/2)]

def build():
    TARGET.mkdir(exist_ok=True);catalog={}
    for pose,(version,eyes) in POSES.items():
        catalog[pose]={}
        for mode in ('light','dark'):
            original=Image.open(ART/f'xiaohei-{pose}-{version}-{mode}.webp').convert('RGBA');body=original.copy()
            layers={};ears=[]
            for i,(box,pivot) in enumerate(EARS[pose]):
                key=f'ear{i}';name=f'{pose}-{mode}-{key}.webp'
                save(extract_ear(body,box),name)
                layers[key]={'file':name,'box':half_box(box)};ears.append([n/2 for n in pivot])
            if pose in ('seated','chin'):
                box,tail=extract_tail(body);name=f'{pose}-{mode}-tail.webp';save(tail,name)
                layers['tail']={'file':name,'box':half_box(box)}
            eye_box=(min(b[0] for b in eyes)-2,min(b[1] for b in eyes)-2,max(b[2] for b in eyes)+2,max(b[3] for b in eyes)+2)
            name=f'{pose}-{mode}-blink.webp';save(blink(original,mode,eyes).crop(eye_box),name)
            layers['blink']={'file':name,'box':half_box(eye_box)}
            name=f'{pose}-{mode}-body.webp';save(body,name)
            layers['body']={'file':name,'box':[0,0,round(body.width/2),round(body.height/2)]}
            catalog[pose][mode]={'layers':layers,'ears':ears,'size':[round(n/2) for n in body.size]}
    (TARGET/'catalog.json').write_text(json.dumps(catalog,indent=2)+'\n')
    print('Single-layer rig assets:',sum(p.stat().st_size for p in TARGET.glob('*.webp')),'bytes')

if __name__=='__main__': build()
