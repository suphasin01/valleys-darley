const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);
const {productAction}=require('../app/lib/product-action.ts');
test('retired camera URLs from existing CMS content lead to design selection',()=>{
 for(const link of ['/ar','/ar?product=1','/ar/','/ar#ring']) assert.deepEqual(productAction(link),{href:'/custom-made',chooseDesign:true});
});
test('custom designs retain their destination and unrelated links are not rewritten',()=>{
 for(const link of ['/custom-made','/custom-made/heart-locket']) assert.deepEqual(productAction(link),{href:link,chooseDesign:true});
 for(const link of ['/contact','/articles','https://example.com/ar']) assert.deepEqual(productAction(link),{href:link,chooseDesign:false});
});
test('legacy route no longer imports or renders the camera module',()=>{
 const route=fs.readFileSync('app/ar/page.tsx','utf8');
 assert.ok(route.includes("redirect('/custom-made')"));
 assert.ok(!route.includes('ARExperience')&&!route.includes('getUserMedia'));
 const admin=fs.readFileSync('app/admin/CmsEditor.tsx','utf8');
 assert.ok(admin.includes('<option value="design">เลือกแบบเครื่องประดับ</option>'));
 assert.ok(!admin.includes('<option value="ar">'));
});
