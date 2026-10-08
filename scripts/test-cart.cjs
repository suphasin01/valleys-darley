const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, deps = {}) {
  const mod = {exports:{}};
  const source = ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  new Function('require','module','exports',source)(id => id in deps ? deps[id] : require(id),mod,mod.exports);
  return mod.exports;
}
const cart = load('app/lib/cart.ts',{'./purchase':load('app/lib/purchase.ts')});
const products = [{id:'ring',name:'Ring',description:'Ring',published:true,priceBaht:100},{id:'bow',name:'Bow',description:'Bow',published:true,variants:[{id:2,label:'Silver',price:250,available:3}]}];
const items = [{productId:'ring',variantId:'',quantity:2},{productId:'bow',variantId:'2',quantity:3}];
assert.deepEqual(cart.parseCart(items),items);
for (const bad of [null,{},[],[...items,items[0]],Array(21).fill(items[0]),[{...items[0],quantity:11}],[{...items[0],quantity:1.5}],[{...items[0],productId:'../../bad'}],[{...items[0],variantId:'bad'}]]) assert.equal(cart.parseCart(bad),null);
assert.equal(cart.resolveCart(items,products).reduce((sum,l)=>sum+l.quantity*l.selection.amount,0),95000);
assert.equal(cart.resolveCart(items,products.map(p=>({...p,published:false}))),null);
assert.equal(cart.resolveCart([{...items[1],quantity:4}],products),null);
assert.equal(cart.resolveCart([{...items[0],variantId:'2'}],products),null);
(async()=>{
  let user = {sub:'google:test',provider:'google',name:'Test'}; const calls = [];
  const route = load('app/api/checkout/cart/route.ts',{
    '../../../lib/cms':{getCmsContent:async()=>({products})}, '../../../lib/cart':cart,
    '../../../lib/auth':{member:async()=>user,memberProvider:u=>u.provider},
    '../../../lib/customer-profile':{getCustomerProfile:async()=>({name:'Test'})},
    '../../../lib/orders':{getOrCreateMemberCustomer:async()=>'cus_test'},
    '../../../lib/stripe':{stripeCheckoutReady:()=>true,shippingFeeSatang:()=>5000,stripeClient:()=>({checkout:{sessions:{create:async(data,options)=>{calls.push({data,options});return {url:'https://checkout.stripe.com/c/pay/test'};}}}})},
  });
  const request = (value=items,origin='https://valleys-darley.vercel.app')=>new Request('https://valleys-darley.vercel.app/api/checkout/cart',{method:'POST',headers:{origin},body:new URLSearchParams({items:JSON.stringify(value),checkoutToken:'00000000-0000-4000-8000-000000000000'})});
  assert.equal((await route.POST(request())).status,303);
  assert.equal(calls[0].data.line_items.length,2);
  assert.equal(calls[0].data.line_items[0].price_data.unit_amount,10000);
  assert.equal(calls[0].data.line_items[1].quantity,3);
  assert.equal(calls[0].data.shipping_options.length,1);
  assert.equal(calls[0].data.shipping_options[0].shipping_rate_data.fixed_amount.amount,5000);
  assert.equal(calls[0].data.metadata.memberId,'google:test');
  await route.POST(request()); assert.equal(calls[0].options.idempotencyKey,calls[1].options.idempotencyKey);
  assert.equal((await route.POST(request(items,'https://evil.example'))).status,403);
  assert.equal((await route.POST(request([...items,items[0]]))).status,400);
  const before=calls.length; await route.POST(request([{...items[1],quantity:4}])); assert.equal(calls.length,before);
  user=null; assert.match((await route.POST(request())).headers.get('location'),/login\?next=%2Fcart/);
  console.log('Cart validation, server prices, stock, totals, one shipping fee, ownership, origin and idempotency passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
