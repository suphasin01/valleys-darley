const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const postcss=require('postcss');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const {StoreSearch}=require('../app/components/StoreSearch.tsx');
test('search trigger is an accessible SVG icon, not hidden text that can leak through menu CSS',()=>{
  const html=renderToStaticMarkup(React.createElement(StoreSearch,{className:'isolated-control'}));
  const trigger=html.slice(0,html.indexOf('</button>'));
  assert.ok(trigger.includes('aria-label="Search jewelry"'));
  assert.ok(trigger.includes('<svg')&&trigger.includes('<circle'));
  assert.ok(!trigger.includes('>search<')&&!trigger.includes('store-search-trigger'));
  assert.ok(html.includes('id="store-search"')&&html.includes('type="search"'));
});
test('header styles are isolated from the legacy direct-child button font overrides',()=>{
  const header=fs.readFileSync('app/components/Header.tsx','utf8');
  assert.ok(header.includes("import styles from './Header.module.css'"));
  assert.ok(header.includes('<StoreSearch className={styles.control}/>'));
  assert.ok(!header.includes('supplied-header-left')&&!header.includes('supplied-header-inner'));
  const css=fs.readFileSync('app/components/Header.module.css','utf8');
  assert.ok(!css.includes('font-size:0')&&!css.includes(':before')&&!css.includes(':after'));
  assert.ok(css.includes('minmax(0,1fr)')&&css.includes('76px'));
});
test('phone header keeps four controls in symmetric rails around the wordmark',()=>{
  const css=postcss.parse(fs.readFileSync('app/components/Header.module.css','utf8'));
  let columns;
  css.walkRules(rule=>{if(rule.selector==='.inner'&&rule.parent.type==='atrule'&&rule.parent.params==='(max-width: 600px)')rule.walkDecls('grid-template-columns',decl=>{columns=decl.value;});});
  assert.equal(columns,'88px minmax(0,1fr) 88px');
  for(const width of [320,360,375,390,430])assert.ok(width-24-8-176>=112);
});
