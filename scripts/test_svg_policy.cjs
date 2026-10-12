const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('theme-studio-compat.js','utf8'),context);
const safe=context.window.AKScreenThemeCompatibility.safeSvgDocument;
const element=(localName,attributes={})=>({localName,attributes:Object.entries(attributes).map(([name,value])=>({name,localName:name.split(':').at(-1),value}))});
function doc(rootAttributes={},children=[]){const root=element('svg',rootAttributes);root.querySelectorAll=()=>children;return{documentElement:root,querySelector:()=>null};}
assert.ok(safe(doc({},[element('linearGradient',{id:'p'}),element('rect',{stroke:'url(#p)'})]),'<svg/>'));
assert.ok(safe(doc({fill:'url("#paint-1")'}),'<svg/>'));
assert.ok(safe(doc({},[element('use',{'xlink:href':'#local'})]),'<svg/>'));
for(const bad of ['url(https://evil.test/x)','url(data:image/svg+xml,x)','url(#p) url(https://evil.test/x)','url(#p);x','javascript:alert(1)'])assert.ok(!safe(doc({fill:bad}),'<svg/>'));
for(const bad of [element('script'),element('foreignObject'),element('style'),element('set'),element('image',{href:'https://evil.test/x'}),element('use',{'xlink:href':'data:x'})])assert.ok(!safe(doc({},[bad]),'<svg/>'));
assert.ok(!safe(doc({onload:'run()'}),'<svg/>'));
assert.ok(!safe(doc(),'<svg><!ENTITY x></svg>'));
console.log('SVG internal gradients accepted; external references, animation mutation, scripts and root events blocked.');
