import test from 'node:test'
import assert from 'node:assert/strict'
import {RIFT_UI_CSS} from '../lib/rift/ui-styles.js'
import {RIFT_SCENE_CSS} from '../lib/rift/scene-styles.js'

test('message surfaces exclude native tooltip bubbles in both themes',()=>{
 for(const css of [RIFT_UI_CSS,RIFT_SCENE_CSS]){
  assert.match(css,/\[class\*='_bubble'\]:not\(\[role='tooltip'\]\)/)
  assert.doesNotMatch(css,/\[class\*='_bubble'\],/)
 }
 assert.match(RIFT_SCENE_CSS,/\[role='tooltip'\] \{ -webkit-text-stroke:0; text-shadow:none;/)
})
test('writeback notices do not acquire the generic light content surface',()=>{
 assert.match(RIFT_SCENE_CSS,/:not\(\[data-chat-flow-kind='turn-tail'\]\) > \[data-slot='conversation.chat.node'\] > :first-child/)
 // Do not hide statuses, errors, or interactive retry/document controls.
 assert.doesNotMatch(RIFT_SCENE_CSS,/\.dsh-knowledge-writeback[^{}]*\{[^}]*display:none/)
})
test('admitted steering keeps the same bubble-only surface as user messages',()=>{
 const selector=RIFT_SCENE_CSS.split('\n').find(line=>line.includes("> [data-slot='conversation.chat.node'] > :first-child {"))
 assert.ok(selector)
 for(const kind of ['user','steering','assistant-step','turn-tail']){
  assert.ok(selector.includes(`:not([data-chat-flow-kind='${kind}'])`),`${kind} must not receive a generic row surface`)
 }
})
test('small action metadata is plain text without a surface or inherited outline',()=>{
 assert.match(RIFT_SCENE_CSS,/\[data-chat-flow-kind\] \[class\*='_actions'\] \{[^}]*background:none[^}]*-webkit-text-stroke:0;/)
 assert.match(RIFT_SCENE_CSS,/\[data-chat-flow-kind\] \[role='tooltip'\] \{[^}]*background:none; border:0; border-radius:0; box-shadow:none;/)
})
test('searchable collapsed steps remove outer paint without disabling native search reveal',()=>{
 const rule=RIFT_UI_CSS.match(/\[data-chat-flow-kind\]\[hidden='until-found'\] \{([^}]+)\}/)?.[1]
 assert.ok(rule)
 for(const property of ['padding:0','border:0','background:none','box-shadow:none','min-height:0'])assert.ok(rule.includes(property))
 assert.doesNotMatch(rule,/display:|visibility:|content-visibility:/)
})
