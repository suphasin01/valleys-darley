const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
function load(file,deps={}){const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;new Function('require','module','exports',code)(id=>id in deps?deps[id]:require(id),mod,mod.exports);return mod.exports;}
const catalog=load('app/lib/supplied-catalog.ts'),studio=load('app/lib/custom-studio.ts');
test('source slugs resolve to stable IDs and each catalog category filters published CMS products',()=>{
  const products=[{id:'heart-locket',name:'Heart',published:true},{id:'pearl-ring',name:'Ring',published:true},{id:'ribbon-earring',name:'Earrings',published:false},{id:'new-bracelet',name:'New bracelet',published:true}];
  assert.equal(catalog.canonicalProductId('ruffle-heart-locket-necklace'),'heart-locket');
  assert.equal(catalog.canonicalProductId('my-new-piece'),'my-new-piece');
  assert.deepEqual(catalog.productsForCategory(products,'necklace').map(p=>p.id),['heart-locket']);
  assert.deepEqual(catalog.productsForCategory(products,'bracelet').map(p=>p.id),['new-bracelet']);
  assert.equal(catalog.productsForCategory(products,'earrings').length,0);
  assert.equal(catalog.productsForCategory(products,'be-present').length,2);
  assert.equal(catalog.productsForCategory(products,'new-in').length,3);
});
test('display prices use actual base or in-stock variant prices, never the imported demo catalog',()=>{
  assert.equal(catalog.cmsPriceLabel({priceBaht:100}),'฿100.00');
  assert.equal(catalog.cmsPriceLabel({priceBaht:100,variants:[{price:250,available:2},{price:999,available:0},{price:350,available:1}]}),'฿250.00 – ฿350.00');
  assert.equal(catalog.cmsPriceLabel({variants:[{price:250,available:0}]}),'Currently unavailable');
  assert.equal(catalog.cmsPriceLabel({}),'Enquire about this piece');
});
test('all four custom studios validate actual supported selections and reject forged options',()=>{
  assert.equal(studio.studioPieces.length,4);
  for(const piece of studio.studioPieces){
    const options=Object.fromEntries(Object.entries(piece.options).map(([key,values])=>[key,values[0]]));
    assert.deepEqual(studio.validateStudioSelection(piece,options),options);
    assert.equal(studio.validateStudioSelection(piece,{...options,price:1}),null);
    assert.equal(studio.validateStudioSelection(piece,{...options,plating:'invalid'}),null);
    assert.equal(studio.validateStudioSelection(piece,{...options,notes:'x'.repeat(301)}),null);
    assert.equal(studio.validateStudioSelection(piece,null),null);
    const html=fs.readFileSync(`public/custom-made/builder/${piece.file}`,'utf8');
    assert.ok(html.includes('request quote') && !html.includes('added to your bag.'));
    assert.ok(!html.includes('getUserMedia'));
    assert.ok(fs.statSync('public'+piece.image).size>1000);
  }
  const piece=studio.studioPiece('heart-locket');
  const base=Object.fromEntries(Object.entries(piece.options).map(([key,values])=>[key,values[0]]));
  assert.equal(studio.validateStudioSelection(piece,{...base,engraving:'Add engraving'}),null);
  assert.ok(studio.validateStudioSelection(piece,{...base,engraving:'Add engraving','engraving text':'My Darling','engraving font':'La Graziela'}));
  assert.equal(studio.validateStudioSelection(piece,{...base,engraving:'Add engraving','engraving text':'x'.repeat(41),'engraving font':'La Graziela'}),null);
});
test('custom iframe bridge checks both origin and window, and sends a real inquiry rather than a mock order',()=>{
  const code=fs.readFileSync('app/components/CustomStudio.tsx','utf8');
  for(const text of ['event.origin!==window.location.origin','event.source!==frame.current?.contentWindow','validateStudioSelection','<HelpContactForm','observer?.disconnect()'])assert.ok(code.includes(text),text);
  assert.ok(!code.includes('cart.add('));
  const inquiry=fs.readFileSync('app/components/HelpContactForm.tsx','utf8');
  assert.ok(inquiry.includes("fetch('/api/inquiries'"));
});
test('tracking rejects cross-origin, anonymous and other-account barcodes before contacting the carrier',async()=>{
  let user=null,lookups=0;
  const route=load('app/api/track/route.ts',{'../../lib/auth':{member:async()=>user},'../../lib/orders':{memberOrders:async()=>[{payment_status:'paid',metadata:{trackingNumber:'EE123456789TH'}},{payment_status:'unpaid',metadata:{trackingNumber:'EE111111111TH'}}]},'../../lib/thailand-post':{normalizeTrackingNumber:value=>/^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(value)?value:null,trackThailandPost:async()=>{lookups++;return [{status:'accepted',date:'date'}];}}});
  const request=(barcode='EE123456789TH',origin='https://shop.example')=>new Request('https://shop.example/api/track',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({barcode})});
  assert.equal((await route.POST(request(undefined,'https://evil.example'))).status,403);
  assert.equal((await route.POST(request())).status,401);user={sub:'member'};
  assert.equal((await route.POST(request('invalid'))).status,400);
  assert.equal((await route.POST(request('EE987654321TH'))).status,404);
  assert.equal((await route.POST(request('EE111111111TH'))).status,404);assert.equal(lookups,0);
  const previous=process.env.THAILAND_POST_TOKEN_KEY;process.env.THAILAND_POST_TOKEN_KEY='test-only';
  try{const response=await route.POST(request());assert.equal(response.status,200);assert.equal((await response.json()).events.length,1);assert.equal(lookups,1);}finally{if(previous===undefined)delete process.env.THAILAND_POST_TOKEN_KEY;else process.env.THAILAND_POST_TOKEN_KEY=previous;}
});
test('all source page paths have real adapters, and static-only account/cart mocks were not imported',()=>{
  for(const file of ['app/shop/page.tsx','app/shop/[category]/page.tsx','app/account/signup/page.tsx','app/order/confirmed/page.tsx','app/track/page.tsx','app/api/track/route.ts'])assert.ok(fs.existsSync(file),file);
  assert.ok(!fs.existsSync('app/components/CartProvider.js'));
  assert.ok(!fs.existsSync('content/products.json'));
  const css=fs.readFileSync('app/supplied-ui.css','utf8');assert.ok(!/::(?:before|after):not\(/.test(css));assert.ok(css.includes(':not(.native-ui, .native-ui *)'));
});
