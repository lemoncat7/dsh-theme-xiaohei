import type {EyeRig} from './character-eye-rig.js'

/** Quadratic lid ordinate at a horizontal art-space coordinate. */
export function lidY(eye:EyeRig,control:readonly [number,number],x:number):number {
  let low=0,high=1
  for(let i=0;i<14;i++){
    const t=(low+high)/2,s=1-t
    if(s*s*eye.left[0]+2*s*t*control[0]+t*t*eye.right[0]<x)low=t
    else high=t
  }
  const t=(low+high)/2,s=1-t
  return s*s*eye.left[1]+2*s*t*control[1]+t*t*eye.right[1]
}

/** Cache original ink and a locally textured skin plate, never read pixels per frame. */
export function prepareEyeMaterial(doc:Document,source:CanvasRenderingContext2D,eye:EyeRig){
  const left=Math.floor(eye.left[0]-9),right=Math.ceil(eye.right[0]+9)
  const top=Math.floor(Math.min(eye.upper[1],eye.left[1],eye.right[1])-5)
  const bottom=Math.ceil(Math.max(eye.lower[1],eye.left[1],eye.right[1])+5)
  const width=right-left,height=bottom-top
  const canvas=()=>{const c=doc.createElement('canvas');c.width=width;c.height=height;return c}
  const ink=canvas(),skin=canvas(),mask=canvas()
  const ic=ink.getContext('2d')!,sc=skin.getContext('2d')!,mc=mask.getContext('2d')!
  const pixels=source.getImageData(0,0,source.canvas.width,source.canvas.height)
  const pixel=(x:number,y:number):[number,number,number]=>{
    const offset=(Math.max(0,Math.min(pixels.height-1,Math.round(y/2)))*pixels.width+Math.max(0,Math.min(pixels.width-1,Math.round(x/2))))*4
    return [pixels.data[offset]!,pixels.data[offset+1]!,pixels.data[offset+2]!]
  }
  const ref=pixel(...eye.skin),output=ic.createImageData(width,height),plate=sc.createImageData(width,height)
  const isSkin=(c:readonly number[])=>c.every((v,i)=>Math.abs(v-ref[i]!)<25)
  const skinAt=(x:number,y:number,c:[number,number,number])=>{
    if(isSkin(c))return c
    const sum=[ref[0]*.05,ref[1]*.05,ref[2]*.05];let weight=.05
    // Inpaint from nearby matching face pixels, preserving local lighting.
    // Source hair, green iris and dark ink cannot bleed into the skin plate.
    for(const radius of [6,12,20,30])for(let i=0;i<8;i++){
      const p=pixel(x+Math.cos(i*Math.PI/4)*radius,y+Math.sin(i*Math.PI/4)*radius)
      if(!isSkin(p))continue
      const w=1/radius;weight+=w
      for(let k=0;k<3;k++)sum[k]!+=p[k]!*w
    }
    return sum.map(v=>Math.round(v/weight))
  }
  for(let x=0;x<width;x++){
    const ax=left+x,upper=lidY(eye,eye.upper,ax)
    // Restrict extraction to the upper lash: exclude eyebrow, pupil and hair.
    for(let y=0;y<height;y++){
      const ay=top+y,c=pixel(ax,ay),index=(y*width+x)*4
      const darkness=1-(c[0]+c[1]+c[2])/Math.max(1,ref[0]!+ref[1]!+ref[2]!)
      const green=c[1]!>c[0]!*1.15 && c[1]!>c[2]!*1.12
      const inBand=ay>=upper-12 && ay<=upper+3
      const alpha=inBand && !green ? Math.max(0,Math.min(1,(darkness-.3)/.35)) : 0
      output.data.set([...c,Math.round(alpha*255)],index)
      plate.data.set([...skinAt(ax,ay,c),255],index)
    }
  }
  ic.putImageData(output,0,0);sc.putImageData(plate,0,0)
  // Opaque coverage of extracted ink, including its antialiased fringe. Using
  // the ink's original alpha here leaves a second, stationary lash behind.
  const inkMask=mc.createImageData(width,height)
  for(let i=0;i<output.data.length;i+=4)inkMask.data[i+3]=output.data[i+3]!>4?255:0
  mc.putImageData(inkMask,0,0)
  const expanded=canvas(),ec=expanded.getContext('2d')!
  for(const [dx,dy] of [[0,0],[-1,0],[1,0],[0,-1],[0,1]])ec.drawImage(mask,dx!,dy!)
  mc.drawImage(expanded,0,0)
  mc.translate(-left,-top);mc.beginPath();mc.moveTo(eye.left[0]-7,eye.left[1])
  mc.quadraticCurveTo(eye.upper[0],eye.upper[1]-4,eye.right[0]+7,eye.right[1]);mc.quadraticCurveTo(eye.lower[0],eye.lower[1]+20,eye.left[0]-7,eye.left[1])
  mc.closePath();mc.fill()
  // Feather only a subpixel edge, not the eye or the whole character.
  sc.globalCompositeOperation='destination-in';sc.filter='blur(0.65px)';sc.drawImage(mask,0,0);sc.filter='none'
  return {ink,skin,left,top,width,height}
}
