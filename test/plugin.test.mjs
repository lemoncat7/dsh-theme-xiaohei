import assert from 'node:assert/strict'
import test from 'node:test'
import {
  XIAOHEI_SCENE_CSS,
  XIAOHEI_SCENE_PART_COUNT,
  installXiaoheiScene,
} from '../lib/scene.js'
import { apply } from '../lib/plugin.js'
import { XIAOHEI_IDLE_SHEET, XIAOHEI_KEY_ART, XIAOHEI_THINKING } from '../lib/generated-keyart.js'
import { bindXiaoheiSessionState, XIAOHEI_STATE_ATTRIBUTE } from '../lib/state.js'
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
  assert.deepEqual(calls[5], ['effect', 'xiaohei-theme: follow current session running state'])

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
  assert.match(XIAOHEI_THINKING, /^data:image\/webp;base64,/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /data:image\/webp;base64,/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-mascot-blink/)
  assert.match(XIAOHEI_SCENE_CSS, /data-xiaohei-state='thinking'/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /xiaohei-mascot-breathe/)
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

test('thinking state follows only the selected session running bit', () => {
  let snapshot = {
    current: 'session-a',
    byId: {
      'session-a': { running: false },
      'session-b': { running: true },
    },
  }
  const listeners = new Set()
  const attributes = new Map()
  const sessions = {
    list: {
      getSnapshot: () => snapshot,
      subscribe(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    },
  }
  const doc = {
    documentElement: {
      setAttribute: (name, value) => attributes.set(name, value),
      removeAttribute: name => attributes.delete(name),
    },
  }

  const dispose = bindXiaoheiSessionState(sessions, doc)
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'idle')

  snapshot = { ...snapshot, byId: { ...snapshot.byId, 'session-a': { running: true } } }
  for (const listener of listeners) listener()
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'thinking')

  snapshot = { ...snapshot, current: 'session-b', byId: { ...snapshot.byId, 'session-b': { running: false } } }
  for (const listener of listeners) listener()
  assert.equal(attributes.get(XIAOHEI_STATE_ATTRIBUTE), 'idle')

  dispose()
  assert.equal(attributes.has(XIAOHEI_STATE_ATTRIBUTE), false)
  assert.equal(listeners.size, 0)
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

function luminance(hex) {
  assert.match(hex, /^#[0-9a-f]{6}$/i)
  const channels = [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
  const [red, green, blue] = channels.map(channel => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}
