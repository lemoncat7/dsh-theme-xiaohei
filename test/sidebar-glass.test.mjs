import assert from 'node:assert/strict'
import test from 'node:test'
import { installXiaoheiSidebarGlass, XIAOHEI_SIDEBAR_GLASS_ID } from '../lib/sidebar-glass.js'
import { XIAOHEI_SCENE_LAYER_ID } from '../lib/scene/styles.js'

test('streamed DOM changes do not remeasure glass; resize, remount and disposal remain correct', async () => {
  const elements = new Map()
  const frames = new Map()
  const timers = new Map()
  const events = new Map()
  const attributes = new Map()
  let mutation
  let resize
  let serial = 0
  let reads = 0
  let width = 280
  let shell = { getBoundingClientRect() { reads++; return { left: 0, top: 0, width, height: 900 } } }
  const world = { nextSibling: null }
  const scene = {
    firstChild: world,
    querySelector: () => world,
    insertBefore(element, reference) {
      assert.equal(reference, null, 'glass must append after the last-child wallpaper, never precede it')
      element.parentElement = scene
      elements.set(element.id, element)
    },
  }
  elements.set(XIAOHEI_SCENE_LAYER_ID, scene)
  const doc = {
    body: {},
    documentElement: {
      setAttribute: (k, v) => attributes.set(k, v),
      removeAttribute: k => attributes.delete(k),
    },
    getElementById: id => elements.get(id) ?? null,
    querySelector: () => shell,
    createElement: () => ({
      values: new Map(),
      get style() { return { setProperty: (k, v) => this.values.set(k, v) } },
      setAttribute() {},
      remove() { elements.delete(this.id); this.parentElement = null },
    }),
    defaultView: {
      MutationObserver: class {
        constructor(callback) { this.callback = callback; mutation = this }
        observe() {}
        disconnect() { this.disconnected = true }
      },
      ResizeObserver: class {
        constructor(callback) { this.callback = callback; resize = this }
        observe(element) { this.target = element }
        disconnect() { this.target = undefined }
      },
      requestAnimationFrame(callback) { const id = ++serial; frames.set(id, callback); return id },
      cancelAnimationFrame: id => frames.delete(id),
      setTimeout(callback) { const id = ++serial; timers.set(id, callback); return id },
      clearTimeout: id => timers.delete(id),
      addEventListener: (name, callback) => events.set(name, callback),
      removeEventListener: name => events.delete(name),
    },
  }
  const flush = async () => {
    await Promise.resolve()
    for (const [id, callback] of [...frames]) { frames.delete(id); callback() }
  }
  const dispose = installXiaoheiSidebarGlass(doc)
  await flush()
  assert.equal(reads, 1)
  assert.equal(elements.get(XIAOHEI_SIDEBAR_GLASS_ID).values.get('--xiaohei-sidebar-glass-width'), '266px')

  for (let i = 0; i < 100; i++) { mutation.callback(); await flush() }
  assert.equal(reads, 1, 'streaming must not force a new layout measurement')

  width = 360
  resize.callback()
  await flush()
  assert.equal(reads, 2)
  assert.equal(elements.get(XIAOHEI_SIDEBAR_GLASS_ID).values.get('--xiaohei-sidebar-glass-width'), '346px')
  assert.ok(attributes.has('data-xiaohei-sidebar-resizing'))

  shell = { getBoundingClientRect() { reads++; return { left: 0, top: 0, width: 56, height: 900 } } }
  mutation.callback()
  await flush()
  assert.equal(reads, 3)
  assert.equal(elements.get(XIAOHEI_SIDEBAR_GLASS_ID).values.get('--xiaohei-sidebar-glass-width'), '42px')
  assert.equal(resize.target, shell)

  elements.delete(XIAOHEI_SCENE_LAYER_ID)
  mutation.callback()
  await flush()
  assert.equal(elements.has(XIAOHEI_SIDEBAR_GLASS_ID), false)
  elements.set(XIAOHEI_SCENE_LAYER_ID, scene)
  mutation.callback()
  await flush()
  assert.equal(reads, 4)

  resize.callback()
  dispose()
  await flush()
  assert.equal(reads, 4)
  assert.equal(elements.has(XIAOHEI_SIDEBAR_GLASS_ID), false)
  assert.equal(frames.size, 0)
  assert.equal(timers.size, 0)
  assert.equal(events.size, 0)
  assert.equal(attributes.size, 0)
  assert.equal(mutation.disconnected, true)
  assert.equal(resize.target, undefined)
})
