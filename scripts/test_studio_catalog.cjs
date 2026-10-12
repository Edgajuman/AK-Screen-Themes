// Network trust boundaries: no path escape, oversize transfer, or unverified asset.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const bytes = new TextEncoder().encode('original asset');
let served = bytes;
const context = {window:{},TextDecoder,Uint8Array,Set,Map,AbortSignal,crypto:webcrypto,
  fetch:async()=>new Response(served)};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../theme-studio-catalog.js'),'utf8'),context);
const api = context.window.AKScreenThemeCatalogue;
const theme={revision:'a'.repeat(40),author:'dehuman',id:'sample'};
assert.match(api.resourceUrl(theme,'assets/editor.webp'), /^https:\/\/raw\.githubusercontent\.com\/Edgajuman\/AK-Screen-Themes\//);
for (const path of ['../a.png','/a.png','a\\b.png','a/%2e%2e/b.png','https://other/x','a//x','a?x']) {
  assert.throws(()=>api.resourceUrl(theme,path));
}
(async()=>{
  const sha256=Buffer.from(await webcrypto.subtle.digest('SHA-256',bytes)).toString('hex');
  theme.assets=[{path:'assets/sample.png',size:bytes.length,sha256}];
  let progress=0;
  const loaded=await api.packageEntries(theme,AbortSignal.timeout(1000),done=>progress=done);
  assert.equal(loaded.get('assets/sample.png').length,bytes.length);assert.equal(progress,1);
  theme.assets[0].sha256='0'.repeat(64);
  await assert.rejects(()=>api.packageEntries(theme,AbortSignal.timeout(1000)),/verificación/);
  theme.assets[0].sha256=sha256;served=new Uint8Array(bytes.length+1);
  await assert.rejects(()=>api.packageEntries(theme,AbortSignal.timeout(1000)),/tamaño/);
  console.log('Studio catalogue: path boundaries, asset integrity, progress and size bounds passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
