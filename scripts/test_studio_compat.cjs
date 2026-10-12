const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const context={window:{}};vm.runInNewContext(fs.readFileSync('theme-studio-compat.js','utf8'),context);
const {normalize,variantMinimum}=context.window.AKScreenThemeCompatibility;
const main=fs.readFileSync('theme-studio.js','utf8');
const colors=Object.keys(vm.runInNewContext('('+main.match(/const STUDIO_COLORS = (\{[^;]+\});/)[1]+')'));
const icons=vm.runInNewContext(main.match(/const ICONS = (\[[^;]+\]);/)[1]);
for(const author of fs.readdirSync('themes').filter(name=>fs.statSync(path.join('themes',name)).isDirectory()))for(const id of fs.readdirSync(path.join('themes',author))){
  const filename=path.join('themes',author,id,'theme.json');if(!fs.existsSync(filename))continue;
  const raw=JSON.parse(fs.readFileSync(filename,'utf8')),result=normalize(raw,colors,icons);
  assert.ok(Object.keys(result.colors).every(role=>colors.includes(role)));
  assert.ok(Object.keys(result.icons).every(role=>icons.includes(role)));
  assert.equal(result.id,raw.id);
  if(raw.schema_version===1){
    assert.equal(result.colors.app_bg,raw.colors.window);
    assert.equal(result.colors.panel_bg,raw.colors.panel);
    assert.equal(result.colors.monitor_bg,raw.colors.canvas);
    assert.equal(result.style.metrics.radius,raw.geometry.radius.panel);
    assert.equal(result.icons.Selection,raw.icons.cursor);
    assert.equal(result.editor_background,raw.backgrounds.editor.image||'');
    assert.equal(result.font,raw.typography.file||'');
    // A catalog-normalized old manifest must produce the same native colors/resources.
    const normalized=normalize({schema:1,id:raw.id,colors:{background:raw.colors.window},style:raw},colors,icons);
    assert.deepEqual(normalized.colors,result.colors);
    assert.equal(normalized.font,result.font);
  }
}
for(const version of ['2.0.0','2.1.0','2.1.5','2.2.0','2.3.0',undefined])assert.equal(variantMinimum(version),'2.4.0');
assert.equal(variantMinimum('2.4.0'),'2.4.0');assert.equal(variantMinimum('2.5.0'),'2.5.0');
assert.equal(normalize({schema:1,colors:{window:'#112233',app_bg:'#445566'}},colors,icons).colors.app_bg,'#445566');
assert.throws(()=>normalize({schema:1,colors:{window:'url(bad)'}},colors,icons));
assert.ok(main.includes('min_version:window.AKScreenThemeCompatibility.variantMinimum(original.min_version)'));
console.log('Legacy raw/catalog themes, resources, icons, native precedence, and 2.0/2.1 variant migration: OK');

// Exercise the actual ZIP importer without a browser, DOM interaction, or draft changes.
class FileReader {
  readAsDataURL(blob){blob.arrayBuffer().then(bytes=>{this.result='data:'+blob.type+';base64,'+Buffer.from(bytes).toString('base64');this.onload();}).catch(error=>{this.error=error;this.onerror?.();});}
}
const runtime={window:context.window,Blob,TextEncoder,TextDecoder,structuredClone,FileReader};
vm.runInNewContext(main.replace('  init();','  window.__test = {importPackageZip,zipStored};'),runtime);
(async()=>{
  for(const id of ['aurora-glass','sakura-pulse','ak-midnight']){
    const folder=path.join('themes','edgajuman',id),raw=JSON.parse(fs.readFileSync(path.join(folder,'theme.json'),'utf8'));
    const source={...raw,icons:{},min_app_version:id==='aurora-glass'?'2.0.0':'2.1.0'};
    const converted=normalize(source,colors,icons),files=[{name:'theme.json',bytes:new TextEncoder().encode(JSON.stringify(source))}];
    for(const resource of [converted.editor_background,converted.splash_background,converted.font,'LICENSE.txt'].filter(Boolean)){
      const file=path.join(folder,resource);if(fs.existsSync(file))files.push({name:resource,bytes:fs.readFileSync(file)});
    }
    const zip=runtime.window.__test.zipStored(files),loaded=await runtime.window.__test.importPackageZip(zip,true);
    assert.equal(loaded.min_version,source.min_app_version,'Preview does not reject or overwrite the historical version');
    assert.equal(variantMinimum(loaded.min_version),'2.4.0','Variant targets a version that supports its native controls');
    assert.equal(loaded.colors.app_bg,converted.colors.app_bg);
    if(converted.font)assert.equal(loaded.files.font.path,converted.font);
    if(converted.editor_background)assert.equal(loaded.files['editor-background'].path,converted.editor_background);
    if(converted.splash_background)assert.equal(loaded.files['splash-background'].path,converted.splash_background);
  }
  console.log('Actual ZIP importer: 2.0/2.1 colors, GIF/image backgrounds and font resources passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
