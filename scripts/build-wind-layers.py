"""Build separate alpha layers backed by DSH-generated hidden surfaces.

The visible artwork remains original. AI output supplies only newly exposed
pixels, never the face/hands. Full per-layer PNGs and a review board are saved
with the generation requests; the runtime packs repair RGB + coverage alpha.
"""
from pathlib import Path
import json
import importlib.util
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/wind-layers-v1'
DIM=(1672,940)
CELL=(320,256)
CROPS={'body':(1024,400,1624,800),'hair':(1080,125,1650,505)}
PARTS=[
 dict(name='curl',plate='hair',origin=(1320,155),pivot=(1409,237),angle=.12,lag=.0,points=[(1384,174),(1404,173),(1422,182),(1434,195),(1437,210),(1432,226),(1422,239),(1403,249),(1392,237),(1395,220),(1397,202),(1393,188)]),
 dict(name='left-locks',plate='hair',origin=(1140,270),pivot=(1233,308),angle=.07,lag=.16,points=[(1170,286),(1239,286),(1242,310),(1235,333),(1228,360),(1228,389),(1234,414),(1244,438),(1215,446),(1170,425)]),
 dict(name='right-locks',plate='hair',origin=(1320,300),pivot=(1451,399),angle=-.085,lag=.28,points=[(1439,389),(1520,389),(1520,470),(1470,490),(1354,490),(1354,465),(1380,458),(1406,452),(1422,442),(1432,421)]),
 dict(name='arm-sleeve',plate='body',origin=(1030,400),pivot=(1284,475),angle=.022,lag=.65,points=[(1073,479),(1077,475),(1093,469),(1110,460),(1103,455),(1091,455),(1084,454),(1080,451),(1078,446),(1079,442),(1083,440),(1097,441),(1112,440),(1120,440),(1139,449),(1137,441),(1132,433),(1133,429),(1136,428),(1141,432),(1155,444),(1165,460),(1174,470),(1180,461),(1191,456),(1210,453),(1226,449),(1241,444),(1255,439),(1271,440),(1286,446),(1300,458),(1310,480),(1307,516),(1293,548),(1274,576),(1254,593),(1236,602),(1220,602),(1208,598),(1195,589),(1184,575),(1176,561),(1171,548),(1168,531),(1167,524),(1151,515),(1141,511),(1128,506),(1115,505),(1107,500),(1095,516),(1090,521),(1084,523),(1079,522),(1079,518),(1085,511),(1092,502),(1095,493),(1083,502),(1075,507),(1070,507),(1069,504),(1071,501),(1084,491),(1092,485),(1098,478),(1087,482),(1079,485),(1074,484)]),
 dict(name='hem',plate='body',origin=(1110,605),pivot=(1290,660),angle=.105,lag=.4,points=[(1158,749),(1153,738),(1150,724),(1149,714),(1152,708),(1160,704),(1175,700),(1192,694),(1208,684),(1228,672),(1254,662),(1280,653),(1300,649),(1318,652),(1290,662),(1264,677),(1242,695),(1219,714),(1197,732),(1177,746)]),
]

def smooth(a,b,value):
    t=np.clip((value-a)/(b-a),0,1)
    return t*t*(3-2*t)

def mask_for(part,head,skin_reference):
    x,y=part['origin'];w,h=CELL
    points=part['points']
    if part['name']=='arm-sleeve':
        # Follow the actual ring/little fingertips, not a simplified fan.
        cut=points.index((1167,524))
        points=points[:cut+1]+[(1153,516),(1140,507),(1130,509),(1117,504),(1111,510),(1107,516),(1101,521),(1095,523),(1091,522),(1090,518),(1093,514),(1098,509),(1103,502),(1109,496),(1109,493),(1104,495),(1095,498),(1088,504),(1081,508),(1075,509),(1072,507),(1073,503),(1087,496),(1094,490),(1104,483),(1111,478),(1104,480),(1093,485),(1081,487),(1073,486),(1071,483)]
    mask=Image.new('L',(w*4,h*4))
    ImageDraw.Draw(mask).polygon([((px-x)*4,(py-y)*4) for px,py in points],fill=255)
    mask=mask.resize(CELL,Image.Resampling.LANCZOS)
    if part['plate']=='hair':
        silhouette=head.crop((x,y,x+w,y+h))
        mask=Image.fromarray(np.minimum(np.array(mask),np.array(silhouette)))
    mask=mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.4))
    yy,xx=np.mgrid[y:y+h,x:x+w]
    name=part['name']
    if name=='arm-sleeve':
        # Preserve the exact five-digit silhouette. The night reference has
        # strong warm-skin/cool-sky separation at the small finger contours;
        # using it avoids polygon approximations clipping a fingertip.
        rgb=np.array(skin_reference.crop((x,y,x+w,y+h))).astype(float)
        skin=np.minimum((rgb[:,:,0]-rgb[:,:,2]-2)/8,(rgb[:,:,0]-rgb[:,:,1]-1)/4)
        skin=Image.fromarray(np.uint8(np.clip(skin,0,1)*255)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.3))
        a=np.array(mask);select=(xx<1173)&(xx>1065)&(yy>425)&(yy<531)
        a[select]=np.array(skin)[select];mask=Image.fromarray(a)
    # Keep opaque roots. Joint weights live in the shader: fading a rotating
    # root's alpha is not a pin and was cutting the locks away from the scalp.
    # Include the entire ink/antialiased fringe, not just warm skin pixels.
    return mask.filter(ImageFilter.MaxFilter(3))

def build(mode):
    scene=Image.open(ROOT/'src/assets/rift'/('scene-light-detail.webp' if mode=='light' else 'scene-detail.webp')).convert('RGB')
    skin_reference=Image.open(ROOT/'src/assets/rift/scene-detail.webp').convert('RGB')
    spec=importlib.util.spec_from_file_location('head_rig',ROOT/'scripts/prepare-character-rig.py')
    rig=importlib.util.module_from_spec(spec);spec.loader.exec_module(rig)
    head=Image.new('L',DIM);head.paste(rig.polygon(rig.HEAD).filter(ImageFilter.MaxFilter(3)),(1150,160))
    plates={}
    provenance=[]
    for name,box in CROPS.items():
        job=OUT/f'{mode}-{name}'
        result=json.loads((job/'result.json').read_text())
        filename=Path(result['files'][0]['path']).name
        path=job/'generated'/filename
        img=Image.open(path).convert('RGB').resize((box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS)
        plate=scene.copy();plate.paste(img,box[:2]);plates[name]=plate
        provenance.append({'part':name,'model':result['model'],'request':str((job/'request.json').relative_to(ROOT)),'output':str(path.relative_to(ROOT))})
    atlas=Image.new('RGBA',(CELL[0]*2,CELL[1]*len(PARTS)))
    clean=scene.copy();board=Image.new('RGB',(CELL[0]*3,CELL[1]*len(PARTS)),(68,77,81))
    dest=OUT/f'{mode}-layers';dest.mkdir(exist_ok=True)
    for index,part in enumerate(PARTS):
        x,y=part['origin'];box=(x,y,x+CELL[0],y+CELL[1]);mask=mask_for(part,head,skin_reference)
        source=scene.crop(box);plate=plates[part['plate']].crop(box)
        rgba=source.convert('RGBA');rgba.putalpha(mask);rgba.save(dest/f'{part["name"]}.png')
        # RGB holds the generated hidden surface, alpha the original layer.
        # Independent, opaque old-silhouette cleanup. A feathered foreground
        # alpha must not be reused to erase antialiased ink at its old position.
        erase=mask.point(lambda a:255 if a>3 else 0).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(.35))
        # Repair RGB must remain valid throughout cleanup, including OUTSIDE
        # the foreground alpha. WebP discards RGB under fully transparent pixels.
        packed=plate.convert('RGBA');packed.putalpha(erase)
        atlas.paste(packed,(0,index*CELL[1]))
        foreground=Image.new('RGBA',CELL,(0,0,0,0));foreground.putalpha(mask)
        atlas.paste(foreground,(CELL[0],index*CELL[1]))
        clean.paste(plate,(x,y),erase)
        board.paste(source,(0,index*CELL[1]));board.paste(rgba,(CELL[0],index*CELL[1]),mask);board.paste(plate,(2*CELL[0],index*CELL[1]))
    clean.save(dest/'clean-base.png');scene.save(dest/'original.png');board.save(dest/'layers-review.png')
    atlas_path=ROOT/'src/assets/rift'/f'wind-layers-{mode}.webp'
    # Visible RGB still comes from the untouched wallpaper. Only the newly
    # exposed hidden surface is compressed; alpha coverage stays lossless.
    atlas.save(atlas_path,'WEBP',quality=68,method=6)
    (dest/'manifest.json').write_text(json.dumps({'canvas':DIM,'cell':CELL,'parts':PARTS,'provenance':provenance},indent=2))
    print(mode,atlas_path.stat().st_size)

def reference_grid():
    source=Image.open(ROOT/'src/assets/rift/scene-light-detail.webp').convert('RGB')
    for name,box in {**CROPS,'hand':(1060,420,1180,540)}.items():
        if name=='hand':
            crop=source.crop(box).resize((720,720))
            d=ImageDraw.Draw(crop)
            for x in range(1060,1180,5):
                xx=(x-1060)*6;d.line((xx,0,xx,720),fill=(130,90,85));d.text((xx,0),str(x),fill=(255,50,50))
            for y in range(420,540,5):
                yy=(y-420)*6;d.line((0,yy,720,yy),fill=(130,90,85));d.text((0,yy),str(y),fill=(255,50,50))
            crop.save(OUT/'hand-grid.png');continue
        crop=source.crop(box).resize(((box[2]-box[0])*2,(box[3]-box[1])*2))
        d=ImageDraw.Draw(crop)
        for x in range((box[0]//20+1)*20,box[2],20):
            xx=(x-box[0])*2;d.line((xx,0,xx,crop.height),fill=(180,110,100),width=1);d.text((xx,0),str(x),fill=(255,40,40))
        for y in range((box[1]//20+1)*20,box[3],20):
            yy=(y-box[1])*2;d.line((0,yy,crop.width,yy),fill=(180,110,100),width=1);d.text((0,yy),str(y),fill=(255,40,40))
        crop.save(OUT/f'{name}-grid.png')

if __name__=='__main__':
    import sys
    if '--grid' in sys.argv:reference_grid()
    else:
        for mode in ['light','dark']:build(mode)
        geometry=[{k:part[k] for k in ['name','origin','pivot','angle','lag']} for part in PARTS]
        (ROOT/'src/rift/wind-layer-geometry.ts').write_text('// Generated by build-wind-layers.py. Original artwork coordinates.\nexport const WIND_PARTS='+json.dumps(geometry)+' as const\n')
