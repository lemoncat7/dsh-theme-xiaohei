import test from 'node:test'
import assert from 'node:assert/strict'
import { createCharacterIdleController } from '../lib/scene/character-idle.js'

function setup() {
  let now = 0, id = 0
  const tasks = new Map(), changes = []
  const idle = createCharacterIdleController({ now: () => now,
    setTimeout(fn, delay) { tasks.set(++id, {fn, due:now+delay}); return id },
    clearTimeout(key) { tasks.delete(key) },
  }, pose => changes.push(pose))
  const advance = ms => {
    const target = now + ms
    while (true) {
      const next = [...tasks].sort((a,b) => a[1].due - b[1].due)[0]
      if (!next || next[1].due > target) break
      now = next[1].due; tasks.delete(next[0]); next[1].fn()
    }
    now = target
  }
  return {idle, tasks, changes, advance, count: () => id}
}

test('idle advances seated → chin at 30 s → doze at 3 min, then stops scheduling', () => {
  const f=setup()
  assert.equal(f.tasks.size,0)
  f.idle.setPaused(false)
  f.advance(29_999); assert.equal(f.idle.pose,'seated')
  f.advance(1); assert.equal(f.idle.pose,'chin')
  f.advance(149_999); assert.equal(f.idle.pose,'chin')
  f.advance(1); assert.equal(f.idle.pose,'doze')
  assert.equal(f.tasks.size,0)
  assert.deepEqual(f.changes,['chin','doze'])
})
test('continuous activity does not allocate timeouts per event or allow sleep', () => {
  const f=setup(); f.idle.setPaused(false)
  for (let i=0;i<6000;i++) { f.advance(10); f.idle.activity() }
  assert.equal(f.idle.pose,'seated')
  assert.ok(f.count() <= 4)
  assert.equal(f.tasks.size,1)
})
test('activity wakes immediately and restarts the idle period once', () => {
  const f=setup(); f.idle.setPaused(false); f.advance(180_000)
  f.idle.activity(); assert.equal(f.idle.pose,'seated')
  f.advance(29_999); assert.equal(f.idle.pose,'seated')
  f.advance(1); assert.equal(f.idle.pose,'chin')
})
test('hidden/non-seated layouts pause; returning starts fresh; dispose cancels everything', () => {
  const f=setup(); f.idle.setPaused(false); f.advance(35_000)
  f.idle.setPaused(true); assert.equal(f.tasks.size,0)
  f.advance(600_000); f.idle.activity()
  assert.equal(f.tasks.size,0)
  f.idle.setPaused(false); assert.equal(f.idle.pose,'seated')
  f.advance(29_999); assert.equal(f.idle.pose,'seated')
  f.idle.dispose(); assert.equal(f.tasks.size,0)
  f.idle.setPaused(false); f.idle.activity(); f.advance(600_000)
  assert.equal(f.tasks.size,0)
})
