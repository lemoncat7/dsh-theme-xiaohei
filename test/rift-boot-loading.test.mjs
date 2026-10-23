import test from 'node:test'
import assert from 'node:assert/strict'
import {RIFT_BOOT_LOADING_CSS} from '../lib/rift/boot-styles.js'
import {RIFT_MARK_IMAGE} from '../lib/rift/mark.js'
import {RIFT_FLOW_IMAGE} from '../lib/rift/boot-flow.js'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {injectRiftBoot} from '../lib/rift/boot.js'
test('original metallic finish has verified provenance and stays out of the loader',()=>{
 assert.ok(RIFT_MARK_IMAGE.startsWith('data:image/webp;base64,'))
 const read=path=>readFileSync(new URL('../'+path,import.meta.url))
 const metadata=JSON.parse(read('src/assets/identity/xiaohei-brand-metallic.json'))
 const hash=data=>createHash('sha256').update(data).digest('hex')
 const baked=read('src/assets/identity/xiaohei-brand-metallic.webp')
 assert.deepEqual(Buffer.from(RIFT_MARK_IMAGE.split(',')[1],'base64'),baked)
 assert.equal(hash(baked),metadata.outputSha256)
 assert.equal(hash(read('src/metallic-brand-mark.tsx')),metadata.sourceSha256)
 assert.equal(hash(read('src/assets/identity/xiaohei-brand-head-v2.webp')),metadata.textureSha256)
 assert.equal(metadata.size,256);assert.equal(metadata.time,1450);assert.deepEqual(metadata.composite,[.28,.92])
 assert.ok(baked.length<20_000)
 assert.ok(!RIFT_BOOT_LOADING_CSS.includes(RIFT_MARK_IMAGE))
 assert.ok(RIFT_BOOT_LOADING_CSS.includes(RIFT_FLOW_IMAGE))
 assert.doesNotMatch(decodeURIComponent(RIFT_FLOW_IMAGE),/<image|<text|<foreignObject/)
 assert.doesNotMatch(RIFT_BOOT_LOADING_CSS,/rift-boot-orbit|rotate\(360deg\)/)
 assert.match(RIFT_BOOT_LOADING_CSS,/rift-flow-arrive/)
 assert.match(RIFT_BOOT_LOADING_CSS,/prefers-reduced-motion:reduce/)
 assert.match(RIFT_BOOT_LOADING_CSS,/forced-colors:active/)
 assert.doesNotMatch(RIFT_BOOT_LOADING_CSS,/https?:|Loading plugins|position:fixed|backdrop-filter/)
 const html='<head></head><body><div><div data-dsh-boot-spinner></div><p>Loading plugins…</p></div></body>'
 const result=injectRiftBoot(html)
 assert.ok(result.endsWith(html.slice(html.indexOf('</head>'))))
 assert.equal(injectRiftBoot(result),result)
})
