import {
  XIAOHEI_TREE_HOLLOW_DARK,
  XIAOHEI_TREE_HOLLOW_LIGHT,
} from '../generated-backgrounds.js'
import {
  XIAOHEI_AVATAR_STANDING_BLINK,
  XIAOHEI_AVATAR_STANDING_OPEN,
} from '../generated-keyart.js'

export const XIAOHEI_TREE_HOLLOW_CLASS = 'xiaohei-tree-hollow'

interface ForestLeaf {
  x: string
  size: string
  duration: string
  delay: string
  driftA: string
  driftB: string
  driftEnd: string
  rotateA: string
  rotateB: string
  rotateC: string
  rotateEnd: string
  opacity: string
}

/** Fixed paths keep the scene deterministic and avoid a permanent JS animation loop. */
const FOREST_LEAVES: readonly ForestLeaf[] = [
  { x: '5%', size: '17px', duration: '21s', delay: '-17s', driftA: '3vw', driftB: '-2vw', driftEnd: '7vw', rotateA: '98deg', rotateB: '213deg', rotateC: '316deg', rotateEnd: '410deg', opacity: '.58' },
  { x: '14%', size: '12px', duration: '18s', delay: '-4s', driftA: '-2vw', driftB: '3vw', driftEnd: '-5vw', rotateA: '-116deg', rotateB: '-250deg', rotateC: '-370deg', rotateEnd: '-480deg', opacity: '.50' },
  { x: '25%', size: '20px', duration: '25s', delay: '-22s', driftA: '4vw', driftB: '1vw', driftEnd: '9vw', rotateA: '127deg', rotateB: '276deg', rotateC: '408deg', rotateEnd: '530deg', opacity: '.66' },
  { x: '36%', size: '14px', duration: '20s', delay: '-11s', driftA: '-3vw', driftB: '2vw', driftEnd: '-7vw', rotateA: '-94deg', rotateB: '-203deg', rotateC: '-300deg', rotateEnd: '-390deg', opacity: '.54' },
  { x: '47%', size: '18px', duration: '23s', delay: '-2s', driftA: '2vw', driftB: '-3vw', driftEnd: '6vw', rotateA: '113deg', rotateB: '244deg', rotateC: '362deg', rotateEnd: '470deg', opacity: '.62' },
  { x: '58%', size: '13px', duration: '17s', delay: '-14s', driftA: '-2vw', driftB: '2vw', driftEnd: '-4vw', rotateA: '-106deg', rotateB: '-229deg', rotateC: '-339deg', rotateEnd: '-440deg', opacity: '.49' },
  { x: '68%', size: '21px', duration: '27s', delay: '-8s', driftA: '3vw', driftB: '-1vw', driftEnd: '8vw', rotateA: '134deg', rotateB: '291deg', rotateC: '431deg', rotateEnd: '560deg', opacity: '.68' },
  { x: '77%', size: '15px', duration: '20s', delay: '-19s', driftA: '-4vw', driftB: '1vw', driftEnd: '-8vw', rotateA: '-101deg', rotateB: '-218deg', rotateC: '-323deg', rotateEnd: '-420deg', opacity: '.53' },
  { x: '85%', size: '18px', duration: '24s', delay: '-6s', driftA: '2vw', driftB: '-2vw', driftEnd: '5vw', rotateA: '91deg', rotateB: '204deg', rotateC: '329deg', rotateEnd: '445deg', opacity: '.60' },
  { x: '93%', size: '13px', duration: '19s', delay: '-13s', driftA: '-3vw', driftB: '2vw', driftEnd: '-6vw', rotateA: '-122deg', rotateB: '-257deg', rotateC: '-378deg', rotateEnd: '-492deg', opacity: '.50' },
  { x: '42%', size: '11px', duration: '16s', delay: '-9s', driftA: '2vw', driftB: '-1vw', driftEnd: '4vw', rotateA: '104deg', rotateB: '225deg', rotateC: '344deg', rotateEnd: '458deg', opacity: '.52' },
  { x: '81%', size: '22px', duration: '29s', delay: '-24s', driftA: '-2vw', driftB: '3vw', driftEnd: '-5vw', rotateA: '-87deg', rotateB: '-196deg', rotateC: '-312deg', rotateEnd: '-428deg', opacity: '.70' },
]

/** Mount the compressed tree-hollow artwork without animation or a render loop. */
export function mountXiaoheiTreeHollowBackground(host: HTMLElement): () => void {
  const doc = host.ownerDocument
  const scene = doc.createElement('div')
  scene.className = XIAOHEI_TREE_HOLLOW_CLASS
  scene.setAttribute('aria-hidden', 'true')

  scene.append(
    createBackdropImage(doc, XIAOHEI_TREE_HOLLOW_DARK, 'dark'),
    createBackdropImage(doc, XIAOHEI_TREE_HOLLOW_LIGHT, 'light'),
    createTreeHollowXiaohei(doc),
  )
  host.append(scene)

  const leaves = createForestLeaves(doc)
  doc.body.append(leaves)

  doc.documentElement.dataset.xiaoheiWorldRenderer = 'tree-hollow-static-v1'

  return () => {
    leaves.remove()
    scene.remove()
    if (doc.documentElement.dataset.xiaoheiWorldRenderer === 'tree-hollow-static-v1') {
      delete doc.documentElement.dataset.xiaoheiWorldRenderer
    }
  }
}

function createTreeHollowXiaohei(doc: Document): HTMLSpanElement {
  const character = doc.createElement('span')
  character.className = 'xiaohei-tree-hollow__xiaohei'

  const viewport = doc.createElement('span')
  viewport.className = 'xiaohei-tree-hollow__xiaohei-viewport'

  const open = createXiaoheiImage(
    doc,
    XIAOHEI_AVATAR_STANDING_OPEN,
    'xiaohei-tree-hollow__xiaohei-image xiaohei-tree-hollow__xiaohei-image--open',
  )
  const blink = createXiaoheiImage(
    doc,
    XIAOHEI_AVATAR_STANDING_BLINK,
    'xiaohei-tree-hollow__xiaohei-image xiaohei-tree-hollow__xiaohei-image--blink',
  )

  viewport.append(open, blink)
  character.append(viewport)
  return character
}

function createXiaoheiImage(
  doc: Document,
  source: string,
  className: string,
): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = className
  image.alt = ''
  image.decoding = 'async'
  image.fetchPriority = 'low'
  image.src = source
  return image
}

function createForestLeaves(doc: Document): HTMLDivElement {
  const layer = doc.createElement('div')
  layer.className = 'xiaohei-tree-hollow__leaves'

  for (const leaf of FOREST_LEAVES) {
    const node = doc.createElement('span')
    node.className = 'xiaohei-tree-hollow__leaf'
    node.style.setProperty('--leaf-x', leaf.x)
    node.style.setProperty('--leaf-size', leaf.size)
    node.style.setProperty('--leaf-duration', leaf.duration)
    node.style.setProperty('--leaf-delay', leaf.delay)
    node.style.setProperty('--leaf-drift-a', leaf.driftA)
    node.style.setProperty('--leaf-drift-b', leaf.driftB)
    node.style.setProperty('--leaf-drift-end', leaf.driftEnd)
    node.style.setProperty('--leaf-rotate-a', leaf.rotateA)
    node.style.setProperty('--leaf-rotate-b', leaf.rotateB)
    node.style.setProperty('--leaf-rotate-c', leaf.rotateC)
    node.style.setProperty('--leaf-rotate-end', leaf.rotateEnd)
    node.style.setProperty('--leaf-opacity', leaf.opacity)
    layer.append(node)
  }

  return layer
}

function createBackdropImage(
  doc: Document,
  source: string,
  appearance: 'light' | 'dark',
): HTMLImageElement {
  const image = doc.createElement('img')
  image.className = `xiaohei-tree-hollow__image xiaohei-tree-hollow__image--${appearance}`
  image.alt = ''
  image.decoding = 'async'
  image.fetchPriority = 'low'
  image.src = source
  return image
}
