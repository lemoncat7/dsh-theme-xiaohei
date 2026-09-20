"""Enlarged source-art references; no production asset mutation."""
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
poses = [('seated', 'v7', (265,185,435,270)), ('peek','v7',(65,180,230,300)),
         ('chin','v8',(230,195,405,300)), ('halfpeek','v8',(70,330,185,455)),
         ('doze','v8',(260,200,450,295))]
sheet = Image.new('RGB',(1000, len(poses)*320),'#adb6be')
draw = ImageDraw.Draw(sheet)
for row,(pose,version,box) in enumerate(poses):
    for column,mode in enumerate(['light','dark']):
        image=Image.open(root/f'src/assets/background/xiaohei-{pose}-{version}-{mode}.webp').convert('RGBA')
        crop=image.crop(box)
        crop.thumbnail((460,270))
        scale=min(460/crop.width,270/crop.height)
        crop=crop.resize((round(crop.width*scale),round(crop.height*scale)))
        sheet.paste(crop,(column*500,row*320+30),crop)
        draw.text((column*500+10,row*320+5),f'{pose} {mode} {box}',fill='black')
sheet.save('/tmp/xiaohei-eye-art.png')
