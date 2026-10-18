import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import {createCharacterAssetLoader} from '../lib/scene/character-assets.js'

test('asset requests are scoped, deduplicated and cached, absent rigs never fetch',async()=>{
  const paths=[]
  const loader=createCharacterAssetLoader(async path=>{paths.push(path);return {image:path,rig:{}}})
  const first=await Promise.all([loader.pose('seated','light'),loader.pose('seated','light')])
  assert.equal(first[0],first[1]);assert.deepEqual(paths,['./client.pose-seated-light.js'])
  await loader.pose('seated','light');assert.equal(paths.length,1)
  await loader.rig('doze','light');await loader.rig('hidden','dark');assert.equal(paths.length,1)
  await loader.rig('seated','light');assert.equal(paths[1],'./client.rig-seated-light.js')
  await loader.pose('chin','dark');assert.equal(paths[2],'./client.pose-chin-dark.js')
})
test('a failed asset request can be explicitly retried',async()=>{
  let attempts=0
  const loader=createCharacterAssetLoader(async()=>{if(++attempts===1)throw Error('network');return {image:'ok'}})
  await assert.rejects(loader.pose('peek','light'))
  assert.equal(await loader.pose('peek','light'),'ok');assert.equal(attempts,2)
})
test('Rift replaces legacy pose catalog with one self-contained deferred scene chunk',()=>{
  const root=new URL('../lib/',import.meta.url)
  // Two independently authored, compressed day/night illustrations.
  assert.ok(fs.statSync(new URL('client.decorations.js',root)).size<500000)
  const files=['client.decorations.js']
  for(const file of files){
    let module
    vm.runInNewContext(fs.readFileSync(new URL(file,root),'utf8'),{window:{__ModuleLoader__:{load:m=>module=m}}})
    assert.equal(module.chunk,file)
    const value=module.factory(()=>{throw Error('unexpected dependency')})
    assert.equal(typeof value.installDecorations,'function')
  }
})
