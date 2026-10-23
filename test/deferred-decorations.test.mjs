import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, statSync } from 'node:fs'
import vm from 'node:vm'
import { installDeferredDecorations } from '../lib/deferred-decorations.js'
import { installDeferredCompanion } from '../lib/deferred-companion.js'
import { createHeixiuSignals } from '../lib/bloub-heixiu/signals.js'

function fixture() {
  const timers = new Map(), idles = new Map()
  let serial = 0, ready = false, observer
  const win = {
    setTimeout(fn) { const id = ++serial; timers.set(id, fn); return id },
    clearTimeout(id) { timers.delete(id) },
    requestIdleCallback(fn) { const id = ++serial; idles.set(id, fn); return id },
    cancelIdleCallback(id) { idles.delete(id) },
    MutationObserver: class { constructor(fn) { observer = fn } observe() {} disconnect() {} },
  }
  const doc = { body: {}, defaultView: win, querySelector: () => ready ? {} : null }
  return { doc, timers, idles, async ready() { ready = true; observer(); await Promise.resolve() },
    async flush() { for (const jobs of [timers, idles]) { const list = [...jobs.values()]; jobs.clear(); for (const fn of list) fn() } await Promise.resolve() },
  }
}
test('decoration download waits for the app, does not block activation and runs once', async () => {
  const f = fixture(); let loads = 0, mounts = 0, unmounts = 0
  const dispose = installDeferredDecorations(f.doc, async () => { loads++; return { installDecorations() { mounts++; return () => unmounts++ } } })
  assert.equal(loads, 0); assert.equal(f.timers.size, 0)
  await f.ready(); assert.equal(loads, 0)
  await f.flush(); assert.equal(loads, 1); assert.equal(mounts, 1)
  await f.ready(); await f.flush(); assert.equal(loads, 1)
  dispose(); assert.equal(unmounts, 1)
})
test('unload cancels scheduling and ignores late downloads', async () => {
  const f = fixture(); let loads = 0
  const dispose = installDeferredDecorations(f.doc, async () => { loads++; throw Error('should not run') })
  await f.ready(); dispose(); await f.flush(); assert.equal(loads, 0)
  const g = fixture(); let resolve, mounts = 0
  const stop = installDeferredDecorations(g.doc, () => new Promise(r => { resolve = r }))
  await g.ready(); await g.flush(); stop()
  resolve({ installDecorations() { mounts++; return () => {} } }); await Promise.resolve()
  assert.equal(mounts, 0)
})
test('transient chunk failures retry without duplicating mounts and stop after disposal', async () => {
  const f=fixture();let loads=0,mounts=0
  const stop=installDeferredDecorations(f.doc,async()=>{
    if(++loads<3)throw Error('temporary download failure')
    return {installDecorations(){mounts++;return()=>{}}}
  })
  await f.ready();await f.flush();await f.flush();await f.flush()
  assert.equal(loads,3);assert.equal(mounts,1)
  await f.flush();assert.equal(loads,3);stop()
  const g=fixture();let failed=0
  const dispose=installDeferredDecorations(g.doc,async()=>{failed++;throw Error('offline')})
  await g.ready();await g.flush();dispose();await g.flush();assert.equal(failed,1)
})
test('native chunk registration is self-contained and startup excludes large scenery', () => {
  const entry = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.ok(Buffer.byteLength(entry) < 1500000, 'startup bundle size regression')
  assert.match(entry, /\.async\(["']\.\/client\.decorations\.js/)
  let registration
  vm.runInNewContext(readFileSync(new URL('../lib/client.decorations.js', import.meta.url), 'utf8'), {
    window: { __ModuleLoader__: { load(value) { registration = value } } },
  })
  assert.equal(registration.chunk, 'client.decorations.js')
  assert.equal(registration.id, '@lemoncat7/dsh-theme-xiaohei')
  const exports = registration.factory(() => { throw Error('chunk must be self-contained') })
  assert.equal(typeof exports.installDecorations, 'function')
  assert.ok(statSync(new URL('../lib/client.decorations.js', import.meta.url)).mtimeMs <= statSync(new URL('../lib/client.js', import.meta.url)).mtimeMs)
})
test('companion is deferred, receives latest signals, and ignores results after disposal', async () => {
  const f = fixture(), signals = createHeixiuSignals(); let loads = 0, mounted, cleaned = 0
  const stop = installDeferredCompanion(signals, f.doc, async () => {
    loads++; return { installComposerBloub(doc, input) { mounted = input.getSnapshot(); return () => cleaned++ } }
  })
  assert.equal(loads, 0); await f.ready(); assert.equal(loads, 0)
  signals.publish({ sessionId: 'latest', running: true, notice: null })
  await f.flush(); await Promise.resolve(); await Promise.resolve()
  assert.equal(loads, 1); assert.equal(mounted.sessionId, 'latest'); stop(); assert.equal(cleaned, 1)
  const g = fixture(); let resolve, late = 0
  const cancel = installDeferredCompanion(signals, g.doc, () => new Promise(r => { resolve = r }))
  await g.ready(); await g.flush(); cancel()
  resolve({ installComposerBloub() { late++; return () => {} } })
  await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); assert.equal(late, 0)
})
test('Rift defers the scene and the explicitly retained Heixiu into separate native chunks', () => {
  const entry = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.match(entry, /\.async\(["']\.\/client\.decorations\.js/)
  assert.match(entry, /\.async\(["']\.\/client\.companion\.js/)
  assert.doesNotMatch(entry, /data-heixiu-body/)
  let registration
  vm.runInNewContext(readFileSync(new URL('../lib/client.decorations.js', import.meta.url), 'utf8'), {
    window: { __ModuleLoader__: { load(value) { registration = value } } },
  })
  assert.equal(registration.chunk, 'client.decorations.js')
  const exported = registration.factory(() => { throw Error('unexpected shared dependency') })
  assert.equal(typeof exported.installDecorations, 'function')
  vm.runInNewContext(readFileSync(new URL('../lib/client.companion.js', import.meta.url), 'utf8'), {
    window: { __ModuleLoader__: { load(value) { registration = value } } },
  })
  assert.equal(registration.chunk, 'client.companion.js')
  assert.equal(typeof registration.factory(() => { throw Error('unexpected shared dependency') }).installComposerBloub, 'function')
})
