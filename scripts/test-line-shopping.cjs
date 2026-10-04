const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const source = ts.transpileModule(fs.readFileSync('app/lib/line-shopping.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleObject = { exports: {} };
new Function('require', 'module', 'exports', source)((id) => id === 'server-only' ? {} : require(id), moduleObject, moduleObject.exports);
const api = moduleObject.exports;
(async () => {
  assert.equal(api.lineTrackingUrl('javascript:alert(1)'), null);
  assert.equal(api.lineTrackingUrl('http://example.com'), null);
  assert.equal(api.lineTrackingUrl('https://user:password@example.com'), null);
  assert.equal(api.lineTrackingUrl('https://track.thailandpost.co.th/'), 'https://track.thailandpost.co.th/');
  const originalFetch = global.fetch; const originalKey = process.env.LINE_SHOPPING_API_KEY;
  try {
    delete process.env.LINE_SHOPPING_API_KEY;
    await assert.rejects(api.getLinePage('orders'), /NOT_CONFIGURED/);
    process.env.LINE_SHOPPING_API_KEY = 'test-key';
    global.fetch = async (url, options) => {
      assert.equal(url.origin, 'https://developers-oaplus.line.biz');
      assert.equal(url.searchParams.get('page'), '1');
      assert.equal(url.searchParams.get('search').length, 100);
      assert.equal(options.headers['X-API-KEY'], 'test-key');
      assert.equal(options.cache, 'no-store'); assert.equal(options.redirect, 'error');
      return { ok: true, json: async () => ({ data: [], currentPage: 1, totalPage: 0, totalRow: 0 }) };
    };
    assert.equal((await api.getLinePage('orders', -1, 'x'.repeat(150))).totalRow, 0);
    global.fetch = async () => ({ ok: false, status: 401 });
    await assert.rejects(api.getLinePage('products'), /LINE_HTTP_401/);
    global.fetch = async () => ({ ok: true, json: async () => ({ data: 'invalid' }) });
    await assert.rejects(api.getLinePage('products'), /INVALID_RESPONSE/);
    const product = id => ({ id, name: `Product ${id}`, description: '<p>From LINE</p>', imageUrls: ['https://obs-ect.line-scdn.net/test.jpg'], isDisplay: true, variants: [{ id, sku: 'SKU', price: 100, discountedPrice: 90, availableNumber: 5 }] });
    global.fetch = async url => ({ ok: true, json: async () => ({ data: [product(Number(url.searchParams.get('page')))], currentPage: Number(url.searchParams.get('page')), totalPage: 2, totalRow: 2 }) });
    assert.equal((await api.getLineCatalog()).length, 2);
    global.fetch = async url => ({ ok: true, json: async () => ({ data: [product(1)], currentPage: Number(url.searchParams.get('page')), totalPage: 2, totalRow: 2 }) });
    await assert.rejects(api.getLineCatalog(), /INCOMPLETE/);
    const mappingSource = ts.transpileModule(fs.readFileSync('app/lib/line-catalog.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const mapping = { exports: {} };
    new Function('module', 'exports', mappingSource)(mapping, mapping.exports);
    const mapped = mapping.exports.mapLineCatalog([product(1), product(2)], { 'line-1': false });
    assert.equal(mapped[0].published, false); assert.equal(mapped[1].published, true);
    assert.equal(mapped[0].description, 'From LINE'); assert.equal(mapped[0].priceMin, 90);
    assert.deepEqual(mapped[0].images, ['https://obs-ect.line-scdn.net/test.jpg']);
    assert.deepEqual(mapping.exports.mapLineCatalog([{ ...product(1), imageUrls: ['javascript:alert(1)', 'http://example.com/a.jpg', 'https://example.com/a.jpg', 'https://example.com/b.jpg'] }])[0].images, ['https://example.com/a.jpg', 'https://example.com/b.jpg']);
    assert.equal(mapping.exports.mapLineCatalog([{ ...product(1), isDisplay: false }], { 'line-1': true })[0].published, false);
    assert.equal(mapping.exports.mapLineCatalog([product(1), product(2), product(3)], { 'line-1': false }).length, 3);
    const originalBlobToken = process.env.BLOB_READ_WRITE_TOKEN;
    let stored;
    try {
      process.env.BLOB_READ_WRITE_TOKEN = 'test-blob';
      const cms = { exports: {} };
      const cmsSource = ts.transpileModule(fs.readFileSync('app/lib/cms.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
      new Function('require', 'module', 'exports', cmsSource)(id => {
        if (id === '@vercel/blob') return { list: async () => ({ blobs: [{ url: 'https://example.com/cms' }] }), get: async (_, options) => { assert.equal(options.useCache, false); return { stream: new Response(JSON.stringify(stored)).body }; }, put: async (_, json) => { stored = JSON.parse(json); } };
        if (id === './line-shopping') return { lineShoppingReady: () => true, getLineCatalog: async () => [product(1), product(2)] };
        if (id === './line-catalog') return mapping.exports;
        return require(id);
      }, cms, cms.exports);
      stored = structuredClone(cms.exports.defaultCmsContent);
      const originalProducts = structuredClone(stored.products);
      const live = await cms.exports.getCmsContent();
      assert.equal(live.products.length, 2); assert.equal(live.products[0].name, 'Product 1');
      await cms.exports.saveCmsContent({ ...live, products: [{ ...live.products[0], name: 'FORGED NAME' }], lineVisibility: { 'line-1': false } });
      assert.deepEqual(stored.products, originalProducts);
      assert.equal((await cms.exports.getCmsContent()).products[0].published, false);
      assert.equal((await cms.exports.getCmsContent()).products[1].published, true);
      assert.equal(cms.exports.localizedContent(live, 'th').products[0].name, 'Product 1');
    } finally { if (originalBlobToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN; else process.env.BLOB_READ_WRITE_TOKEN = originalBlobToken; }
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.LINE_SHOPPING_API_KEY; else process.env.LINE_SHOPPING_API_KEY = originalKey;
  }
  console.log('LINE SHOPPING safety tests passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
