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
