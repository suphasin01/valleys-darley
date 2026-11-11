const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const postcss=require('postcss');
const mobile=postcss.parse(fs.readFileSync('app/storefront-mobile.css','utf8'));
const studio=postcss.parse(fs.readFileSync('public/custom-made/mobile.css','utf8'));
function declarations(root,selector,width){
  const result={};
  root.walkRules(rule=>{
    let parent=rule.parent,active=true;
    while(parent){if(parent.type==='atrule'&&parent.name==='media'){const max=/max-width:\s*(\d+)px/.exec(parent.params);if(max&&width>Number(max[1]))active=false;}parent=parent.parent;}
    if(active&&rule.selectors.includes(selector))rule.walkDecls(decl=>{result[decl.prop]=decl.value;});
  });
  return result;
}
test('mobile overrides are scoped media rules and do not change the desktop/admin layout',()=>{
  for(const root of [mobile,studio])root.walkRules(rule=>{
    let parent=rule.parent;while(parent&&!(parent.type==='atrule'&&parent.name==='media'))parent=parent.parent;
    assert.ok(parent && /max-width: (?:900|760|600)px/.test(parent.params),rule.selector);
  });
  assert.deepEqual(declarations(mobile,'.supplied-header-inner',1440),{});
});
for(const width of [320,360,375,390,430])test(`phone ${width}px uses shrinkable grids and two-column product cards`,()=>{
  assert.equal(declarations(mobile,'.supplied-header-inner',width)['grid-template-columns'],'minmax(0,1fr) auto');
  assert.equal(declarations(mobile,'.supplied-ui .pdp-grid:not(.native-ui, .native-ui *)',width)['grid-template-columns'],'minmax(0,1fr)');
  assert.equal(declarations(mobile,'.supplied-ui .shop-page .grid:not(.native-ui, .native-ui *)',width)['grid-template-columns'],'repeat(2,minmax(0,1fr))');
  assert.equal(declarations(mobile,'.supplied-ui .home-keepsakes:not(.native-ui, .native-ui *)',width).transform,'none');
  assert.equal(declarations(mobile,'.supplied-ui .studio-enquiry input:not([type=checkbox])',width)['font-size'],'16px');
  assert.equal(declarations(studio,'.embedded #form .field',width)['min-width'],'0');
  assert.equal(declarations(studio,'.embedded #form .btn',width)['min-height'],'48px');
});
test('all standalone studio frames load the same responsive fixes, not just the outer page',()=>{
  const files=['index.html',...fs.readdirSync('public/custom-made/builder').filter(name=>name.endsWith('.html')).map(name=>'builder/'+name)];
  assert.equal(files.length,5);
  for(const file of files){const html=fs.readFileSync('public/custom-made/'+file,'utf8');assert.ok(html.includes('href="/custom-made/mobile.css"'),file);assert.ok(/name="viewport" content="width=device-width/.test(html),file);}
  for(const file of ['app/components/CustomStudio.tsx','app/components/CustomSelection.tsx']){
    const code=fs.readFileSync(file,'utf8');assert.ok(code.includes("querySelector<HTMLElement>('.wrap')"));assert.ok(code.includes('observer.observe(content)'));assert.ok(!code.includes('doc.body.scrollHeight'));
  }
});
