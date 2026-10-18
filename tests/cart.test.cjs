const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Compile the project's pure TypeScript helpers without adding a runtime dependency.
const previous = require.extensions['.ts'];
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, filename);
};
const { parseCart, resolveCart } = require('../app/lib/cart.ts');
if (previous) require.extensions['.ts'] = previous;
else delete require.extensions['.ts'];

const product = { id: 'test-ring', name: 'Test ring', description: '', image: '/test.png', link: '/contact', published: true, priceBaht: 100 };
const item = { productId: 'test-ring', variantId: '', quantity: 2 };

test('cart validates input boundaries and duplicate lines', () => {
  assert.deepEqual(parseCart([item]), [item]);
  for (const value of [null, [], [item, item], [{ ...item, quantity: 0 }], [{ ...item, quantity: 11 }], [{ ...item, quantity: 1.5 }], [{ ...item, productId: '../admin' }], [{ ...item, variantId: 'not-a-variant' }]]) {
    assert.equal(parseCart(value), null);
  }
});

test('checkout resolves the current CMS price in satang, never a client price', () => {
  const lines = resolveCart(parseCart([{ ...item, priceBaht: 1 }]), [product]);
  assert.equal(lines[0].selection.amount, 10000);
  assert.equal(lines[0].quantity, 2);
  assert.equal(resolveCart([item], [{ ...product, published: false }]), null);
  assert.equal(resolveCart([item], [{ ...product, priceBaht: undefined }]), null);
  assert.equal(resolveCart([item], []), null);
});

test('variant checkout respects availability and never falls back to base price', () => {
  const variantProduct = { ...product, variants: [{ id: 123, sku: 'silver', price: 120.5, available: 2 }] };
  const selected = { ...item, variantId: '123' };
  assert.equal(resolveCart([selected], [variantProduct])[0].selection.amount, 12050);
  assert.equal(resolveCart([{ ...selected, quantity: 3 }], [variantProduct]), null);
  assert.equal(resolveCart([item], [variantProduct]), null);
  assert.equal(resolveCart([selected], [product]), null);
});
