import test from 'node:test'
import assert from 'node:assert/strict'
import {RIFT_GLASS_CSS} from '../lib/rift/glass-styles.js'

test('glass only filters bounded decorations, never fixed-dialog ancestors',()=>{
 for(const match of RIFT_GLASS_CSS.matchAll(/([^{}]+)\{([^{}]+)\}/g)){
  if(/backdrop-filter:blur/.test(match[2])){
   for(const selector of match[1].split(',\n'))assert.ok(selector.trim().endsWith('::before'))
   assert.match(match[2],/pointer-events:none/)
   assert.match(match[2],/inset:0/)
  }
 }
 assert.doesNotMatch(RIFT_GLASS_CSS,/isolation:|contain:|transform:|saturate\(/)
 assert.match(RIFT_GLASS_CSS,/prefers-reduced-transparency:reduce/)
 assert.match(RIFT_GLASS_CSS,/forced-colors:active/)
 assert.match(RIFT_GLASS_CSS,/@supports not/)
})
