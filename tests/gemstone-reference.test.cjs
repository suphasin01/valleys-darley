const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {GemstoneDesignReference}=require('../app/components/GemstoneDesignReference.tsx');
test('unverified gemstone design offers only source reference and enquiry, not copied variants',()=>{
 const html=renderToStaticMarkup(React.createElement(GemstoneDesignReference,{name:'Gemstone Locket',left:'-194.85%',top:'-104.46%'}));
 assert.ok(html.includes('/images/figma/preview-0.webp'));
 assert.ok(html.includes('/contact?custom=gemstone-locket'));
 assert.ok(html.includes('not available online yet'));
 for(const control of ['<select','<input','<textarea','Save design','Star gemstone','Aquamarine'])assert.ok(!html.includes(control),control);
 const route=fs.readFileSync('app/custom-made/[design]/page.tsx','utf8');
 assert.ok(route.includes("design === 'gemstone-locket' ? <GemstoneDesignReference"));
});
