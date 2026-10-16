import test from 'node:test'
import assert from 'node:assert/strict'
import { subscribeXiaoheiHostDom } from '../lib/host-dom.js'
test('host DOM commits are coalesced at frame boundary; queued cleanup is cancelled', async () => {
  let mutation,frame,cancelled=0,calls=0
  const doc={body:{},defaultView:{MutationObserver:class {constructor(fn){mutation=fn}observe(){}disconnect(){}},requestAnimationFrame(fn){frame=fn;return 1},cancelAnimationFrame(){cancelled++;frame=undefined}}}
  const stop=subscribeXiaoheiHostDom(doc,()=>calls++)
  mutation();await Promise.resolve();mutation();assert.equal(calls,0)
  frame();assert.equal(calls,1);mutation();stop();assert.equal(cancelled,1);assert.equal(frame,undefined)
})
test('coalesced subscribers receive all records once, with no stale records next frame', () => {
  let mutation, frame
  const seen = []
  const doc = { body: {}, defaultView: {
    MutationObserver: class { constructor(fn) { mutation = fn } observe() {} disconnect() {} },
    requestAnimationFrame(fn) { frame = fn; return 1 }, cancelAnimationFrame() {},
  } }
  const stop = subscribeXiaoheiHostDom(doc, records => seen.push(records))
  const a = { target: 'a' }, b = { target: 'b' }
  mutation([a]); mutation([b]); frame()
  mutation([b]); frame()
  assert.deepEqual(seen, [[a, b], [b]])
  stop()
})
