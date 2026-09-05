import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveCharacterPlacement } from '../lib/scene/character-layout.js'
import { installXiaoheiWallpaperCharacter } from '../lib/scene/wallpaper-character.js'
const rect = (left, top, right, bottom) => ({ left, top, right, bottom })
const base = { viewportWidth: 1920, viewportHeight: 900, sidebar: rect(0,0,280,900), scroll: rect(280,78,1920,900),
  flow: rect(632,0,1552,20000), composer: rect(616,770,1568,868), controls: [] }

test('wide layout seats the full pose strictly outside message avatars and composer', () => {
  const p = resolveCharacterPlacement(base)
  assert.equal(p.pose, 'seated')
  assert.ok(p.left > base.flow.right + 50)
  assert.ok(p.top + p.height < base.composer.top)
  assert.ok(p.left + p.width < base.scroll.right)
})
test('medium layout peeks along sidebar edge without entering the message/avatar area', () => {
  const input = {...base, viewportWidth:1280, scroll:rect(280,78,1280,900), flow:rect(432,0,1112,20000), composer:rect(416,770,1128,868)}
  const p = resolveCharacterPlacement(input)
  assert.equal(p.pose, 'peek')
  assert.ok(p.left + p.width < input.flow.left - 52)
  assert.equal(p.left, input.sidebar.right - 6)
})
test('phone pose occupies only free rail space, avoiding every control and chat column', () => {
  const input={...base,viewportWidth:390,sidebar:rect(0,0,55,844),scroll:rect(56,78,390,844),
    flow:rect(88,0,343,20000),composer:rect(72,672,359,812),controls:[rect(0,0,55,300),rect(0,720,55,844)]}
  const p=resolveCharacterPlacement(input)
  assert.equal(p.pose,'halfpeek')
  assert.ok(p.top>312)
  assert.ok(p.left+p.width<input.flow.left)
  assert.ok(p.top+p.height<input.composer.top)
  for(const r of input.controls) assert.ok(p.top+p.height<r.top || p.top>r.bottom)
  assert.equal(resolveCharacterPlacement({...input,controls:[rect(0,0,55,844)]}).pose,'hidden')
})
test('crowded sidebar and modal overlay hide the pose; streams do not change placement', () => {
  assert.deepEqual(resolveCharacterPlacement(base),resolveCharacterPlacement({...base,flow:{...base.flow,top:-50000,bottom:80000}}))
  const crowded={...base,viewportWidth:1024,scroll:rect(280,78,1024,900),flow:rect(312,0,977,20000),composer:rect(296,770,993,868)}
  assert.equal(resolveCharacterPlacement(crowded).pose,'hidden')
  assert.equal(resolveCharacterPlacement({...crowded,sidebar:rect(0,0,380,900)}).pose,'hidden')
  assert.equal(typeof installXiaoheiWallpaperCharacter(undefined),'function')
})
test('wallpaper does not follow welcome/composer Y or conversation scroll geometry', () => {
  assert.deepEqual(resolveCharacterPlacement(base), resolveCharacterPlacement({ ...base,
    scroll: { ...base.scroll, top: 0, bottom: 420 },
    composer: { ...base.composer, top: 420, bottom: 542 } }))
})
