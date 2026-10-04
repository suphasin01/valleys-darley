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
  } finally {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.LINE_SHOPPING_API_KEY; else process.env.LINE_SHOPPING_API_KEY = originalKey;
  }
  console.log('LINE SHOPPING safety tests passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
