import test from 'node:test'
import assert from 'node:assert/strict'
import { currentSession } from '../lib/current-session.js'

test('theme observes only the main-view retained session on rc.2', () => {
  assert.equal(currentSession({ byId: { a: { id: 'a', retainedBy: { background: 1 } }, b: { id: 'b', retainedBy: { mainView: 1 } } } }), 'b')
  assert.equal(currentSession({ byId: {} }), undefined)
})
