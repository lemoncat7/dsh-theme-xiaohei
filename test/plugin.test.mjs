import assert from 'node:assert/strict'
import test from 'node:test'
import {
  XIAOHEI_SCENE_CSS,
  XIAOHEI_SCENE_PART_COUNT,
  installXiaoheiScene,
} from '../lib/scene.js'
import { apply } from '../lib/plugin.js'
import {
  bindXiaoheiAppearance,
  XIAOHEI_APPEARANCE_ATTRIBUTE,
} from '../lib/appearance.js'
import {
  installXiaoheiChrome,
  XIAOHEI_CHROME_CSS,
  XIAOHEI_CHROME_STYLE_ID,
} from '../lib/chrome.js'
import { XIAOHEI_CHROME_ACCESSIBILITY_CSS } from '../lib/chrome/accessibility.js'
import { XIAOHEI_CONTROL_CSS } from '../lib/chrome/controls.js'
import { XIAOHEI_SURFACE_CSS } from '../lib/chrome/surfaces.js'
import { XIAOHEI_PORTAL_CSS } from '../lib/chrome/portal.js'
import { XIAOHEI_GAZE_CSS } from '../lib/chrome/gaze.js'
import { XIAOHEI_CHROME_TOKENS_CSS } from '../lib/chrome/tokens.js'
import {
  installXiaoheiGaze,
  XIAOHEI_GAZE_STYLE_ID,
} from '../lib/gaze.js'
import {
  installXiaoheiPortalTransit,
  XIAOHEI_PORTAL_ACTIVITY_EVENT,
  XIAOHEI_PORTAL_LAYER_ID,
} from '../lib/portal.js'
import {
  XIAOHEI_COMPLETE,
  XIAOHEI_DAWN_KEY_ART,
  XIAOHEI_THINKING,
  XIAOHEI_ERROR,
  XIAOHEI_HEIXIU_BLINK,
  XIAOHEI_HEIXIU_OPEN,
  XIAOHEI_IDLE_EYE_BASE,
  XIAOHEI_IDLE_SHEET,
  XIAOHEI_KEY_ART,
  XIAOHEI_NIGHT_KEY_ART,
  XIAOHEI_STREAMING,
  XIAOHEI_TOOL,
  XIAOHEI_WAITING,
} from '../lib/generated-keyart.js'
import {
  bindXiaoheiSessionState,
  resolveXiaoheiState,
  XIAOHEI_STATE_ATTRIBUTE,
} from '../lib/state.js'
import {
  XIAOHEI_DAWN_THEME,
  XIAOHEI_NIGHT_THEME,
  XIAOHEI_THEME_TOKEN_OVERRIDES,
} from '../lib/theme.js'

test('shades DSH native palettes without forcing a theme preference', () => {
  const calls = []
  const cleanups = []
  const dispose = () => calls.push(['dispose'])
  const ctx = {
    effect(setup, label) {
      calls.push(['effect', label])
      cleanups.push(setup())
    },
    theme: {
      overrideTokens(source, tokens) {
        calls.push(['overrideTokens', source, tokens])
        return dispose
      },
    },
  }

  apply(ctx)

  assert.equal(calls[0][0], 'effect')
  assert.deepEqual(calls[1], [
    'overrideTokens',
    '@lemoncat7/dsh-theme-xiaohei',
    XIAOHEI_THEME_TOKEN_OVERRIDES,
  ])
  assert.deepEqual(calls.slice(2).map(call => call[1]), [
    'xiaohei-theme: follow resolved appearance',
    'xiaohei-theme: install spirit control skin',
    'xiaohei-theme: install moonlit forest scene',
    'xiaohei-theme: install random Heixiu portal visits',
    'xiaohei-theme: install proximity gaze',
    'xiaohei-theme: follow current session agent state',
  ])
  assert.equal(calls.some(call => call[0] === 'setTheme' || call[0] === 'register'), false)

  for (const cleanup of cleanups.reverse()) cleanup()
  assert.deepEqual(calls.at(-1), ['dispose'])
})

test('spirit control skin stays semantic, accessible, and lifecycle safe', () => {
  assert.match(XIAOHEI_CHROME_STYLE_ID, /chrome-style$/)
  assert.match(XIAOHEI_CHROME_CSS, /data-composer-card/)
  assert.match(XIAOHEI_CHROME_CSS, /aria-label='发送消息'/)
  assert.match(XIAOHEI_CHROME_CSS, /role='dialog'/)
  assert.match(XIAOHEI_CHROME_CSS, /role='menu'/)
  assert.match(XIAOHEI_CHROME_CSS, /发送消息'\]::after/)
  assert.match(XIAOHEI_CHROME_CSS, /focus-visible/)
  assert.match(XIAOHEI_CHROME_CSS, /prefers-reduced-motion:\s*reduce/)
  assert.match(XIAOHEI_CHROME_CSS, /prefers-reduced-transparency:\s*reduce/)
  assert.match(XIAOHEI_CHROME_CSS, /forced-colors:\s*active/)
  assert.match(XIAOHEI_CHROME_CSS, /prefers-reduced-transparency:[\s\S]*backdrop-filter:\s*none/)
  assert.match(XIAOHEI_CHROME_CSS, /@supports not \(\(backdrop-filter:/)
  assert.doesNotMatch(XIAOHEI_CHROME_CSS, /tail-like|rotate\(/)
  assert.doesNotMatch(XIAOHEI_CHROME_CSS, /(?:^|\n)\s*(?:html|body|#root)\s+button\s*\{/)
  const keyframes = extractKeyframes(XIAOHEI_CHROME_CSS)
  assert.doesNotMatch(keyframes, /\b(?:top|right|bottom|left|width|height|filter|background-position)\s*:/)
  assert.equal(typeof installXiaoheiChrome(undefined), 'function')
})

test('control skin composes isolated responsibility layers in a stable order', () => {
  assert.equal(XIAOHEI_CHROME_CSS, [
    XIAOHEI_CHROME_TOKENS_CSS,
    XIAOHEI_CONTROL_CSS,
    XIAOHEI_SURFACE_CSS,
    XIAOHEI_CHROME_ACCESSIBILITY_CSS,
  ].join('\n'))
})

test('random Heixiu portal visits are compact, ambient, and compositor safe', () => {
  assert.match(XIAOHEI_PORTAL_LAYER_ID, /portal-layer$/)
  assert.match(XIAOHEI_PORTAL_ACTIVITY_EVENT, /portal-activity$/)
  assert.match(XIAOHEI_PORTAL_CSS, /portal__void--entry/)
  assert.match(XIAOHEI_PORTAL_CSS, /portal__void--exit/)
  assert.match(XIAOHEI_PORTAL_CSS, /portal__traveler/)
  assert.match(XIAOHEI_PORTAL_CSS, /prefers-reduced-motion:\s*reduce/)
  assert.doesNotMatch(XIAOHEI_PORTAL_CSS, /(?:ripple|slice|hud|clip-path|canvas|webgl|shader)/i)
  const keyframes = extractKeyframes(XIAOHEI_PORTAL_CSS)
  assert.doesNotMatch(keyframes, /\b(?:top|right|bottom|left|width|height|filter|background|background-position)\s*:/)
  assert.match(installXiaoheiPortalTransit.toString(), /INITIAL_VISIT_DELAY_MS/)
  assert.match(installXiaoheiPortalTransit.toString(), /VISIT_MIN_DELAY_MS/)
  assert.doesNotMatch(installXiaoheiPortalTransit.toString(), /data-xiaohei-state|requestAnimationFrame|focusin|focusout/)
  assert.equal(typeof installXiaoheiPortalTransit(undefined), 'function')
})

test('idle gaze is proximity-bound, portal-aware, and motion-safe', () => {
  assert.match(XIAOHEI_GAZE_STYLE_ID, /gaze-style$/)
  assert.match(XIAOHEI_GAZE_CSS, /xiaohei-gaze__pupil--left/)
  assert.match(XIAOHEI_GAZE_CSS, /xiaohei-gaze__pupil--right/)
  assert.match(XIAOHEI_GAZE_CSS, /data-xiaohei-state='idle'/)
  assert.match(XIAOHEI_GAZE_CSS, /prefers-reduced-motion:\s*reduce/)
  assert.match(XIAOHEI_GAZE_CSS, /hover:\s*none[\s\S]*pointer:\s*coarse/)
  assert.match(XIAOHEI_GAZE_CSS, /will-change:\s*transform/)
  assert.doesNotMatch(XIAOHEI_GAZE_CSS, /transition:\s*all/)

  const source = installXiaoheiGaze.toString()
  assert.match(source, /requestAnimationFrame/)
  assert.match(source, /cancelAnimationFrame/)
  assert.match(source, /pointerType === ['"]touch['"]/)
  assert.match(source, /XIAOHEI_PORTAL_ACTIVITY_EVENT/)
  assert.match(source, /data-xiaohei-state/)
  assert.equal(typeof installXiaoheiGaze(undefined), 'function')
})

test('resolved Light / Dark / System appearance drives the scene attribute', () => {
  const attributes = new Map()
  let listener
  const ctx = {
    theme: {
      getTheme: () => themeSnapshot('light'),
    },
    on(event, next) {
      assert.equal(event, 'theme/change')
      listener = next
      return () => attributes.set('off', true)
    },
  }
  const doc = {
    documentElement: {
      setAttribute: (name, value) => attributes.set(name, value),
      removeAttribute: name => attributes.delete(name),
    },
  }

  const dispose = bindXiaoheiAppearance(ctx, doc)
  assert.equal(attributes.get(XIAOHEI_APPEARANCE_ATTRIBUTE), 'light')
  listener(themeSnapshot('dark'))
  assert.equal(attributes.get(XIAOHEI_APPEARANCE_ATTRIBUTE), 'dark')
  dispose()
  assert.equal(attributes.has(XIAOHEI_APPEARANCE_ATTRIBUTE), false)
  assert.equal(attributes.get('off'), true)
})

test('scene uses asynchronously decoded key art and compositor-safe motion', () => {
  assert.equal(XIAOHEI_SCENE_PART_COUNT, 14)
  assert.match(XIAOHEI_KEY_ART, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_NIGHT_KEY_ART, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_DAWN_KEY_ART, /^data:image\/webp;base64,/)
  assert.equal(XIAOHEI_KEY_ART, XIAOHEI_NIGHT_KEY_ART)
  assert.match(XIAOHEI_IDLE_SHEET, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_IDLE_EYE_BASE, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_HEIXIU_OPEN, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_HEIXIU_BLINK, /^data:image\/webp;base64,/)
  for (const asset of [
    XIAOHEI_THINKING,
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
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__thinking-bubble/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__thinking-dot--one/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__thinking-dot--three/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-thinking-dot/)
  assert.match(XIAOHEI_SCENE_CSS, /prefers-reduced-motion[\s\S]*xiaohei-scene__thinking-dot[\s\S]*animation: none/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /xiaohei-(?:scene__)?energy/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-tail-write/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__tail-write--three/)
  assert.match(XIAOHEI_SCENE_CSS, /prefers-reduced-motion[\s\S]*xiaohei-scene__state-fx\s*\{ display: none; \}/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-tool-key/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-waiting-ring/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-complete-spark/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-error-glow/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-sidebar-current/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-sidebar-spirit-one/)
  assert.match(XIAOHEI_SCENE_CSS, /prefers-reduced-motion[\s\S]*xiaohei-scene__sidebar-spirit/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__heixiu-field/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-heixiu-open/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-heixiu-blink/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /heixiu--random|xiaohei-heixiu-drift-four/)
  assert.match(XIAOHEI_SCENE_CSS, /prefers-reduced-motion[\s\S]*xiaohei-scene__heixiu/)
  assert.match(XIAOHEI_SCENE_CSS, /max-width:\s*768px[\s\S]*heixiu--sidebar\s*\{ display: none; \}/)
  assert.match(XIAOHEI_SCENE_CSS, /conversation\.composer\.bar/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /xiaohei-mascot-breathe/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__mascot::before/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__mascot-idle-viewport/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__mascot-state[\s\S]*bottom:\s*0[\s\S]*transform:\s*translateX\(-50%\)/)
  assert.match(XIAOHEI_SCENE_CSS, /brightness\(1\.32\) contrast\(1\.02\)/)
  assert.match(XIAOHEI_SCENE_CSS, /drop-shadow\([^)]*83 218 193/)
  assert.match(XIAOHEI_SCENE_CSS, /transition:\s*opacity 120ms/)
  assert.match(installXiaoheiScene.toString(), /requestIdleCallback/)
  assert.match(installXiaoheiScene.toString(), /decoding = ['"]async['"]/)
  assert.match(installXiaoheiScene.toString(), /fetchPriority = ['"]low['"]/)
  assert.match(installXiaoheiScene.toString(), /createHeixiuField/)
  assert.match(installXiaoheiScene.toString(), /installHeixiuCompanions/)
  assert.match(XIAOHEI_SCENE_CSS, /pointer-events:\s*none/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__keyart/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__keyart--dawn/)
  assert.match(XIAOHEI_SCENE_CSS, /data-xiaohei-appearance='light'/)
  assert.match(XIAOHEI_SCENE_CSS, /brightness\(1\.16\) contrast\(1\.12\) saturate\(0\.78\)/)
  assert.match(XIAOHEI_SCENE_CSS, /data-slot='sidebar'/)
  assert.match(XIAOHEI_SCENE_CSS, /data-slot='sidebar\.workspaces'/)
  assert.match(XIAOHEI_SCENE_CSS, /role='tree'[\s\S]*class\*='_empty'/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /role='tree'[^\{]*:only-child/)
  assert.match(XIAOHEI_SCENE_CSS, /not\(\[class\*='_collapsed'\]\)/)
  assert.match(XIAOHEI_SCENE_CSS, /button:focus-visible/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /body\s*>\s*:not/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /backdrop-filter/)
  assert.match(XIAOHEI_SCENE_CSS, /prefers-reduced-transparency:\s*reduce/)
  assert.match(XIAOHEI_SCENE_CSS, /prefers-reduced-motion:\s*reduce/)
  assert.match(XIAOHEI_SCENE_CSS, /forced-colors:\s*active/)

  const keyframes = extractKeyframes(XIAOHEI_SCENE_CSS)
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

test('uses paired light and dark theme semantics and only DSH custom properties', () => {
  assert.equal(XIAOHEI_DAWN_THEME.colorScheme, 'light')
  assert.equal(XIAOHEI_NIGHT_THEME.colorScheme, 'dark')
  assert.deepEqual(Object.keys(XIAOHEI_DAWN_THEME.tokens), Object.keys(XIAOHEI_NIGHT_THEME.tokens))
  assert.ok(Object.keys(XIAOHEI_THEME_TOKEN_OVERRIDES).length >= 40)
  for (const [key, modes] of Object.entries(XIAOHEI_THEME_TOKEN_OVERRIDES)) {
    assert.match(key, /^--dsw-/)
    assert.equal(modes.light, XIAOHEI_DAWN_THEME.tokens[key])
    assert.equal(modes.dark, XIAOHEI_NIGHT_THEME.tokens[key])
  }
})

test('core light and dark opaque pairs meet WCAG AA contrast', () => {
  const pairs = []
  for (const [mode, tokens, background] of [
    ['dawn', XIAOHEI_DAWN_THEME.tokens, '#F4F7F3'],
    ['night', XIAOHEI_NIGHT_THEME.tokens, '#081014'],
  ]) {
    pairs.push(
      [`${mode} primary text`, tokens['--dsw-alias-label-primary'], background],
      [`${mode} secondary text`, tokens['--dsw-alias-label-secondary'], background],
      [`${mode} tertiary text`, tokens['--dsw-alias-label-tertiary'], background],
      [`${mode} caption text`, tokens['--dsw-alias-label-caption'], background],
      [`${mode} brand text`, tokens['--dsw-alias-brand-text'], background],
      [`${mode} primary button`, tokens['--dsw-alias-label-primary-foreground'], tokens['--dsw-alias-button-primary-fill']],
    )
  }

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

function themeSnapshot(colorScheme) {
  return {
    preference: 'system',
    active: { id: colorScheme, colorScheme, tokens: {} },
    themes: [],
    revision: 1,
  }
}

function extractKeyframes(css) {
  return [...css.matchAll(/@keyframes[^\{]+\{(?:[^{}]|\{[^{}]*\})*\}/g)]
    .map(match => match[0])
    .join('\n')
}

function luminance(hex) {
  assert.match(hex, /^#[0-9a-f]{6}$/i)
  const channels = [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
  const [red, green, blue] = channels.map(channel => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4)
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}
