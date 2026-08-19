import assert from 'node:assert/strict'
import test from 'node:test'
import {
  XIAOHEI_SCENE_CSS,
  XIAOHEI_SCENE_PART_COUNT,
  installXiaoheiScene,
} from '../lib/scene.js'
import { apply } from '../lib/plugin.js'
import {
  XIAOHEI_COMPLETE,
  XIAOHEI_ENERGY,
  XIAOHEI_ERROR,
  XIAOHEI_IDLE_SHEET,
  XIAOHEI_KEY_ART,
  XIAOHEI_STREAMING,
  XIAOHEI_TOOL,
  XIAOHEI_WAITING,
} from '../lib/generated-keyart.js'
import {
  bindXiaoheiSessionState,
  resolveXiaoheiState,
  XIAOHEI_STATE_ATTRIBUTE,
} from '../lib/state.js'
import { XIAOHEI_NIGHT_THEME, XIAOHEI_NIGHT_THEME_ID } from '../lib/theme.js'

test('registers and activates Xiaohei Night exactly once', () => {
  const calls = []
  const cleanups = []
  let onThemeChange
  const dispose = () => calls.push(['dispose'])
  const ctx = {
    effect(setup, label) {
      calls.push(['effect', label])
      cleanups.push(setup())
    },
    on(event, listener) {
      calls.push(['on', event])
      onThemeChange = listener
      return () => calls.push(['off', event])
    },
    theme: {
      register(definition) {
        calls.push(['register', definition])
        return dispose
      },
      setTheme(id) {
        calls.push(['setTheme', id])
      },
    },
  }

  apply(ctx)

  assert.equal(calls[0][0], 'effect')
  assert.deepEqual(calls[1], ['register', XIAOHEI_NIGHT_THEME])
  assert.deepEqual(calls[2], ['on', 'theme/change'])
  assert.deepEqual(calls[3], ['setTheme', XIAOHEI_NIGHT_THEME_ID])
  assert.deepEqual(calls[4], ['effect', 'xiaohei-theme: install moonlit forest scene'])
  assert.deepEqual(calls[5], ['effect', 'xiaohei-theme: follow current session agent state'])

  onThemeChange({ preference: 'system' })
  assert.deepEqual(calls[6], ['setTheme', XIAOHEI_NIGHT_THEME_ID])

  cleanups[2]()
  cleanups[1]()
  cleanups[0]()
  assert.deepEqual(calls.slice(-2), [
    ['off', 'theme/change'],
    ['dispose'],
  ])
})

test('scene uses asynchronously decoded key art and compositor-safe motion', () => {
  assert.equal(XIAOHEI_SCENE_PART_COUNT, 7)
  assert.match(XIAOHEI_KEY_ART, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_IDLE_SHEET, /^data:image\/webp;base64,/)
  for (const asset of [
    XIAOHEI_ENERGY,
    XIAOHEI_STREAMING,
    XIAOHEI_TOOL,
    XIAOHEI_WAITING,
    XIAOHEI_COMPLETE,
    XIAOHEI_ERROR,
  ]) assert.match(asset, /^data:image\/webp;base64,/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /data:image\/webp;base64,/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-mascot-blink/)
  for (const state of ['thinking', 'streaming', 'tool', 'waiting', 'complete', 'error']) {
    assert.match(XIAOHEI_SCENE_CSS, new RegExp(`data-xiaohei-state='${state}'`))
    assert.match(XIAOHEI_SCENE_CSS, new RegExp(`mascot-state--${state}`))
  }
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-energy-outer/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-energy-mote-one/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-stream-mote/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-tool-key/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-waiting-ring/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-complete-spark/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-error-glow/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /xiaohei-mascot-breathe/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__mascot::before/)
  assert.match(XIAOHEI_SCENE_CSS, /brightness\(1\.42\) contrast\(0\.76\)/)
  assert.match(XIAOHEI_SCENE_CSS, /drop-shadow\([^)]*83 218 193/)
  assert.match(XIAOHEI_SCENE_CSS, /transition:\s*opacity 120ms/)
  assert.match(installXiaoheiScene.toString(), /requestIdleCallback/)
  assert.match(installXiaoheiScene.toString(), /decoding = ['"]async['"]/)
  assert.match(installXiaoheiScene.toString(), /fetchPriority = ['"]low['"]/)
  assert.match(XIAOHEI_SCENE_CSS, /pointer-events:\s*none/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__keyart/)
  assert.match(XIAOHEI_SCENE_CSS, /prefers-reduced-motion:\s*reduce/)
  assert.match(XIAOHEI_SCENE_CSS, /forced-colors:\s*active/)

  const keyframes = [...XIAOHEI_SCENE_CSS.matchAll(/@keyframes[\s\S]*?(?=\n@keyframes|\n@media|$)/g)]
    .map(match => match[0])
    .join('\n')
  assert.doesNotMatch(keyframes, /\b(?:top|right|bottom|left|width|height|filter|background-position)\s*:/)
  assert.equal(typeof installXiaoheiScene(undefined), 'function')
})

test('official state priority is error, waiting, tool, streaming, thinking, idle', () => {
  const base = conversationSnapshot()
  assert.equal(resolveXiaoheiState(base, undefined), 'idle')
  assert.equal(resolveXiaoheiState({ ...base, running: true }, undefined), 'thinking')
  assert.equal(resolveXiaoheiState({ ...base, running: true, partial: {} }, undefined), 'streaming')
  assert.equal(resolveXiaoheiState({ ...base, running: true, partial: {}, runningCalls: [{}] }, undefined), 'tool')
  assert.equal(resolveXiaoheiState({ ...base, running: true, partial: {}, runningCalls: [{}], pending: [{}] }, undefined), 'waiting')
  assert.equal(resolveXiaoheiState({ ...base, running: true, runningCalls: [{}], pending: [{}], lastAgentError: 'failed' }, undefined), 'error')
  assert.equal(resolveXiaoheiState(undefined, { running: true }), 'thinking')
  assert.equal(resolveXiaoheiState(undefined, { running: true, pendingInteraction: 'question' }), 'waiting')
})

test('selected session drives state, completion is transient, and switching never celebrates', async () => {
  let listSnapshot = {
    current: 'session-a',
    byId: {
      'session-a': { running: false },
      'session-b': { running: true },
    },
  }
  const listListeners = new Set()
  const sessionSnapshots = new Map([
    ['session-a', conversationSnapshot()],
    ['session-b', conversationSnapshot({ sessionId: 'session-b', running: true })],
  ])
  const sessionListeners = new Map([
    ['session-a', new Set()],
    ['session-b', new Set()],
  ])
  const sessionFaces = new Map([...sessionSnapshots.keys()].map(id => [id, {
    getSnapshot: () => sessionSnapshots.get(id),
    subscribe(listener) {
      sessionListeners.get(id).add(listener)
      return () => sessionListeners.get(id).delete(listener)
    },
  }]))
  const attributes = new Map()
  const sessions = {
    list: {
      getSnapshot: () => listSnapshot,
      subscribe(listener) {
        listListeners.add(listener)
        return () => listListeners.delete(listener)
      },
    },
    binding(id) {
      return { session: sessionFaces.get(id) }
    },
  }
  const doc = {
    documentElement: {
      setAttribute: (name, value) => attributes.set(name, value),
      removeAttribute: name => attributes.delete(name),
    },
  }

  const dispose = bindXiaoheiSessionState(sessions, doc, 12)
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'idle')
  assert.equal(sessionListeners.get('session-a').size, 1)

  sessionSnapshots.set('session-a', conversationSnapshot({ running: true }))
  for (const listener of sessionListeners.get('session-a')) listener()
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'thinking')

  sessionSnapshots.set('session-a', conversationSnapshot({ running: true, partial: {} }))
  for (const listener of sessionListeners.get('session-a')) listener()
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'streaming')

  sessionSnapshots.set('session-a', conversationSnapshot())
  for (const listener of sessionListeners.get('session-a')) listener()
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'complete')

  sessionSnapshots.set('session-a', conversationSnapshot({ running: true }))
  for (const listener of sessionListeners.get('session-a')) listener()
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'thinking')
  await new Promise(resolve => setTimeout(resolve, 18))
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'thinking')

  sessionSnapshots.set('session-a', conversationSnapshot())
  for (const listener of sessionListeners.get('session-a')) listener()
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'complete')
  await new Promise(resolve => setTimeout(resolve, 18))
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'idle')

  listSnapshot = { ...listSnapshot, current: 'session-b' }
  for (const listener of listListeners) listener()
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'thinking')
  assert.equal(sessionListeners.get('session-a').size, 0)
  assert.equal(sessionListeners.get('session-b').size, 1)

  listSnapshot = { ...listSnapshot, current: 'session-a' }
  for (const listener of listListeners) listener()
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'idle')

  dispose()
  assert.equal(attributes.has(XIAOHEI_STATE_ATTRIBUTE), false)
  assert.equal(listListeners.size, 0)
  assert.equal(sessionListeners.get('session-a').size, 0)
  assert.equal(sessionListeners.get('session-b').size, 0)
})

test('uses dark theme semantics and only DSH custom properties', () => {
  assert.equal(XIAOHEI_NIGHT_THEME.colorScheme, 'dark')
  assert.ok(Object.keys(XIAOHEI_NIGHT_THEME.tokens).length >= 40)
  for (const key of Object.keys(XIAOHEI_NIGHT_THEME.tokens)) {
    assert.match(key, /^--dsw-/)
  }
})

test('core opaque text and control pairs meet WCAG AA contrast', () => {
  const tokens = XIAOHEI_NIGHT_THEME.tokens
  const pairs = [
    ['primary text', tokens['--dsw-alias-label-primary'], '#081014'],
    ['secondary text', tokens['--dsw-alias-label-secondary'], '#081014'],
    ['tertiary text', tokens['--dsw-alias-label-tertiary'], '#081014'],
    ['caption text', tokens['--dsw-alias-label-caption'], '#081014'],
    ['brand text', tokens['--dsw-alias-brand-text'], '#081014'],
    ['primary button', tokens['--dsw-alias-label-primary-foreground'], tokens['--dsw-alias-button-primary-fill']],
  ]

  for (const [name, foreground, background] of pairs) {
    const ratio = contrast(foreground, background)
    assert.ok(ratio >= 4.5, `${name} contrast ${ratio.toFixed(2)} is below 4.5:1`)
  }
})

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background))
  const darker = Math.min(luminance(foreground), luminance(background))
  return (lighter + 0.05) / (darker + 0.05)
}

function conversationSnapshot(overrides = {}) {
  return {
    sessionId: 'session-a',
    removed: false,
    openState: 'open',
    openError: null,
    promptError: null,
    lastAgentError: null,
    pending: [],
    runningCalls: [],
    partial: null,
    running: false,
    ...overrides,
  }
}

function luminance(hex) {
  assert.match(hex, /^#[0-9a-f]{6}$/i)
  const channels = [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
  const [red, green, blue] = channels.map(channel => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}
