const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Module=require('node:module');
const ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
let contactUrl='https://www.instagram.com/valleydarley';
const original=Module._load;
Module._load=function(request,parent,isMain){
 if(request==='../lib/locale')return {getLocale:async()=> 'en'};
 if(request==='../lib/cms')return {getCmsContent:async()=>({contact:{heading:'Find your Darling.',body:'Contact the shop',cta:'Instagram',url:contactUrl}}),localizedContent:value=>value};
 return original.call(this,request,parent,isMain);
};
const Contact=require('../app/contact/page.tsx').default;
Module._load=original;
test('Figma comment 58 links to the shop LINE chat without sending an order or message',async()=>{
 const html=renderToStaticMarkup(await Contact({searchParams:Promise.resolve({})}));
 assert.ok(html.includes('href="https://line.me/R/ti/p/@valleydarley"'));
 assert.ok(html.includes('Contact with LINE OA'));
 assert.ok(html.includes('No order or message is sent automatically.'));
 assert.ok(html.includes('https://www.instagram.com/valleydarley'));
 assert.ok(!html.includes('shop.line.me')&&!html.includes('<form'));
});
test('existing LINE contact URL does not produce a second duplicate LINE button',async()=>{
 contactUrl='https://line.me/R/ti/p/@valleydarley';
 try{
  const html=renderToStaticMarkup(await Contact({searchParams:Promise.resolve({})}));
  assert.equal((html.match(/href="https:\/\/line.me/g)||[]).length,1);
 }finally{contactUrl='https://www.instagram.com/valleydarley';}
});
