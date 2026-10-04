const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const mod = {exports:{}};
  new Function('require','module','exports',source)(id=>id in dependencies?dependencies[id]:require(id),mod,mod.exports);
  return mod.exports;
}
const purchase = load('app/lib/purchase.ts');
const product = {id:'ring-1',name:'Ring',description:'Test',image:'/images/test.png',published:true,variants:[{id:2,label:'White / US 6',sku:'SKU',price:3990,available:5}]};
assert.equal(purchase.purchaseSelection(product,'2',2).amount,399000);
for (const [variant,qty] of [['3',1],['2',6],['2',0],['2',1.5]]) assert.equal(purchase.purchaseSelection(product,variant,qty),null);
assert.equal(purchase.purchaseSelection({...product,published:false},'2',1),null);
assert.equal(purchase.purchaseSelection({...product,variants:[{...product.variants[0],price:NaN}]},'2',1),null);
assert.equal(purchase.purchaseSelection({...product,variants:[{...product.variants[0],price:10.001}]},'2',1),null);
const auth = load('app/lib/auth.ts',{'next/headers':{cookies:async()=>({get:()=>undefined})}});
assert.equal(auth.safeMemberNext('/checkout?product=ring-1&quantity=2&variant=2'),'/checkout?product=ring-1&quantity=2&variant=2');
assert.equal(auth.safeMemberNext('/orders'),'/orders');
for (const next of ['https://evil.example','//evil.example','/checkout?product=ring-1&variant=2&variant=3','/checkout?product=ring-1&quantity=100','/checkout?product=ring-1&next=https://evil.example']) assert.equal(auth.safeMemberNext(next),'/account');
(async()=>{
  let user={sub:'google:test',name:'Test',provider:'google'}; let live=false; let selected=product; const calls=[];
  const route=load('app/api/checkout/route.ts',{
    '../../lib/cms':{getCmsContent:async()=>({products:[selected]})},
    '../../lib/stripe':{shippingFeeSatang:()=>5000,stripeCheckoutReady:()=>true,stripeTestMode:()=>!live,stripeClient:()=>({checkout:{sessions:{create:async(data,options)=>{calls.push({data,options});return {url:'https://checkout.stripe.com/c/pay/test'};}}}})},
    '../../lib/auth':{member:async()=>user,memberProvider:()=>user.provider},
    '../../lib/orders':{getOrCreateMemberCustomer:async()=> 'cus_test'},
    '../../lib/customer-profile':{getCustomerProfile:async()=>({name:'Test'})},
    '../../lib/purchase':purchase,
  });
  const request=(extra={},origin='https://valleys-darley.vercel.app')=>new Request('https://valleys-darley.vercel.app/api/checkout',{method:'POST',headers:{origin},body:new URLSearchParams({productId:'ring-1',variantId:'2',quantity:'2',checkoutToken:'00000000-0000-4000-8000-000000000000',...extra})});
  assert.equal((await route.POST(request())).status,303);
  assert.equal(calls[0].data.line_items[0].price_data.unit_amount,399000);
  assert.equal(calls[0].data.line_items[0].quantity,2);
  assert.equal(calls[0].data.metadata.variantLabel,'White / US 6');
  assert.equal(calls[0].data.metadata.memberId,'google:test');
  await route.POST(request()); assert.equal(calls[0].options.idempotencyKey,calls[1].options.idempotencyKey);
  assert.equal((await route.POST(request({},'https://evil.example'))).status,403);
  const before=calls.length; await route.POST(request({quantity:'6'})); assert.equal(calls.length,before);
  live=true; assert.equal((await route.POST(request())).status,303); assert.equal(calls.length,before+1);
  live=false; user=null;
  const login=(await route.POST(request())).headers.get('location'); assert.match(decodeURIComponent(login),/variant=2/);
  const owner=load('app/lib/orders.ts',{'./auth':{},'./stripe':{},'./customer-profile':{}}).ownsOrder;
  assert.equal(owner({metadata:{source:'valleys-darley',memberId:'owner'}},{sub:'other'}),false);
  assert.equal(owner({metadata:{source:'another-shop',memberId:'owner'}},{sub:'owner'}),false);
  assert.equal(owner({metadata:{source:'valleys-darley',memberId:'owner'}},{sub:'owner'}),true);
  const originalSecret=process.env.STRIPE_WEBHOOK_SECRET; process.env.STRIPE_WEBHOOK_SECRET='test-secret';
  try {
    let invalid=false; let fail=false; const updates=[];
    const event={id:'evt_test',type:'checkout.session.completed',data:{object:{object:'checkout.session',id:'cs_test_123',payment_status:'paid',metadata:{source:'valleys-darley'}}}};
    const webhook=load('app/api/stripe/webhook/route.ts',{'../../../lib/stripe':{stripeClient:()=>({webhooks:{constructEvent:()=>{if(invalid)throw Error('invalid');return event;}},checkout:{sessions:{retrieve:async()=>({payment_status:'paid'}),update:async(id,data,options)=>{if(fail)throw Error('network');updates.push({id,data,options});}}}})}});
    const webhookRequest=()=>new Request('https://valleys-darley.vercel.app/api/stripe/webhook',{method:'POST',headers:{'stripe-signature':'test'},body:'{}'});
    invalid=true; assert.equal((await webhook.POST(webhookRequest())).status,400);assert.equal(updates.length,0);
    invalid=false; assert.equal((await webhook.POST(webhookRequest())).status,200);assert.equal(updates[0].data.metadata.paymentOutcome,'paid');
    fail=true; assert.equal((await webhook.POST(webhookRequest())).status,503);
  } finally {if(originalSecret===undefined)delete process.env.STRIPE_WEBHOOK_SECRET;else process.env.STRIPE_WEBHOOK_SECRET=originalSecret;}
  console.log('Checkout variants, stock validation, ownership, redirects, idempotency and webhook tests passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
