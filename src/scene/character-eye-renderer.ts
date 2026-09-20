import {clampGaze,eyelidControls,type EyeRig} from './character-eye-rig.js'
import type {Point} from './character-motion-types.js'
import {lidY,prepareEyeMaterial} from './character-eye-material.js'

/** Prepare tiny iris surfaces once. Never shift a rectangular face/eye patch. */
export function createEyeRenderer(ctx:CanvasRenderingContext2D, body:HTMLImageElement, eyes:readonly EyeRig[]) {
  const doc=ctx.canvas.ownerDocument
  const source=doc.createElement('canvas');source.width=body.width;source.height=body.height
  const sample=source.getContext('2d',{willReadFrequently:true})!
  sample.drawImage(body,0,0)
  const color=(p:Point)=>{
    const data=sample.getImageData(Math.round(p[0]/2),Math.round(p[1]/2),1,1).data
    return [data[0]!,data[1]!,data[2]!]
  }
  const rgb=(c:readonly number[])=>`rgb(${c.map(v=>Math.round(v)).join(' ')})`
  const prepared=eyes.map(eye=>{
    const [cx,cy,rx,ry,angle]=eye.iris
    // Full-size local surface preserves source texels when moved fractionally.
    const iris=doc.createElement('canvas');iris.width=Math.ceil(rx*2+4);iris.height=Math.ceil(ry*2+4)
    const ic=iris.getContext('2d')!
    ic.translate(iris.width/2,iris.height/2);ic.rotate(angle)
    ic.beginPath();ic.ellipse(0,0,rx,ry,0,0,Math.PI*2);ic.clip();ic.rotate(-angle)
    ic.drawImage(body,0,0,body.width,body.height,-cx,-cy,body.width*2,body.height*2)
    return {eye,iris,skin:color(eye.skin),material:prepareEyeMaterial(doc,sample,eye)}
  })
  function aperture(eye:EyeRig,closure:number) {
    const {upper,lower,left,right}=eyelidControls(eye,closure)
    ctx.beginPath();ctx.moveTo(...left)
    ctx.quadraticCurveTo(...upper,...right)
    ctx.quadraticCurveTo(...lower,...left);ctx.closePath()
  }
  return (gaze:Point,closure:number)=>{
    const [gx,gy]=clampGaze(...gaze)
    ctx.save();ctx.scale(.5,.5)
    for(const {eye,iris,skin,material} of prepared){
      const [cx,cy,rx,ry]=eye.iris
      ctx.save()
      ctx.drawImage(material.skin,material.left,material.top)
      ctx.save()
      aperture(eye,0);ctx.clip()
      if(closure<.999){
        ctx.save();aperture(eye,closure);ctx.clip()
        const shade=ctx.createLinearGradient(0,cy-ry,0,cy+ry)
        const brightness=(skin[0]!+skin[1]!+skin[2]!)/765
        const white=brightness>.65?[255,253,241]:[166,185,193]
        shade.addColorStop(0,rgb(white.map(c=>c*.83)));shade.addColorStop(.5,rgb(white))
        ctx.fillStyle=shade;ctx.fillRect(cx-70,cy-70,140,140)
        const dx=gx*rx*.26,dy=gy*ry*.13
        ctx.drawImage(iris,cx-iris.width/2+dx,cy-iris.height/2+dy)
        ctx.restore()
      }
      ctx.restore()
      const lids=eyelidControls(eye,closure)
      // Move narrow strips of the original brushwork, preserving lash thickness.
      // Neither a replacement stroke nor an opacity swap is used for blinking.
      for(let x=0;x<material.width;x++){
        const ax=material.left+x
        const dy=lidY({...eye,left:lids.left,right:lids.right},lids.upper,ax)-lidY(eye,eye.upper,ax)
        ctx.drawImage(material.ink,x,0,1,material.height,ax,material.top+dy,1,material.height)
      }
      ctx.restore()
    }
    ctx.restore()
  }
}
