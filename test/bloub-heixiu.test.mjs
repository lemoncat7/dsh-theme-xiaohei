import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { BotEngine } from '../lib/vendor/bloub/engine.js'
import { liveliness } from '../lib/vendor/bloub/face.js'
import { createHeixiuRenderer, heixiuEyeRadii, heixiuEyeSeparation } from '../lib/bloub-heixiu/renderer.js'
import { resolveHeixiuDock, resolveHeixiuWelcome } from '../lib/bloub-heixiu/layout.js'
import { heixiuAmbientDelay, heixiuAmbientIndex } from '../lib/bloub-heixiu/ambient.js'
import { createHeixiuFlight } from '../lib/bloub-heixiu/flight.js'
import { resolveHeixiuFollow, resolveHeixiuGaze } from '../lib/bloub-heixiu/follow.js'
import { installComposerBloub, HEIXIU_BLOUB_ACTIONS, HEIXIU_AMBIENT_ACTIONS } from '../lib/bloub-heixiu/runtime.js'
import { bindHeixiuSessions, createHeixiuSignals } from '../lib/bloub-heixiu/signals.js'
import { HEIXIU_FACE, HEIXIU_FOOT, HEIXIU_PROFILE, HEIXIU_REACTIONS, HeixiuReactions } from '../lib/bloub-heixiu/character.js'

// Captured from the unmodified upstream engine at the revision in THIRD_PARTY_NOTICES.
const bodies = {
  idle: '153076706190692fe1024d0ae024ba14a5e49fc1a279f4cc51d31d18e712c0c8',
  wink: '153076706190692fe1024d0ae024ba14a5e49fc1a279f4cc51d31d18e712c0c8',
  egg: '55e771299cf1b5adc56d3ceceff2cffa1398b98706998a9a0c57df4298b31403',
  hexagon: '66cbd2f024ffa196572149f17e26c4cc0632d1b5e7a0ec175a687579a282ed90',
  orbit: '73af346022623b1f595f020cd99055c6f0bbdf545e731b65281c2abc2889bd98',
  burst: '06ae89aa3a46177e2bb8ffea423d4548cc8527c76ccecd59134360e3d78ec42d',
}
test('Heixiu retains the exact authored bloub silhouettes and motion', () => {
  for (const [state, expected] of Object.entries(bodies)) {
    const engine = new BotEngine(100, state)
    const paths = [0,.3,.8,1.7,2.5].map(t => engine.sample(t).bodyPath).join('\n')
    assert.equal(createHash('sha256').update(paths).digest('hex'), expected, state)
  }
})
test('rapid interruptions preserve the visible body and long sessions still blink', () => {
  const engine = new BotEngine()
  for (let i = 0; i < 40; i++) {
    const t = i * .08, before = engine.sample(t).bodyPath
    engine.setState(Object.keys(bodies)[i % 6], t)
    assert.equal(engine.sample(t).bodyPath, before)
    assert.doesNotMatch(JSON.stringify(engine.sample(t + .01)), /NaN|Infinity/)
  }
  for (let t = 0; t < 20; t += .1) assert.ok(Math.abs(liveliness(t).lid - liveliness(t + 900).lid) < 1e-8)
})

function fixture() {
  let serial = 0, reads = 0, now = 0, mutation
  const frames = new Map(), timers = new Map(), listeners = new Map(), nodes = []
  const listen = (type, fn) => listeners.set(type, fn), unlisten = type => listeners.delete(type)
  const element = (name = 'div') => {
    const attributes = new Map()
    const node = { name, dataset: {}, children: [], parentNode: null, isConnected: true,
      style: { setProperty: (key, value) => attributes.set(key, String(value)), getPropertyValue: key => attributes.get(key) },
      get parentElement() { return this.parentNode },
      get lastElementChild() { return this.children.at(-1) ?? null },
      getAttribute: key => attributes.get(key), setAttribute: (key, value) => attributes.set(key, String(value)),
      removeAttribute: key => attributes.delete(key), addEventListener: listen, removeEventListener: unlisten,
      append(...children) { for (const child of children) { child.remove(); child.parentNode = this; this.children.push(child) } },
      insertBefore(child, reference) { child.remove(); child.parentNode = this; const i = this.children.indexOf(reference); this.children.splice(i < 0 ? this.children.length : i, 0, child) },
      remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(n => n !== this); this.parentNode = null },
      getBoundingClientRect() { reads++; return { left: 400, right: 496, top: 700, bottom: 796, width: 96, height: 96 } },
    }
    nodes.push(node); return node
  }
  const composer = element(), sidebar = element(), media = { matches: false, addEventListener: listen, removeEventListener: unlisten }
  const input = element(), toolbar = element(); composer.append(input, toolbar)
  composer.getBoundingClientRect = () => { reads++; return { left: 600, right: 1500, top: 700, bottom: 800, width: 900, height: 100 } }
  sidebar.getBoundingClientRect = () => { reads++; return { right: 280 } }
  const doc = { head: element(), body: element(), hidden: false,
    createElement: element, createElementNS: (_, name) => element(name),
    querySelector: selector => selector.includes('brand-context') ? null : selector.includes('sidebar') ? sidebar : composer,
    addEventListener: listen, removeEventListener: unlisten,
    defaultView: { innerWidth: 1920, innerHeight: 900, matchMedia: () => media,
      MutationObserver: class { constructor(fn) { mutation = fn } observe() {} disconnect() {} },
      ResizeObserver: class { observe() {} disconnect() {} },
      requestAnimationFrame(fn) { frames.set(++serial, fn); return serial }, cancelAnimationFrame: id => frames.delete(id),
      setTimeout(fn) { timers.set(++serial, fn); return serial }, clearTimeout: id => timers.delete(id),
      addEventListener: listen, removeEventListener: unlisten,
    },
  }
  function step() { now += 16; for (const [id, fn] of [...frames]) { frames.delete(id); fn(now) } }
  return { doc, composer, toolbar, input, nodes, frames, timers, listeners, step, mutate: () => mutation(), reads: () => reads }
}
test('renderer uses persistent hollow eyes and bounded SVG nodes', () => {
  const f = fixture(), renderer = createHeixiuRenderer(f.doc), count = f.nodes.length, engine = new BotEngine()
  for (let i = 0; i < 100; i++) {
    if (i % 5 === 0) engine.setState(Object.keys(bodies)[(i / 5) % 6], i / 60)
    renderer.render(engine.sample(i / 60))
  }
  assert.equal(f.nodes.length, count)
  const eyes = f.nodes.filter(n => n.getAttribute('data-heixiu-eye') !== undefined)
  assert.equal(eyes.length, 2)
  assert.equal(eyes[0].parentNode.getAttribute('fill'), 'none')
  assert.match(eyes[0].parentNode.getAttribute('clip-path'), /^url\(#xiaohei-bloub-/)
  assert.match(eyes[0].getAttribute('d'), /^M/)
  assert.match(eyes[0].getAttribute('transform'), /^matrix/)
})
test('Heixiu rests gently wide with rounded eyes and a body-derived squash pivot', () => {
  assert.equal(HEIXIU_PROFILE.length, 64)
  const points = HEIXIU_PROFILE.map((r, i) => ({ x: r * Math.cos(i * Math.PI / 32), y: r * Math.sin(i * Math.PI / 32) }))
  const aspect = (Math.max(...points.map(p => p.x)) - Math.min(...points.map(p => p.x))) / (Math.max(...points.map(p => p.y)) - Math.min(...points.map(p => p.y)))
  assert.ok(aspect > 1.16 && aspect < 1.24, `rest aspect ${aspect}`)
  assert.ok(Math.abs(HEIXIU_FOOT - Math.max(...points.map(p => p.y)) * 100) < 1e-8)
  for (const eye of HEIXIU_FACE.eyes) {
    const { rx, ry } = heixiuEyeRadii(eye.w * 100, eye.h * 100)
    const apparentAspect = ry / (rx * Math.cos(HEIXIU_FACE.split * Math.PI / 180))
    assert.ok(apparentAspect > 1.15 && apparentAspect < 1.35, `eye aspect ${apparentAspect}`)
  }
  const engine = new BotEngine(100, 'idle', HEIXIU_PROFILE, HEIXIU_FACE)
  const f = fixture(), renderer = createHeixiuRenderer(f.doc)
  const reactions = new HeixiuReactions(); reactions.play('greet', 0)
  renderer.render(engine.sample(.16), reactions.sample(.16))
  const eye = f.nodes.find(n => n.getAttribute('data-heixiu-eye') !== undefined)
  assert.ok(Number(eye.getAttribute('opacity')) > .99)
  assert.match(eye.parentNode.getAttribute('stroke'), /^#/)
  assert.equal(eye.parentNode.getAttribute('stroke-width'), '10.5')
  assert.equal(reactions.sample(.16).lid, 0)
  assert.ok(f.nodes.length < 20, 'no unused orbit/particle pool')
})
test('gestures have distinct anticipation, settle fully, and preserve interrupted poses', () => {
  const reaction = new HeixiuReactions()
  for (let i = 0; i < 60; i++) {
    const t = i * .09, before = reaction.sample(t)
    reaction.play(HEIXIU_REACTIONS[i % 3], t)
    assert.deepEqual(reaction.sample(t), before)
    for (const n of Object.values(reaction.sample(t + .02))) assert.ok(Number.isFinite(n))
  }
  for (const kind of HEIXIU_REACTIONS) {
    reaction.play(kind, 10)
    assert.equal(reaction.sample(12).lid, 1)
    assert.equal(reaction.sample(12).y, 0)
    assert.equal(reaction.sample(12).sy, 1)
  }
  reaction.play('greet', 20); assert.ok(Math.abs(reaction.sample(20.16).lid) < 1e-10)
  reaction.play('hop', 22); assert.ok(reaction.sample(22.12).lid > .8)
  reaction.play('wiggle', 24); assert.equal(reaction.sample(24.18).lid, 1)
})
test('motion stays round and bounded, and intermediate jump keys do not stop the arc', () => {
  const reaction = new HeixiuReactions()
  for (const kind of HEIXIU_REACTIONS) {
    reaction.play(kind, 0)
    for (let t = 0; t < 1.2; t += 1 / 240) {
      const p = reaction.sample(t)
      assert.ok(p.sx / p.sy < 1.14)
      assert.ok(p.lid >= -1e-10 && p.lid <= 1 + 1e-10)
      assert.ok(p.y >= -28.001 && p.y <= .001)
      assert.ok(Math.abs(p.sx * p.sy - 1) < .03, 'retain volume')
    }
  }
  reaction.play('hop', 0)
  const h = .0001, a = reaction.sample(.23 - h), b = reaction.sample(.23), c = reaction.sample(.23 + h)
  const v0 = (b.y - a.y) / h, v1 = (c.y - b.y) / h
  assert.ok(v0 < -30 && v1 < -30, 'rising arc must keep moving through .23s')
  assert.ok(Math.abs(v0 - v1) < 1, 'velocity must be continuous at the key')
})
test('special effects allocate once on interaction, render layers, and fully disappear at rest', () => {
  const f = fixture(), renderer = createHeixiuRenderer(f.doc), baseline = f.nodes.length
  const engine = new BotEngine(100, 'idle', HEIXIU_PROFILE, HEIXIU_FACE)
  renderer.prepareEffects(); const count = f.nodes.length
  renderer.prepareEffects(); assert.equal(f.nodes.length, count)
  assert.ok(count > baseline && count < 120)
  for (let i = 0; i < 100; i++) {
    const t = i * .09
    engine.setState(HEIXIU_BLOUB_ACTIONS[i % HEIXIU_BLOUB_ACTIONS.length], t)
    renderer.render(engine.sample(t + .04))
    assert.equal(f.nodes.length, count, 'frame loop must not allocate nodes')
  }
  engine.reset('burst', 20); renderer.render(engine.sample(20.45))
  assert.ok(f.nodes.some(n => n.getAttribute('data-heixiu-particle') !== undefined && n.getAttribute('display') === 'inline'))
  engine.reset('orbit', 22); renderer.render(engine.sample(23.2))
  assert.ok(f.nodes.some(n => n.getAttribute('data-heixiu-orbit') !== undefined && n.getAttribute('display') === 'inline'))
  engine.setState('idle', 26); renderer.render(engine.sample(28))
  for (const n of f.nodes.filter(n => n.getAttribute('data-heixiu-particle') !== undefined || n.getAttribute('data-heixiu-orbit') !== undefined)) assert.equal(n.getAttribute('display'), 'none')
})
test('double click cycles original actions, keyboard works, and no timers queue', () => {
  const f = fixture(), dispose = installComposerBloub(f.doc)
  f.step()
  const bot = f.composer.children[1], event = detail => ({ detail, stopPropagation() {} })
  f.listeners.get('click')(event(1)); assert.equal(bot.dataset.action, 'greet')
  f.step()
  f.listeners.get('click')(event(2)); assert.equal(bot.dataset.action, 'greet')
  for (const state of HEIXIU_BLOUB_ACTIONS) {
    const old = bot.dataset.action
    if (old !== 'greet') {
      f.listeners.get('click')(event(1)); assert.equal(bot.dataset.action, old, 'no idle flash between special actions')
    }
    f.listeners.get('dblclick')(event(2)); assert.equal(bot.dataset.action, state)
    f.step()
  }
  assert.equal(f.timers.size, 1, 'one ambient timer, no click queue')
  f.listeners.get('click')(event(0)); assert.equal(bot.dataset.action, 'hop', 'keyboard activation remains available')
  let prevented = false
  f.listeners.get('keydown')({ key: 'Enter', shiftKey: true, repeat: false, preventDefault() { prevented = true }, stopPropagation() {} })
  assert.ok(prevented); assert.equal(bot.dataset.action, 'burst')
  for (let i = 0; i < 250; i++) f.step()
  assert.equal(bot.dataset.action, 'idle')
  assert.equal(f.composer.lastElementChild, f.toolbar)
  dispose()
})
test('starting an upstream action gently settles rather than resets the gesture', () => {
  const reaction = new HeixiuReactions()
  reaction.play('hop', 0); reaction.aim(.7, .1)
  const before = reaction.sample(.23); reaction.settle(.23)
  assert.deepEqual(reaction.sample(.23), before)
  assert.deepEqual(reaction.sample(1), { x: 0, y: 0, sx: 1, sy: 1, roll: 0, lid: 1, cheer: 0 })
})
test('notification badge has a transparent notch and continuous entry/exit', () => {
  const f = fixture(), renderer = createHeixiuRenderer(f.doc)
  const engine = new BotEngine(100, 'idle', HEIXIU_PROFILE, HEIXIU_FACE)
  renderer.prepareEffects()
  const count = f.nodes.length
  engine.setState('notify', 0)
  let previous = 0
  for (let t = 0; t < .8; t += 1 / 120) {
    const frame = engine.sample(t); renderer.render(frame)
    const radius = frame.notif?.r ?? 0
    assert.ok(Math.abs(radius - previous) < 1.5, 'no badge midpoint pop')
    previous = radius
  }
  const badge = f.nodes.find(n => n.getAttribute('data-heixiu-notification') !== undefined)
  const notch = f.nodes.find(n => n.getAttribute('data-heixiu-notch') !== undefined)
  const body = f.nodes.find(n => n.getAttribute('data-heixiu-body') !== undefined).parentNode
  assert.equal(badge.getAttribute('display'), 'inline')
  assert.ok(Number(notch.getAttribute('r')) > Number(badge.getAttribute('r')))
  assert.match(body.getAttribute('mask'), /^url\(#/)
  engine.setState('idle', .8)
  for (let t = .8; t < 1.5; t += 1 / 120) {
    const frame = engine.sample(t); renderer.render(frame)
    const radius = frame.notif?.r ?? 0
    assert.ok(Math.abs(radius - previous) < 1.5)
    previous = radius
  }
  assert.equal(badge.getAttribute('display'), 'none')
  assert.equal(body.getAttribute('mask'), undefined)
  assert.equal(f.nodes.length, count)
})
test('hollow special eyes remain separated without shrinking the accepted resting eyes', () => {
  const resting = new BotEngine(100, 'idle', HEIXIU_PROFILE, HEIXIU_FACE).sample(.8)
  assert.equal(heixiuEyeSeparation(resting.eyes), 1)
  for (const state of ['wink', 'wide', 'notify']) {
    const engine = new BotEngine(100, state, HEIXIU_PROFILE, HEIXIU_FACE)
    for (let t = 0; t < 2; t += .03) {
      const eyes = engine.sample(t).eyes, scale = heixiuEyeSeparation(eyes)
      assert.ok(Number.isFinite(scale) && scale > .4 && scale <= 1)
      for (const eye of eyes) {
        const r = heixiuEyeRadii(eye.width, eye.height)
        assert.ok(r.rx <= 44 && r.ry <= 60)
      }
    }
  }
})
function observable(initial) {
  let value = initial
  const listeners = new Set()
  return { listeners, getSnapshot: () => value,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) },
    set(next) { value = next; for (const fn of listeners) fn() },
  }
}
test('official adapter ignores history/reconnect, deduplicates streams and isolates selection', () => {
  const initial = { sessionId: 'a', openState: 'open', removed: false, running: false, lastAgentError: null, promptError: null }
  const a = observable(initial), b = observable({ ...initial, sessionId: 'b', lastAgentError: 'old error' })
  const list = observable({ current: 'a' }), signals = createHeixiuSignals()
  const dispose = bindHeixiuSessions({ list, binding: id => ({ session: id === 'a' ? a : b }) }, signals)
  assert.equal(signals.getSnapshot().notice, null)
  a.set({ ...initial, running: true }); assert.equal(signals.getSnapshot().running, true)
  const revision = signals.getSnapshot().revision
  for (let i = 0; i < 200; i++) a.set({ ...initial, running: true })
  assert.equal(signals.getSnapshot().revision, revision)
  a.set(initial); assert.equal(signals.getSnapshot().notice, 'notify')
  list.set({ current: 'b' }); assert.equal(signals.getSnapshot().notice, null)
  assert.equal(a.listeners.size, 0); assert.equal(b.listeners.size, 1)
  list.set({ current: 'a' }); assert.equal(signals.getSnapshot().notice, null)
  a.set({ ...initial, running: true })
  a.set({ ...initial, running: true, openState: 'loading' })
  a.set(initial); assert.equal(signals.getSnapshot().notice, null, 'reconnect is not completion')
  a.set({ ...initial, lastAgentError: 'new error' }); assert.equal(signals.getSnapshot().notice, 'alert')
  list.set({ current: undefined }); assert.equal(signals.getSnapshot().sessionId, undefined)
  dispose(); assert.equal(list.listeners.size + a.listeners.size + b.listeners.size, 0)
})
test('session thinking holds, completion settles, reduced motion and hidden state do not replay notices', () => {
  const f = fixture(), signals = createHeixiuSignals(), dispose = installComposerBloub(f.doc, signals)
  f.step(); const bot = f.composer.children[1]
  signals.publish({ sessionId: 'a', running: true, notice: null })
  assert.equal(bot.dataset.action, 'thinking')
  for (let i = 0; i < 300; i++) f.step()
  assert.equal(bot.dataset.action, 'thinking')
  signals.publish({ sessionId: 'a', running: false, notice: 'notify' })
  assert.equal(bot.dataset.action, 'notify')
  for (let i = 0; i < 400; i++) f.step()
  assert.equal(bot.dataset.action, 'idle'); assert.equal(f.frames.size, 0, 'no endless idle RAF after held action')
  signals.publish({ sessionId: 'a', running: true, notice: null })
  signals.publish({ sessionId: 'b', running: false, notice: null })
  assert.equal(bot.dataset.action, 'idle', 'switch never celebrates')
  f.doc.hidden = true; f.listeners.get('visibilitychange')()
  signals.publish({ sessionId: 'b', running: false, notice: 'notify' })
  f.doc.hidden = false; f.listeners.get('visibilitychange')()
  assert.equal(bot.dataset.action, 'idle')
  const media = f.doc.defaultView.matchMedia()
  signals.publish({ sessionId: 'b', running: true, notice: null })
  media.matches = true; f.listeners.get('change')()
  assert.equal(bot.dataset.action, 'idle'); assert.equal(f.frames.size, 0)
  media.matches = false; f.listeners.get('change')()
  assert.equal(bot.dataset.action, 'thinking')
  dispose(); signals.publish({ running: false, notice: 'alert' })
  assert.equal(f.frames.size + f.timers.size, 0)
})
test('runtime does not measure on animation/stream updates; pauses and fully disposes', async () => {
  const f = fixture(), dispose = installComposerBloub(f.doc)
  f.step(); const reads = f.reads()
  assert.equal(f.composer.lastElementChild, f.toolbar, 'native send toolbar must remain last')
  assert.equal(f.composer.children[0], f.input, 'native input must remain first')
  for (let i = 0; i < 400; i++) f.step()
  assert.equal(f.reads(), reads)
  assert.equal(f.frames.size, 0); assert.equal(f.timers.size, 2, 'life wake and one ambient timer')
  f.mutate(); await Promise.resolve(); f.step()
  assert.equal(f.reads(), reads)
  f.doc.hidden = true; f.listeners.get('visibilitychange')()
  assert.equal(f.frames.size, 0); assert.equal(f.timers.size, 0)
  f.doc.hidden = false; f.listeners.get('visibilitychange')(); f.step()
  assert.ok(f.frames.size > 0)
  dispose(); dispose()
  assert.equal(f.frames.size, 0); assert.equal(f.timers.size, 0); assert.equal(f.listeners.size, 0)
  assert.deepEqual(f.composer.children, [f.input, f.toolbar]); assert.equal(f.doc.head.children.length, 0)
})
test('dock reserves narrow-screen space and install is SSR safe', () => {
  assert.equal(resolveHeixiuDock(600, 280, 1920).mode, 'outside')
  assert.equal(resolveHeixiuDock(300, 280, 1024).mode, 'compact')
  assert.equal(resolveHeixiuDock(200, 55, 390).mode, 'compact')
  installComposerBloub(undefined)()
})
test('welcome dock sits above the composer and to the left of the hero', () => {
  const dock = resolveHeixiuWelcome({ left: 680, top: 320, width: 38, height: 38 }, { left: 460, top: 420 }, 280, 1440)
  assert.equal(dock.left + 460 + dock.size, 656)
  assert.ok(dock.top + 420 + dock.size < 420)
  assert.equal(resolveHeixiuWelcome({ left: 0, top: 0, width: 0, height: 0 }, { left: 460, top: 420 }, 280, 1440), undefined)
})
test('ambient actions use bounded random intervals and avoid immediate repeats', () => {
  for(let i = 0; i <= 100; i++) {
    const random = () => i / 100
    assert.ok(heixiuAmbientDelay(random) >= 20000 && heixiuAmbientDelay(random) < 40000)
    for(let previous = 0; previous < 4; previous++) {
      const n = heixiuAmbientIndex(4, previous, random)
      assert.ok(n >= 0 && n < 4); assert.notEqual(n, previous)
    }
  }
  const f = fixture(), dispose = installComposerBloub(f.doc); f.step()
  const bot = f.composer.children[1], [id, callback] = [...f.timers][0]
  f.timers.delete(id); callback()
  assert.equal(bot.dataset.actionSource, 'ambient')
  assert.ok(HEIXIU_AMBIENT_ACTIONS.includes(bot.dataset.action))
  for (const state of ['thinking', 'notify', 'alert', 'exclaim']) assert.ok(!HEIXIU_AMBIENT_ACTIONS.includes(state))
  assert.equal(f.timers.size, 1)
  f.doc.hidden = true; f.listeners.get('visibilitychange')(); assert.equal(f.timers.size, 0)
  dispose()
})
test('dock flight keeps equal targets, retargets from viewport coordinates and honors reduced motion', () => {
  const calls = [], button = { dataset: {}, isConnected: true,
    getBoundingClientRect: () => ({ left: 300, top: 350, width: 96, height: 96 }),
    animate(keys, options) { const a = { playState: 'running', onfinish: null, currentTime: 200,
      effect: { getComputedTiming: () => ({ progress: .125 }) },
      cancel() { this.playState = 'idle' } }; calls.push({ keys, options, a }); return a },
  }
  const flight = createHeixiuFlight(button)
  const from = { left: 500, top: 300, width: 96, height: 96 }, to = { left: 300, top: 700, width: 96, height: 96 }
  flight.move(from, to, false); assert.ok(flight.active)
  assert.match(calls[0].keys[0].transform, /200px, -400px/)
  assert.equal(flight.capture(to).top, 350); assert.equal(calls[0].a.playState, 'running')
  for(let i=0;i<100;i++)flight.move(flight.capture(to),to,false)
  assert.equal(calls.length,1,'scroll/ResizeObserver must not restart equal target')
  const moved = flight.target({left:475,top:400,width:96,height:96})
  assert.deepEqual(moved,{left:300,top:750,width:96,height:96})
  flight.move(flight.capture(to),moved,false)
  assert.match(calls[1].keys[0].transform,/175px, -400px/)
  assert.equal(calls[1].options.duration,750,'retarget must not reset the full duration')
  assert.equal(calls[0].a.playState,'idle')
  flight.move(from, to, true); assert.equal(calls.length, 2)
  flight.move(from, to, false); calls[2].a.onfinish(); assert.equal(button.dataset.flying, 'false')
  // DOMRect coordinates live on prototype getters, not enumerable properties.
  const domRect = Object.create(Object.fromEntries(Object.entries(from).map(([k,v])=>[k,v])))
  flight.move(domRect,to,false);assert.equal(flight.capture().top,350)
  flight.cancel()
})
test('looking upwards is clearly above neutral and has finite bounded projection', () => {
  const up=resolveHeixiuGaze(0,-600),rest=resolveHeixiuGaze(0,0)
  assert.equal(up.pitch,24);assert.equal(rest.pitch,-7)
  const project=look=>{const e=new BotEngine(100,'idle',HEIXIU_PROFILE,HEIXIU_FACE);e.setLook(look,0,.001);return e.sample(1).eyes.map(eye=>Number(eye.openMatrix.slice(7,-1).split(',')[5]))}
  const a=project(up),b=project(rest)
  assert.ok(a.every((y,i)=>y < b[i]-25),'eyes must visibly rise, not only change a parameter')
  for(let y=-1000;y<=1000;y+=10){const look=resolveHeixiuGaze(200,y);assert.ok(look.pitch>=-16&&look.pitch<=24)}
  assert.equal(resolveHeixiuGaze(NaN,0).pitch,-7)
})
test('pointer attraction has the same direction, a soft radius and small bounded travel', () => {
  for (const compact of [false, true]) {
    const radius = compact ? 90 : 140
    for (let x = -160; x <= 160; x += 4) for (let y = -160; y <= 160; y += 4) {
      const p = resolveHeixiuFollow(x, y, compact)
      assert.ok(p.x * x >= 0 && p.y * y >= 0, 'never flee or invert pointer direction')
      assert.ok(Math.abs(p.x) <= (compact ? 2 : 5))
      assert.ok(Math.abs(p.y) <= (compact ? 1.5 : 3.5))
    }
    assert.deepEqual(resolveHeixiuFollow(radius, 0, compact), { x: 0, y: 0 })
    assert.ok(resolveHeixiuFollow(radius - .01, 0, compact).x < .00001, 'no threshold jump')
  }
  assert.deepEqual(resolveHeixiuFollow(NaN, 0, false), { x: 0, y: 0 })
})
test('float uses a stationary dock, resets attraction on leave and pauses offscreen', () => {
  const f = fixture(), dispose = installComposerBloub(f.doc); f.step()
  const bot = f.composer.children[1], reads = f.reads()
  assert.equal(bot.dataset.floating, 'true')
  assert.equal(bot.children[0].className, 'xiaohei-bloub-drift')
  for (let i = 0; i < 20; i++) f.listeners.get('pointermove')({ pointerType: 'mouse', clientX: 498, clientY: 728 })
  assert.ok(parseFloat(bot.style.getPropertyValue('--heixiu-follow-x')) > 0)
  assert.ok(parseFloat(bot.style.getPropertyValue('--heixiu-follow-y')) < 0)
  assert.equal(f.reads(), reads)
  f.listeners.get('pointerleave')()
  assert.equal(parseFloat(bot.style.getPropertyValue('--heixiu-follow-x')), 0)
  f.doc.hidden = true; f.listeners.get('visibilitychange')()
  assert.equal(bot.dataset.floating, 'false')
  f.doc.hidden = false; f.listeners.get('visibilitychange')()
  assert.equal(bot.dataset.floating, 'true')
  dispose(); assert.equal(f.timers.size, 0); assert.equal(f.frames.size, 0)
})
