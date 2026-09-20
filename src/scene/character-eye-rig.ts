import type { Point } from './character-motion-types.js'

/** Landmarks in the approved full-resolution artwork, not screen coordinates. */
export interface EyeRig {
  left: Point
  right: Point
  upper: Point
  lower: Point
  iris: readonly [number,number,number,number,number]
  skin: Point
}
export const EYE_RIGS: Readonly<Record<string, readonly EyeRig[]>> = {
  seated: [
    {left:[285,223],right:[326,224],upper:[302,188],lower:[310,276],iris:[309,230,13,20,0],skin:[315,258]},
    {left:[373,221],right:[421,226],upper:[387,186],lower:[393,277],iris:[393,228,15,22,0],skin:[391,261]},
  ],
  peek: [
    {left:[80,214],right:[119,221],upper:[103,186],lower:[91,267],iris:[102,225,14,20,.25],skin:[110,253]},
    {left:[171,252],right:[210,265],upper:[195,221],lower:[175,300],iris:[186,260,15,20,.4],skin:[186,288]},
  ],
  chin: [
    {left:[252,252],right:[290,247],upper:[266,223],lower:[287,297],iris:[278,258,14,19,-.3],skin:[291,285]},
    {left:[339,234],right:[387,227],upper:[358,196],lower:[365,280],iris:[361,235,15,21,-.25],skin:[367,269]},
  ],
  halfpeek: [
    {left:[89,390],right:[159,395],upper:[116,337],lower:[110,471],iris:[116,401,23,30,.22],skin:[117,445]},
  ],
}

export function clampGaze(x: number,y: number): Point {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return [0,0]
  const length=Math.max(1,Math.hypot(x,y))
  return [x/length,y/length]
}

/** Both lids meet on the same gently curved lash line, never a rectangular wipe. */
export function eyelidControls(eye: EyeRig, closure: number): {upper: Point; lower: Point;left:Point;right:Point} {
  const t=Math.max(0,Math.min(1,closure))
  // Upper lid does most of the travel. Closing at the eye's centre looked like
  // a squint; the resting lash sits near the lower rim instead.
  const cornerY=(eye.left[1]+eye.right[1])/2
  const drop=(eye.lower[1]-cornerY)*.24
  const middle: Point=[(eye.left[0]+eye.right[0])/2,cornerY+drop+(eye.right[0]-eye.left[0])*.18]
  const lerp=(p:Point):Point=>[p[0]+(middle[0]-p[0])*t,p[1]+(middle[1]-p[1])*t]
  return {upper:lerp(eye.upper),lower:lerp(eye.lower),left:[eye.left[0],eye.left[1]+drop*t],right:[eye.right[0],eye.right[1]+drop*t]}
}
