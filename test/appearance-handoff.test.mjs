import assert from 'node:assert/strict'
import test from 'node:test'
import { bindXiaoheiAppearance } from '../lib/appearance.js'

function fixture(boot, scheme) {
  const attrs = new Map([['data-xiaohei-boot-appearance', boot]])
  const timers = new Map()
  let listener, serial = 0, removed = false
  let snapshot = { preference: 'system', active: { colorScheme: scheme } }
  const doc = {
    documentElement: {
      getAttribute: key => attrs.get(key) ?? null,
      setAttribute: (key, value) => attrs.set(key, value),
      removeAttribute: key => attrs.delete(key),
    },
    getElementById: () => ({ remove() { removed = true } }),
    defaultView: {
      setTimeout(fn) { timers.set(++serial, fn); return serial },
      clearTimeout(id) { timers.delete(id) },
    },
  }
  const ctx = { theme: { getTheme: () => snapshot }, on(_event, fn) { listener = fn; return () => {} } }
  const dispose = bindXiaoheiAppearance(ctx, doc)
  return { attrs, timers, dispose, removed: () => removed,
    change(scheme) { snapshot = { ...snapshot, active: { colorScheme: scheme } }; listener(snapshot) },
    flush() { for (const fn of [...timers.values()]) fn() },
  }
}

test('a stale boot palette cannot override an authoritative system theme event', () => {
  const f = fixture('light', 'dark')
  assert.equal(f.attrs.get('data-xiaohei-appearance'), 'light')
  f.change('dark')
  assert.equal(f.attrs.get('data-xiaohei-appearance'), 'dark')
  assert.equal(f.attrs.has('data-xiaohei-boot-appearance'), false)
  assert.equal(f.timers.size, 0)
  f.change('light')
  assert.equal(f.attrs.get('data-xiaohei-appearance'), 'light')
  f.dispose()
})

test('a mismatched boot palette expires even if no further event is emitted', () => {
  for (const [boot, actual] of [['light', 'dark'], ['dark', 'light']]) {
    const f = fixture(boot, actual)
    f.flush()
    assert.equal(f.attrs.get('data-xiaohei-appearance'), actual)
    assert.equal(f.attrs.has('data-xiaohei-boot-appearance'), false)
    assert.equal(f.removed(), true)
    assert.equal(f.timers.size, 0)
    f.dispose()
  }
})

test('disposing during boot cancels the pending handoff and ignores queued events', () => {
  const f = fixture('dark', 'light')
  f.dispose()
  f.flush()
  f.change('dark')
  assert.equal(f.timers.size, 0)
  assert.equal(f.attrs.size, 0)
})
