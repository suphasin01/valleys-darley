const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', source)(id => id in dependencies ? dependencies[id] : require(id), mod, mod.exports);
  return mod.exports;
}
(async () => {
  const previous = process.env.BLOB_READ_WRITE_TOKEN;
  process.env.BLOB_READ_WRITE_TOKEN = 'test-storage';
  let stored;
  try {
    const cms = load('app/lib/cms.ts', { '@vercel/blob': {
      list: async () => ({ blobs: [{ url: 'https://example.com/cms' }] }),
      get: async () => ({ stream: new Response(JSON.stringify(stored)).body }),
      put: async (_, json) => { stored = JSON.parse(json); },
    }});
    stored = structuredClone(cms.defaultCmsContent);
    const content = await cms.getCmsContent();
    content.products[0] = { ...content.products[0], name: 'Updated piece', description: 'Updated description', priceBaht: 3990, published: false };
    content.products.push({ id: 'new-piece', name: 'New piece', description: 'New description', image: '/images/collection-overview.png', link: '/contact', published: true, priceBaht: 2500 });
    await cms.saveCmsContent(content);
    const reloaded = await cms.getCmsContent();
    assert.equal(reloaded.products[0].name, 'Updated piece');
    assert.equal(reloaded.products[0].priceBaht, 3990);
    assert.equal(reloaded.products[0].published, false);
    assert.equal(reloaded.products.at(-1).id, 'new-piece');
    assert.equal(reloaded.products.at(-1).priceBaht, 2500);
    const purchase = load('app/lib/purchase.ts');
    assert.equal(purchase.purchaseSelection(reloaded.products[0], undefined, 1), null);
    assert.equal(purchase.purchaseSelection(reloaded.products.at(-1), undefined, 2).amount, 250000);
    assert.equal(purchase.purchaseSelection({ ...reloaded.products.at(-1), priceBaht: undefined }, undefined, 1), null);
    let authorized = true;
    const route = load('app/api/admin/content/route.ts', {
      'next/server': { NextResponse: { json: (body, options = {}) => Response.json(body, options) } },
      '../../../lib/cms': cms,
      '../../../lib/admin-auth': { adminSession: async () => authorized },
    });
    const request = (body, origin = 'https://shop.example') => new Request('https://shop.example/api/admin/content', { method: 'PUT', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    authorized = false;
    assert.equal((await route.PUT(request(reloaded))).status, 401);
    authorized = true;
    assert.equal((await route.PUT(request(reloaded, 'https://evil.example'))).status, 403);
    assert.equal((await route.PUT(request({ ...reloaded, products: [{ ...reloaded.products[0], priceBaht: 1 }] }))).status, 400);
    assert.equal((await route.PUT(request({ ...reloaded, products: [{ ...reloaded.products[0], image: 'javascript:alert(1)' }] }))).status, 400);
    assert.equal((await route.PUT(request(reloaded))).status, 200);
    console.log('Native CMS persistence, prices, visibility, authorization and checkout tests passed');
  } finally {
    if (previous === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = previous;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
