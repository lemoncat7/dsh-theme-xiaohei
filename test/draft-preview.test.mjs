import test from 'node:test'
import assert from 'node:assert/strict'
import { XiaoheiDraftPreview } from '../lib/composer-draft-preview.js'

const preview = (draft, phase = 'plain') => XiaoheiDraftPreview({ input: { draft, phase } })
test('local draft follows typing, clearing, sending and failed-send restoration', () => {
  for (const text of ['', ' ', '\n']) assert.equal(preview(text), null)
  for (const text of ['你', '你好', '中文输入\n下一行', '@笔记 /文件', '<script>unsafe</script>']) {
    const node = preview(text)
    assert.equal(node.props['aria-label'], '草稿 · 未发送')
    assert.equal(node.props.children[1].props.children, text)
    assert.equal(node.props.children[1].props.dangerouslySetInnerHTML, undefined)
  }
  assert.equal(preview('发送', 'adjudicating'), null)
  assert.equal(preview('发送', 'submitting'), null)
  assert.equal(preview(''), null)
  assert.ok(preview('失败后恢复'))
})
test('session changes cannot retain another session draft; commands remain local previews', () => {
  assert.ok(preview('会话一'))
  assert.equal(preview(''), null)
  assert.equal(preview('会话二').props.children[1].props.children, '会话二')
  assert.ok(preview('/help', 'claimed'))
})
