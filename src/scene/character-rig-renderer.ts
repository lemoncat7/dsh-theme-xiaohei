import type { CharacterRig, Point } from './character-motion-types.js'
import { bindVertex, rigAngles, skinVertex, solveBones, TAIL_JOINTS } from './character-rig.js'

/** Small CPU-skinned tail only; body and ears use normal image draws. */
export function createRigRenderer(ctx: CanvasRenderingContext2D, rig: CharacterRig, images: ReadonlyMap<string, HTMLImageElement | null>) {
  const tail = rig.layers.tail
  const vertices: ReturnType<typeof bindVertex>[] = [], triangles: number[][] = []
  if (tail) {
    const [x,y,r,b] = tail.box, cols = Math.ceil((r-x)/10), rows = Math.ceil((b-y)/10)
    for (let row=0;row<=rows;row++) for (let col=0;col<=cols;col++)
      vertices.push(bindVertex(x+(r-x)*col/cols,y+(b-y)*row/rows))
    for (let row=0;row<rows;row++) for (let col=0;col<cols;col++) {
      const i=row*(cols+1)+col
      triangles.push([i,i+1,i+cols+1],[i+1,i+cols+2,i+cols+1])
    }
  }
  function layer(name: string) {
    const layer = rig.layers[name], image = layer && images.get(layer.src)
    if (layer && image) {
      const [x,y,r,b]=layer.box
      ctx.drawImage(image,x,y,r-x,b-y)
    }
  }
  function drawTail(progress: number) {
    if (!tail) return
    const image = images.get(tail.src)
    if (!image) return
    if (progress <= 0 || progress >= 1) { layer('tail'); return }
    const joints=solveBones(TAIL_JOINTS,rigAngles(progress,TAIL_JOINTS.length,true))
    const posed=vertices.map(v=>skinVertex(v,joints))
    const [left,top]=tail.box
    for (const indices of triangles) {
      const [ia,ib,ic]=indices as [number,number,number]
      const a=vertices[ia]!,b=vertices[ib]!,c=vertices[ic]!
      const p=posed[ia]!,q=posed[ib]!,r=posed[ic]!
      const ux=b.x-a.x,uy=b.y-a.y,vx=c.x-a.x,vy=c.y-a.y,det=ux*vy-uy*vx
      const aa=((q[0]-p[0])*vy-(r[0]-p[0])*uy)/det
      const bb=((q[1]-p[1])*vy-(r[1]-p[1])*uy)/det
      const cc=((r[0]-p[0])*ux-(q[0]-p[0])*vx)/det
      const dd=((r[1]-p[1])*ux-(q[1]-p[1])*vx)/det
      ctx.save();ctx.beginPath()
      // Slightly overlap the interior triangles to avoid antialias hairlines.
      const cx=(p[0]+q[0]+r[0])/3,cy=(p[1]+q[1]+r[1])/3
      ;[p,q,r].forEach((v: Point,i) => {
        const dx=v[0]-cx,dy=v[1]-cy,scale=1+1.2/Math.max(1,Math.hypot(dx,dy))
        if (i) ctx.lineTo(cx+dx*scale,cy+dy*scale)
        else ctx.moveTo(cx+dx*scale,cy+dy*scale)
      })
      ctx.closePath();ctx.clip()
      ctx.transform(aa,bb,cc,dd,p[0]-aa*(a.x-left)-cc*(a.y-top),p[1]-bb*(a.x-left)-dd*(a.y-top))
      ctx.drawImage(image,0,0)
      ctx.restore()
    }
  }
  return (action: string | undefined, progress: number) => {
    ctx.clearRect(0,0,rig.size[0],rig.size[1])
    const ears=rigAngles(progress,rig.ears.length,false)
    rig.ears.forEach(([x,y],i) => {
      ctx.save();ctx.translate(x,y)
      ctx.rotate(action === 'attention' || action === 'ear'+i ? ears[i]! : 0)
      ctx.translate(-x,-y);layer('ear'+i);ctx.restore()
    })
    layer('body')
    drawTail(action === 'tail' || action === 'attention' ? progress : 0)
    if (action === 'blink') {
      ctx.save();ctx.globalAlpha=Math.min(1,Math.sin(Math.PI*progress)*2)
      layer('blink');ctx.restore()
    }
  }
}
