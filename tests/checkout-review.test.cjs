const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
for (const ext of ['.ts','.tsx']) require.extensions[ext] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,filename);
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const profile = {name:'Example',email:'example@example.com',phone:'0812345678',address:'Example street',subdistrict:'Example',district:'Example',province:'Bangkok',postalCode:'10110'};
const product = {id:'example-ring',name:'Example Ring',image:'/images/ar-ring-silver-v2.png',description:'Example',published:true,link:'/contact',variants:[{id:1,label:'Silver',sku:'SILVER',price:500,available:2}]};
const originalLoad = Module._load;
Module._load = function(request,parent,isMain) {
  if (request.endsWith('/lib/auth')) return {member:async()=>({sub:'google:example',name:'Example'})};
  if (request.endsWith('/lib/cms')) return {getCmsContent:async()=>({products:[product]})};
  if (request.endsWith('/lib/stripe')) return {stripeCheckoutReady:()=>true,stripeTestMode:()=>true,shippingFeeSatang:()=>5000};
  if (request.endsWith('/lib/customer-profile')) return {getCustomerProfile:async()=>profile};
  return originalLoad.call(this,request,parent,isMain);
};
const Checkout = require('../app/checkout/page.tsx').default;
Module._load = originalLoad;
test('single-product checkout uses shared Preview layout and preserves payment selection',async()=>{
  const html=renderToStaticMarkup(await Checkout({searchParams:Promise.resolve({product:product.id,quantity:'2',variant:'1'})}));
  assert.ok(html.includes('aria-label="Order summary"'));
  assert.ok(html.includes('action="/api/checkout"'));
  assert.ok(html.includes('name="quantity" value="2"'));
  assert.ok(html.includes('name="variantId" value="1"'));
  assert.ok(html.includes('1,050.00'));
  assert.ok(html.includes('next=%2Fcheckout%3Fproduct%3Dexample-ring%26quantity%3D2%26variant%3D1'));
  assert.ok(html.includes('Edit product selection'));
  assert.ok(!html.includes('rounded-3xl'));
});
test('unavailable single-product selection cannot start payment or display a zero payable total',async()=>{
  const html=renderToStaticMarkup(await Checkout({searchParams:Promise.resolve({product:product.id,quantity:'3',variant:'1'})}));
  assert.ok(html.includes('Review your selection'));
  assert.ok(!html.includes('action="/api/checkout"'));
  assert.ok(!html.includes('Order summary'));
  assert.ok(html.includes('action="/checkout"'));
});
