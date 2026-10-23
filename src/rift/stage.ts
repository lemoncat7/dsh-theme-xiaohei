export type SpiritStage=[number,number,number,number]
/** Match the visible conversation, not the viewport edge hidden by sidebars. */
export function stageBounds(width:number,height:number,box?:Pick<DOMRect,'left'|'right'|'top'|'bottom'>):SpiritStage {
 const left=Math.max(0,Math.min(width,box?.left??0)),right=Math.max(left,Math.min(width,box?.right??width))
 return[left,right,Math.max(0,box?.top??0),Math.min(height,box?.bottom??height)]
}
/** Layout reads only on resize / session changes, never in the render loop. */
export function watchSpiritStage(doc:Document,changed:(stage:SpiritStage)=>void):{refresh():void;dispose():void} {
 const win=doc.defaultView
 let target:Element|null=null,disposed=false
 let previous:SpiritStage|undefined
 const measure=()=>{
  if(!win||disposed)return
  const rect=target?.getBoundingClientRect()
  const next=stageBounds(win.innerWidth,win.innerHeight,rect&&rect.right>rect.left?rect:undefined)
  if(previous&&next.every((value,index)=>value===previous![index]))return
  previous=next
  changed(next)
 }
 const observer=win&&typeof win.ResizeObserver==='function'?new win.ResizeObserver(measure):undefined
 const refresh=()=>{
  if(disposed)return
  const next=doc.querySelector?.('[data-conversation-scroll]')??null
  if(next!==target){observer?.disconnect();target=next;if(target)observer?.observe(target)}
  measure()
 }
 refresh()
 return{refresh,dispose(){disposed=true;observer?.disconnect();target=null}}
}
