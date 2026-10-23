// Explicitly authorized DSH image-service workflow. Run inside the DSH
// container with reference.png in each job directory. Reuses the installed
// plugin tool, its saved config and credential; never prints credentials.
import {readFile,mkdir,writeFile} from 'node:fs/promises'
import {createRequire} from 'node:module'
import {imageGenerationTool} from '/data/profiles/web/node_modules/@lemoncat7/dsh-image-generator/lib/tool.js'
const require=createRequire('/data/profiles/web/node_modules/@lemoncat7/dsh-image-generator/package.json')
const {parse}=require('yaml')
const config=JSON.parse(await readFile('/tmp/dsh-rift-image-config.json','utf8'))
const credentials=parse(await readFile('/data/.credentials.yaml','utf8'))
const key=process.env.OPENAI_IMAGE_API_KEY||credentials.refs?.OPENAI_IMAGE_API_KEY
if(typeof key!=='string'||!key.trim())throw Error('Image plugin credential unavailable')
const [mode,part]=process.argv.slice(2)
if(!['dark','light'].includes(mode)||!['body','hair'].includes(part))throw Error('Expected dark|light and body|hair')
const cwd=`/tmp/dsh-wind-layers-v1/${mode}-${part}`
await mkdir(cwd,{recursive:true,mode:0o700})
const shared=`Use case: precise-object-edit. Image 1 is the EDIT TARGET, an approved 2D anime painting of white-haired human Luo Xiaohei. This is an animation UNDERPAINT / CLEAN PLATE, not a new composition. Preserve exactly the framing, scale, camera, outlines and all untouched pixels. Match the ${mode==='light'?'pale softly lit daylight':'dark cool nighttime'} palette. No text, guides, marks, transparency checkerboard, new objects or new lighting. Keep the SAME aspect ratio and original pixel positions. Do not zoom, recenter or redesign anything. Only repaint the specifically removed parts with the content that would naturally be BEHIND them. The removed parts will be restored as moving layers by our compositor.`
const prompt=shared+(part==='body'?`
Remove the OUTSTRETCHED ARM on the LEFT side of the picture: the hand, forearm, and its ENTIRE wide black sleeve with pale green cuff. Repair the exposed area with the same atmospheric cloudy/ruined sky, smoothly continuing surrounding scenery. Where the sleeve overlaps the torso, reconstruct the underlying plain charcoal shirt and shoulder surface with coherent existing folds; do NOT add a stump, alternate arm, sleeve outline, arm-shaped shadow or new cuff. This character is intentionally missing that arm in this UNDERPAINT ONLY.
Also remove ONLY the small outward-flying BLACK SHIRT HEM FLAP at the lower LEFT edge of the torso, ABOVE the trousers (not the large trouser leg extending down-left). Continue the underlying charcoal trousers naturally where that flap overlapped them, and sky where it protruded beyond the silhouette. Keep the waist, torso silhouette on the right, all trouser legs and the other arm unchanged. Preserve everything else including the visible lower face at the top. Complete both edits in one clean plate.`:`
Remove ONLY three loose peripheral hair tufts, leaving the main white hair cap, ears and face exactly unchanged:
1. The thin upward CURL / antenna on the TOP RIGHT of the hair crown. Remove the entire floating curl down to its crown attachment, reconstructing the cloudy sky behind it and a smooth continuation of the hair cap at its root.
2. The LEFT OUTER dangling white hair locks outside the left cheek, below the left ear. Remove only the hanging peripheral fringe (not the bangs crossing the forehead). Restore sky outside the face and intact skin/underlying short hair where occluded. Keep the eye and eyebrow untouched.
3. The RIGHT OUTER dangling white hair locks beside and below the right cheek, below the right ear. Remove the peripheral locks and reconstruct the sky / small neck-shirt areas behind them, with a smooth underlying hair cap at the root. Keep face, eyes, mouth and both ears exactly unchanged.
The resulting head may look like it has shorter peripheral hair; that is intentional because these three locks will be restored as separate animation layers. There must be NO old white fringe or duplicate contour remaining in the removed areas. Do not remove the whole head or change its shape.`)
const input={prompt,size:'1536x1024',count:1,referenceImages:['reference.png']}
await writeFile(cwd+'/request.json',JSON.stringify({model:config.model,...input},null,2),{mode:0o600})
const tool=imageGenerationTool({config:()=>({...config,requestTimeoutMs:300000}),apiKey:async()=>key})
console.log(JSON.stringify({phase:'submitted',mode,part,tool:tool.name,model:config.model}))
try{
 const result=await tool.execute(input,{signal:AbortSignal.timeout(310000),agent:{session:{header:{cwd}}}})
 await writeFile(cwd+'/result.json',result,{mode:0o600})
 console.log(JSON.stringify({phase:'complete',mode,part,...JSON.parse(result)}))
}catch(error){console.error(JSON.stringify({phase:'failed',mode,part,message:String(error.message).replaceAll(key,'[redacted]')}));process.exitCode=1}
