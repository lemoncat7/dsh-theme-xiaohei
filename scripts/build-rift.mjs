import {build} from 'esbuild'
const pluginId='@lemoncat7/dsh-theme-xiaohei'
for(const [entry,chunk] of [['src/decorations-entry.ts','client.decorations.js'],['src/companion-entry.ts','client.companion.js'],['src/client-entry.ts','client.js']]){
 await build({entryPoints:[entry],outfile:`lib/${chunk}`,bundle:true,format:'cjs',platform:'browser',target:'es2022',jsx:'automatic',minify:true,sourcemap:false,charset:'utf8',
  external:['react','react/jsx-runtime','@deepseek-ai/dsh-client-ui-theme/client'],
  banner:{js:`window.__ModuleLoader__.load({id:${JSON.stringify(pluginId)},${chunk==='client.js'?'':`chunk:${JSON.stringify(chunk)},`}factory:(require)=>{var module={exports:{}};var exports=module.exports;`},
  footer:{js:'return module.exports;}});'},metafile:true,
 }).then(async result=>{
  // Only the explicitly retained companion may use the legacy blob renderer;
  // first paint can import its tiny read-only signals, never its engine/assets.
  const forbidden=Object.keys(result.metafile.inputs).filter(path=>/spirit-realm|generated-keyart|generated-identity|generated-loading|sidebar-glass|chrome\//.test(path)
    || path.includes('bloub-heixiu/') && chunk!=='client.companion.js' && !path.endsWith('bloub-heixiu/signals.ts'))
  if(forbidden.length)throw Error('Legacy visuals entered the Rift bundle: '+forbidden.join(', '))
 })
}
await build({entryPoints:['src/index.ts'],outfile:'lib/index.js',bundle:true,format:'esm',platform:'node',target:'node22',minify:false,sourcemap:false})
