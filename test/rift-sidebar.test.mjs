import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {RIFT_SIDEBAR_CSS} from '../lib/rift/sidebar-styles.js'
import {RIFT_CSS} from '../lib/rift/styles.js'
test('sidebar motion stays decorative and respects native selection and pause',()=>{
 assert.ok(RIFT_CSS.endsWith(RIFT_SIDEBAR_CSS))
 for(const s of ['aria-selected','aria-expanded','data-rift-paused','prefers-reduced-motion','forced-colors','focus-visible'])assert.ok(RIFT_SIDEBAR_CSS.includes(s))
 assert.doesNotMatch(RIFT_SIDEBAR_CSS,/backdrop-filter|setInterval|pointer-events:\s*auto|will-change|filter:/)
 assert.doesNotMatch(RIFT_SIDEBAR_CSS,/rift-sidebar-breath|earSeal|data:image\/svg|infinite/)
 assert.doesNotMatch(RIFT_SIDEBAR_CSS,/rift-resonance__portrait|rift-seal-blink|rift-seal-eyes/)
 const field=readFileSync(new URL('../src/rift/field.tsx',import.meta.url),'utf8')
 assert.doesNotMatch(field,/rift-resonance__portrait|rift-seal-eyes/)
 assert.match(field,/领域待命/)
})
test('sidebar keyframes animate only transforms and opacity',()=>{
 for(const frames of RIFT_SIDEBAR_CSS.matchAll(/@keyframes[^}]+(?:\}[^@]*?\n\})/g)){
  assert.doesNotMatch(frames[0],/(?:width|height|left|right|padding|margin|background|filter|shadow):/)
 }
})
test('rejected moving outlines are removed while native focus feedback remains',()=>{
 const field=readFileSync(new URL('../src/rift/field.tsx',import.meta.url),'utf8')
 const deferred=readFileSync(new URL('../src/decorations-entry.ts',import.meta.url),'utf8')
 assert.doesNotMatch(deferred,/installSidebarMotion/)
 assert.doesNotMatch(field,/rift-impulse|setSignal|signal\.x/)
 assert.match(field,/bindRiftInteractions/)
 assert.match(field,/return null/)
 assert.doesNotMatch(RIFT_CSS,/rift-impulse|rift-shard|rift-perimeter|rift-sidebar-follow/)
 assert.match(RIFT_CSS,/\[data-composer-card='true'\]:focus-within/)
 for (const file of ['client.js','client.decorations.js']) {
  assert.doesNotMatch(readFileSync(new URL('../lib/'+file,import.meta.url),'utf8'),/rift-impulse|rift-sidebar-follow|rift-perimeter|rift-sidebar-breath/)
 }
})
