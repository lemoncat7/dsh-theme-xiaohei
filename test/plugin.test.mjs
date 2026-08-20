import assert from 'node:assert/strict'
import test from 'node:test'
import {
  XIAOHEI_SCENE_CSS,
  XIAOHEI_SCENE_PART_COUNT,
  installXiaoheiScene,
  shouldRestoreXiaoheiHeixiuCompanions,
} from '../lib/scene.js'
import { apply } from '../lib/plugin.js'
import {
  bindXiaoheiAppearance,
  XIAOHEI_APPEARANCE_ATTRIBUTE,
} from '../lib/appearance.js'
import { installXiaoheiBlink, XIAOHEI_BLINK_STYLE_ID } from '../lib/blink.js'
import {
  installXiaoheiChrome,
  XIAOHEI_CHROME_CSS,
  XIAOHEI_CHROME_STYLE_ID,
} from '../lib/chrome.js'
import { XIAOHEI_CHROME_ACCESSIBILITY_CSS } from '../lib/chrome/accessibility.js'
import { XIAOHEI_COMPOSER_CSS } from '../lib/chrome/composer.js'
import { XIAOHEI_CONVERSATION_CSS } from '../lib/chrome/conversation.js'
import { XIAOHEI_FRAME_SYSTEM_CSS } from '../lib/chrome/frames.js'
import { XIAOHEI_OVERLAY_CSS } from '../lib/chrome/overlays.js'
import { XIAOHEI_SIDEBAR_CSS } from '../lib/chrome/sidebar.js'
import { XIAOHEI_WORKSPACE_CSS } from '../lib/chrome/workspace.js'
import { XIAOHEI_WORKSPACE_INTERACTION_CSS } from '../lib/chrome/workspace-interactions.js'
import { XIAOHEI_PORTAL_CSS } from '../lib/chrome/portal.js'
import { XIAOHEI_BLINK_CSS } from '../lib/chrome/blink.js'
import { XIAOHEI_GAZE_CSS } from '../lib/chrome/gaze.js'
import { XIAOHEI_REACTION_CSS } from '../lib/chrome/reactions.js'
import { XIAOHEI_CHROME_TOKENS_CSS } from '../lib/chrome/tokens.js'
import { XIAOHEI_HEIXIU_FEEDBACK_CSS } from '../lib/scene/heixiu-feedback.js'
import { XIAOHEI_HEIXIU_INTERACTION_CSS } from '../lib/scene/heixiu-interactions.js'
import { XIAOHEI_STATE_TRANSITION_CSS } from '../lib/scene/state-transitions.js'
import {
  installXiaoheiGaze,
  XIAOHEI_GAZE_STYLE_ID,
} from '../lib/gaze.js'
import {
  installXiaoheiHeixiuInteractions,
  XIAOHEI_HEIXIU_GREETING_EVENT,
} from '../lib/heixiu-interactions.js'
import {
  installXiaoheiIdleReactions,
  resolveXiaoheiPointerEar,
  resolveXiaoheiIdleTailDelay,
  XIAOHEI_REACTION_STYLE_ID,
} from '../lib/reactions.js'
import { installXiaoheiWorkspaceInteractions } from '../lib/workspace-interactions.js'
import {
  installXiaoheiPortalTransit,
  resolveXiaoheiPortalInteraction,
  XIAOHEI_PORTAL_ACTIVITY_EVENT,
  XIAOHEI_PORTAL_LAYER_ID,
  XIAOHEI_PORTAL_PROXIMITY_EVENT,
} from '../lib/portal.js'
import {
  XIAOHEI_COMPLETE,
  XIAOHEI_DAWN_KEY_ART,
  XIAOHEI_THINKING,
  XIAOHEI_ERROR,
  XIAOHEI_HEIXIU_BLINK,
  XIAOHEI_HEIXIU_OPEN,
  XIAOHEI_IDLE_EYE_BASE,
  XIAOHEI_IDLE_EAR_LEFT,
  XIAOHEI_IDLE_EAR_RIGHT,
  XIAOHEI_IDLE_BLINK,
  XIAOHEI_IDLE_SHEET,
  XIAOHEI_IDLE_TAIL,
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
    'xiaohei-theme: bind workspace spirit feedback',
    'xiaohei-theme: install moonlit forest scene',
    'xiaohei-theme: bind Heixiu companion interactions',
    'xiaohei-theme: install random Heixiu portal visits',
    'xiaohei-theme: install proximity gaze',
    'xiaohei-theme: synchronize complete-frame blinking',
    'xiaohei-theme: install sparse idle reactions',
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
  assert.match(XIAOHEI_CHROME_CSS, /--xiaohei-spirit:/)
  assert.match(XIAOHEI_CHROME_CSS, /data-slot='conversation\.composer'/)
  assert.doesNotMatch(XIAOHEI_CHROME_CSS, /(?:^|\n)\s*(?:html|body|#root)\s+button\s*\{/)
  const keyframes = extractKeyframes(XIAOHEI_CHROME_CSS)
  assert.doesNotMatch(keyframes, /\b(?:top|right|bottom|left|width|height|filter|background-position)\s*:/)
  assert.equal(typeof installXiaoheiChrome(undefined), 'function')
})

test('control skin composes isolated responsibility layers in a stable order', () => {
  assert.equal(XIAOHEI_CHROME_CSS, [
    XIAOHEI_CHROME_TOKENS_CSS,
    XIAOHEI_FRAME_SYSTEM_CSS,
    XIAOHEI_SIDEBAR_CSS,
    XIAOHEI_WORKSPACE_CSS,
    XIAOHEI_WORKSPACE_INTERACTION_CSS,
    XIAOHEI_CONVERSATION_CSS,
    XIAOHEI_COMPOSER_CSS,
    XIAOHEI_OVERLAY_CSS,
    XIAOHEI_CHROME_ACCESSIBILITY_CSS,
  ].join('\n'))
})

test('public Xiaohei frame contract supports future feature plugins', () => {
  assert.match(XIAOHEI_FRAME_SYSTEM_CSS, /data-xiaohei-frame='module'/)
  assert.match(XIAOHEI_FRAME_SYSTEM_CSS, /data-xiaohei-frame='compact'/)
  assert.match(XIAOHEI_FRAME_SYSTEM_CSS, /data-xiaohei-frame-label/)
  assert.match(XIAOHEI_FRAME_SYSTEM_CSS, /data-xiaohei-frame-ornament='spirit-knot'/)
  assert.match(XIAOHEI_FRAME_SYSTEM_CSS, /data-xiaohei-module-kind/)
  assert.match(XIAOHEI_FRAME_SYSTEM_CSS, /data-xiaohei-frame-header/)
  assert.match(XIAOHEI_FRAME_SYSTEM_CSS, /forced-colors:\s*active/)
})

test('workspace spirit feedback follows the pointer and releases only on folder activation', () => {
  assert.match(XIAOHEI_WORKSPACE_INTERACTION_CSS, /data-xiaohei-workspace-hover='true'/)
  assert.match(XIAOHEI_WORKSPACE_INTERACTION_CSS, /data-xiaohei-workspace-release='true'/)
  assert.match(XIAOHEI_WORKSPACE_INTERACTION_CSS, /xiaohei-workspace-spirit-release/)
  assert.match(XIAOHEI_WORKSPACE_INTERACTION_CSS, /prefers-reduced-motion:\s*reduce/)
  assert.match(XIAOHEI_WORKSPACE_INTERACTION_CSS, /forced-colors:\s*active/)
  const keyframes = extractKeyframes(XIAOHEI_WORKSPACE_INTERACTION_CSS)
  assert.doesNotMatch(keyframes, /\b(?:top|right|bottom|left|width|height|filter|background|background-position)\s*:/)

  const source = installXiaoheiWorkspaceInteractions.toString()
  assert.match(source, /pointermove/)
  assert.match(source, /requestAnimationFrame/)
  assert.match(source, /pointerType === ['"]touch['"]/)
  assert.match(source, /prefers-reduced-motion/)
  assert.match(source, /closest\(['"]button['"]\)/)
  assert.equal(typeof installXiaoheiWorkspaceInteractions(undefined), 'function')
})

test('workspace folders own the sidebar spirit framing without ambient fog', () => {
  assert.match(XIAOHEI_SIDEBAR_CSS, /data-slot='sidebar'/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /data-slot='sidebar\.workspaces'/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /role='treeitem'/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /aria-selected='true'/)
  assert.match(XIAOHEI_SIDEBAR_CSS, /prefers-reduced-transparency:\s*reduce/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /forced-colors:\s*active/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /role='treeitem'\]\[aria-expanded\]/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /--xiaohei-spirit/)
  assert.doesNotMatch(XIAOHEI_SIDEBAR_CSS, /not\(\[class\*='_collapsed'\]\)::before/)
  assert.doesNotMatch(XIAOHEI_SIDEBAR_CSS, /isolation:\s*isolate/)
  assert.doesNotMatch(`${XIAOHEI_SIDEBAR_CSS}\n${XIAOHEI_WORKSPACE_CSS}`, /@keyframes|animation:/)
})

test('workspace plaque stays inside the host clipping boundary', () => {
  assert.match(XIAOHEI_WORKSPACE_CSS, /padding:\s*22px 7px 7px/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /content:\s*'会馆 · 工作区'[\s\S]*top:\s*4px/)
  assert.doesNotMatch(XIAOHEI_WORKSPACE_CSS, /content:\s*'会馆 · 工作区'[\s\S]{0,240}top:\s*-/)
})

test('sidebar material preserves the host geometry of fixed overlays', () => {
  const sidebarShellRule = XIAOHEI_SIDEBAR_CSS.match(
    /#root \[data-slot='sidebar'\] > div \{([^}]*)\}/,
  )?.[1] ?? ''
  const dialogRule = XIAOHEI_OVERLAY_CSS.match(
    /#root \[role='dialog'\] \{([^}]*)\}/,
  )?.[1] ?? ''

  assert.notEqual(sidebarShellRule, '')
  assert.notEqual(dialogRule, '')
  assert.doesNotMatch(
    sidebarShellRule,
    /\b(?:backdrop-filter|filter|transform|perspective|contain)\s*:/,
  )
  assert.doesNotMatch(
    dialogRule,
    /(?:^|\n)\s*(?:position|inset|width|height|transform)\s*:/,
  )
})

test('collapsed sidebar keeps workspace tools on the rail axis', () => {
  assert.match(XIAOHEI_SIDEBAR_CSS, /div\[class\*='_collapsed'\] button/)
  assert.match(XIAOHEI_SIDEBAR_CSS, /width:\s*36px/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /div\[class\*='_collapsed'\][\s\S]*width:\s*35px/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /justify-content:\s*center/)
})

test('random Heixiu portal visits are compact, ambient, and compositor safe', () => {
  assert.match(XIAOHEI_PORTAL_LAYER_ID, /portal-layer$/)
  assert.match(XIAOHEI_PORTAL_ACTIVITY_EVENT, /portal-activity$/)
  assert.match(XIAOHEI_PORTAL_PROXIMITY_EVENT, /portal-proximity$/)
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

test('Heixiu only greets Xiaohei when the nearest portal phase is close', () => {
  const mascot = { left: 100, top: 100, width: 200, height: 200 }
  const nearEntry = resolveXiaoheiPortalInteraction(
    { x: 180, y: 190, angle: 0 },
    { x: 1000, y: 640, angle: 0 },
    mascot,
  )
  assert.equal(nearEntry?.phase, 'entry')
  assert.deepEqual(nearEntry?.target, { x: 180, y: 190 })
  assert.ok(nearEntry.delayMs > 0)

  const nearExit = resolveXiaoheiPortalInteraction(
    { x: 1000, y: 640, angle: 0 },
    { x: 160, y: 180, angle: 0 },
    mascot,
  )
  assert.equal(nearExit?.phase, 'exit')
  assert.deepEqual(nearExit?.target, { x: 160, y: 180 })
  assert.ok(nearExit.delayMs > nearEntry.delayMs)

  assert.equal(resolveXiaoheiPortalInteraction(
    { x: 800, y: 620, angle: 0 },
    { x: 1100, y: 720, angle: 0 },
    mascot,
  ), undefined)
})

test('fixed Heixiu companions answer the pointer without summoning Xiaohei', () => {
  assert.match(XIAOHEI_HEIXIU_GREETING_EVENT, /heixiu-greeting$/)
  assert.match(XIAOHEI_HEIXIU_INTERACTION_CSS, /data-xiaohei-heixiu-attention='true'/)
  assert.match(XIAOHEI_HEIXIU_INTERACTION_CSS, /data-xiaohei-heixiu-greeting='true'/)
  assert.match(XIAOHEI_HEIXIU_INTERACTION_CSS, /xiaohei-heixiu-greet-xiaohei/)
  assert.match(XIAOHEI_HEIXIU_INTERACTION_CSS, /prefers-reduced-motion:\s*reduce/)
  assert.match(XIAOHEI_HEIXIU_INTERACTION_CSS, /forced-colors:\s*active/)
  const keyframes = extractKeyframes(XIAOHEI_HEIXIU_INTERACTION_CSS)
  assert.doesNotMatch(keyframes, /\b(?:top|right|bottom|left|width|height|filter|background|background-position)\s*:/)

  const source = installXiaoheiHeixiuInteractions.toString()
  assert.match(source, /HEIXIU_ENTER_RADIUS_PX/)
  assert.match(source, /requestAnimationFrame/)
  assert.match(source, /pointerType === ['"]touch['"]/)
  assert.match(source, /INITIAL_GREETING_DELAY_MS/)
  assert.match(source, /XIAOHEI_HEIXIU_GREETING_EVENT/)
  assert.doesNotMatch(source, /DIRECT_GREETING_COOLDOWN_MS|lastDirectGreetingAt/)
  assert.doesNotMatch(
    source.match(/const applyPointerAttention[\s\S]*?const wake/)?.[0] ?? '',
    /playGreeting/,
  )
  assert.equal(typeof installXiaoheiHeixiuInteractions(undefined), 'function')
})

test('idle gaze is proximity-bound, portal-aware, and motion-safe', () => {
  assert.match(XIAOHEI_GAZE_STYLE_ID, /gaze-style$/)
  assert.match(XIAOHEI_GAZE_CSS, /xiaohei-gaze__pupil--left/)
  assert.match(XIAOHEI_GAZE_CSS, /xiaohei-gaze__pupil--right/)
  assert.match(XIAOHEI_GAZE_CSS, /xiaohei-gaze__eye--left/)
  assert.match(XIAOHEI_GAZE_CSS, /xiaohei-gaze__eye--right/)
  assert.match(XIAOHEI_GAZE_CSS, /xiaohei-gaze__eye[\s\S]*overflow:\s*hidden/)
  assert.match(XIAOHEI_GAZE_CSS, /data-xiaohei-state='idle'/)
  assert.doesNotMatch(XIAOHEI_GAZE_CSS, /blink-guard|visibility:\s*hidden/)
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

test('idle reactions are complete-frame, proximity-aware, state-safe, and independently owned', () => {
  assert.match(XIAOHEI_REACTION_STYLE_ID, /reaction-style$/)
  assert.match(XIAOHEI_REACTION_CSS, /xiaohei-scene__idle-reaction/)
  assert.match(XIAOHEI_REACTION_CSS, /data-xiaohei-reaction='ear-left'/)
  assert.match(XIAOHEI_REACTION_CSS, /data-xiaohei-reaction='ear-right'/)
  assert.match(XIAOHEI_REACTION_CSS, /data-xiaohei-reaction='tail-slow'/)
  assert.match(XIAOHEI_REACTION_CSS, /data-xiaohei-reaction='tail-complete'/)
  assert.match(XIAOHEI_REACTION_CSS, /data-xiaohei-reaction[\s\S]*xiaohei-gaze__base[\s\S]*opacity:\s*0/)
  assert.match(XIAOHEI_REACTION_CSS, /mascot-blink[\s\S]*z-index:\s*4/)
  assert.match(XIAOHEI_REACTION_CSS, /560ms steps\(8, end\)/)
  assert.match(XIAOHEI_REACTION_CSS, /data-xiaohei-ear-loop='true'[\s\S]*animation-iteration-count:\s*infinite/)
  assert.doesNotMatch(XIAOHEI_REACTION_CSS, /xiaohei-heixiu-greeting-blink/)
  assert.match(XIAOHEI_REACTION_CSS, /steps\(9, end\)/)
  assert.match(XIAOHEI_REACTION_CSS, /data-xiaohei-state='idle'/)
  assert.match(XIAOHEI_REACTION_CSS, /prefers-reduced-motion:\s*reduce/)
  assert.match(XIAOHEI_REACTION_CSS, /hover:\s*none[\s\S]*pointer:\s*coarse/)
  assert.doesNotMatch(XIAOHEI_REACTION_CSS, /scale\(|rotate\(/)
  const keyframes = extractKeyframes(XIAOHEI_REACTION_CSS)
  assert.doesNotMatch(keyframes, /\b(?:top|right|bottom|left|width|height|filter|background-position)\s*:/)
  assert.doesNotMatch(XIAOHEI_REACTION_CSS, /greeting-gaze-guard|visibility:\s*hidden/)

  const source = installXiaoheiIdleReactions.toString()
  assert.equal(resolveXiaoheiIdleTailDelay(0), 12_000)
  assert.equal(resolveXiaoheiIdleTailDelay(0.5), 18_000)
  assert.equal(resolveXiaoheiIdleTailDelay(1), 24_000)
  assert.match(source, /XIAOHEI_PORTAL_PROXIMITY_EVENT/)
  assert.match(source, /visibilitychange/)
  assert.match(source, /previousState === ['"]complete['"]/u)
  assert.match(source, /syncPointerEarLoop/)
  assert.match(source, /xiaoheiEarLoop/)
  assert.match(source, /LEFT_EAR_CENTER_X/)
  assert.match(source, /RIGHT_EAR_CENTER_X/)
  assert.match(source, /resolveXiaoheiPointerEar/)
  assert.doesNotMatch(source, /cooldown/i)
  assert.doesNotMatch(source, /requestAnimationFrame/)
  assert.equal(typeof installXiaoheiIdleReactions(undefined), 'function')

  const bounds = { left: 0, top: 0, width: 256, height: 256 }
  assert.equal(resolveXiaoheiPointerEar(bounds, { x: 84, y: 62 }), 'ear-left')
  assert.equal(resolveXiaoheiPointerEar(bounds, { x: 166, y: 82 }), 'ear-right')
  assert.equal(resolveXiaoheiPointerEar(bounds, { x: 125, y: 72 }), undefined)
  assert.equal(resolveXiaoheiPointerEar(bounds, { x: 84, y: 108 }), undefined)
  assert.equal(resolveXiaoheiPointerEar(bounds, { x: 84, y: 108 }, 'ear-left'), 'ear-left')
})

test('blinking atomically swaps live eyes for the complete closed frame', () => {
  assert.match(XIAOHEI_BLINK_STYLE_ID, /blink-style$/)
  assert.match(XIAOHEI_BLINK_CSS, /data-xiaohei-blink='closed'[\s\S]*mascot-blink[\s\S]*opacity:\s*1/)
  assert.match(XIAOHEI_BLINK_CSS, /data-xiaohei-blink='closed'[\s\S]*xiaohei-gaze__eye[\s\S]*visibility:\s*hidden/)
  assert.doesNotMatch(XIAOHEI_BLINK_CSS, /@keyframes|animation-duration/)
  const source = installXiaoheiBlink.toString()
  assert.match(source, /XIAOHEI_HEIXIU_GREETING_EVENT/)
  assert.match(source, /INITIAL_BLINK_DELAY_MS/)
  assert.match(source, /HEIXIU_GREETING_BLINK_STEPS/)
  assert.match(source, /prefers-reduced-motion:\s*reduce/)
  assert.match(source, /visibilitychange/)
  assert.doesNotMatch(source, /requestAnimationFrame/)
  assert.equal(typeof installXiaoheiBlink(undefined), 'function')
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
  assert.match(XIAOHEI_IDLE_BLINK, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_IDLE_EYE_BASE, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_IDLE_EAR_LEFT, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_IDLE_EAR_RIGHT, /^data:image\/webp;base64,/)
  assert.match(XIAOHEI_IDLE_TAIL, /^data:image\/webp;base64,/)
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
  assert.match(installXiaoheiScene.toString(), /createIdleBlink/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /@keyframes xiaohei-mascot-blink/)
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
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__heixiu-body/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-heixiu-open/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-heixiu-blink/)
  assert.match(XIAOHEI_HEIXIU_FEEDBACK_CSS, /data-xiaohei-state='thinking'/)
  assert.match(XIAOHEI_HEIXIU_FEEDBACK_CSS, /data-xiaohei-state='complete'/)
  assert.match(XIAOHEI_HEIXIU_FEEDBACK_CSS, /data-xiaohei-state='error'/)
  assert.match(XIAOHEI_HEIXIU_FEEDBACK_CSS, /prefers-reduced-motion:\s*reduce/)
  assert.match(XIAOHEI_SCENE_CSS, /data-xiaohei-heixiu-attention='true'/)
  assert.match(XIAOHEI_SCENE_CSS, /data-xiaohei-heixiu-greeting='true'/)
  assert.doesNotMatch(XIAOHEI_HEIXIU_FEEDBACK_CSS, /scale\(|rotate\(/)
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
  assert.match(XIAOHEI_STATE_TRANSITION_CSS, /transition-duration:\s*220ms/)
  assert.match(XIAOHEI_STATE_TRANSITION_CSS, /transition-delay:\s*70ms/)
  assert.doesNotMatch(XIAOHEI_STATE_TRANSITION_CSS, /transform|scale|translate|requestAnimationFrame|setTimeout/)
  assert.match(installXiaoheiScene.toString(), /requestIdleCallback/)
  assert.match(installXiaoheiScene.toString(), /decoding = ['"]async['"]/)
  assert.match(installXiaoheiScene.toString(), /fetchPriority = ['"]low['"]/)
  assert.match(installXiaoheiScene.toString(), /createHeixiuField/)
  assert.match(installXiaoheiScene.toString(), /installHeixiuCompanions/)
  assert.equal(shouldRestoreXiaoheiHeixiuCompanions([{ isConnected: true }, { isConnected: true }]), false)
  assert.equal(shouldRestoreXiaoheiHeixiuCompanions([{ isConnected: true }, { isConnected: false }]), true)
  assert.match(XIAOHEI_SCENE_CSS, /update:\s*slow/)
  assert.match(XIAOHEI_SCENE_CSS, /pointer-events:\s*none/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__keyart/)
  assert.match(XIAOHEI_SCENE_CSS, /xiaohei-scene__keyart--dawn/)
  assert.match(XIAOHEI_SCENE_CSS, /data-xiaohei-appearance='light'/)
  assert.match(XIAOHEI_SCENE_CSS, /brightness\(1\.16\) contrast\(1\.12\) saturate\(0\.78\)/)
  assert.match(XIAOHEI_SCENE_CSS, /data-slot='sidebar'/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /data-slot='sidebar\.workspaces'/)
  assert.match(XIAOHEI_WORKSPACE_CSS, /role='tree'[\s\S]*class\*='_empty'/)
  assert.doesNotMatch(XIAOHEI_WORKSPACE_CSS, /role='tree'[^\{]*:only-child/)
  assert.match(XIAOHEI_SIDEBAR_CSS, /not\(\[class\*='_collapsed'\]\)/)
  assert.match(XIAOHEI_SIDEBAR_CSS, /button:focus-visible/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /body\s*>\s*:not/)
  assert.doesNotMatch(XIAOHEI_SCENE_CSS, /backdrop-filter/)
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
