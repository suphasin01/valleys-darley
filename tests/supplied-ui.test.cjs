const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const postcss = require('postcss');
const ts = require('typescript');
for (const extension of ['.ts','.tsx']) require.extensions[extension] = (module,filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
const {editorialGallery,editorialImage} = require('../app/lib/editorial-images.ts');
test('supplied styles cannot reset the admin or native checkout form',()=>{
  postcss.parse(fs.readFileSync('app/supplied-ui.css','utf8')).walkRules(rule=>{
    if (rule.parent.type==='atrule' && /keyframes$/.test(rule.parent.name)) return;
    for (const selector of rule.selectors) assert.ok(selector.startsWith('.supplied-ui') || selector.startsWith('.supplied-brand'),selector);
  });
});
test('all original product galleries reference local supplied assets and CMS uploads retain priority',()=>{
  for (const [id,image] of [['heart-locket','/images/product-closeup-2.png'],['swirl-bow','/images/product-closeup-5.png'],['ribbon-earring','/images/lifestyle-2.png'],['pearl-ring','/images/ar-ring-silver-v2.png']]) {
    const product={id,image};
    const gallery=editorialGallery(product);
    assert.equal(gallery.length,7);
    for (const photo of gallery) assert.ok(fs.statSync(`public${photo}`).size>1000,photo);
    assert.equal(editorialImage({...product,image:'/uploads/custom.jpg'}),'/uploads/custom.jpg');
    assert.deepEqual(editorialGallery({...product,image:'/uploads/custom.jpg',images:['/uploads/detail.jpg']}),['/uploads/custom.jpg','/uploads/detail.jpg']);
  }
});
test('homepage retains CMS publishing and native product links, not mock source prices',()=>{
  const source=fs.readFileSync('app/page.tsx','utf8');
  assert.ok(source.includes('await getCmsContent()'));
  assert.ok(source.includes('item.id === slug && item.published'));
  assert.ok(!source.includes('content/products.json'));
  assert.ok(!source.includes('free international shipping'));
  for (const photo of ['hero.jpg','girl.jpg','ring-cake.jpg','card-swirl.jpg','card-earrings.jpg','card-ring.jpg','card-locket.jpg','custom-locket.webp','custom-swirl.webp','custom-earrings.webp','custom-ring.webp']) assert.ok(fs.statSync(`public/assets/home/${photo}`).size>1000);
});
