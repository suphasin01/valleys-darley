const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
};
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { publicCartProducts } = require('../app/lib/cart-catalog.ts');
const { CartDrawerContents } = require('../app/components/CartDrawerContents.tsx');
const { readCart, saveCart, requestCartOpen } = require('../app/lib/cart-storage.ts');
const product = { id: 'sample-ring', name: 'Sample ring', image: '/ring.webp', description: 'Ring', link: '/contact', published: true, priceBaht: 390 };
const props = { items: [{ productId: product.id, variantId: '', quantity: 2 }], products: [product], shipping: 5000, status: 'ready', error: '', update() {}, close() {} };

test('the public cart catalog excludes drafts and non-catalog fields', () => {
  const products = publicCartProducts([{ ...product, internalNotes: 'PRIVATE', variants: [{ id: 1, sku: 'S1', price: 390, available: 2, secret: 'PRIVATE' }] }, { ...product, id: 'draft', published: false }]);
  assert.equal(products.length, 1);
  assert.ok(!JSON.stringify(products).includes('PRIVATE'));
  assert.equal(products[0].variants[0].available, 2);
});
test('drawer totals and checkout use the actual quantities, prices and configured shipping', () => {
  const html = renderToStaticMarkup(React.createElement(CartDrawerContents, props));
  assert.ok(html.includes('780.00'));
  assert.ok(html.includes('50.00'));
  assert.ok(!html.includes('FREE SHIPPING'));
  assert.ok(html.includes('/checkout/cart?items='));
  assert.ok(html.includes('View bag'));
});
test('empty, unavailable and failed bags do not offer checkout', () => {
  for (const override of [{ items: [] }, { products: [] }, { status: 'error' }]) {
    const html = renderToStaticMarkup(React.createElement(CartDrawerContents, { ...props, ...override }));
    assert.ok(!html.includes('/checkout/cart?items='));
  }
});
test('cart storage preserves the existing key and emits changes only after a successful save', () => {
  let value = '[]'; const events = [];
  global.localStorage = { getItem: key => { assert.equal(key, 'valleys-cart-v1'); return value; }, setItem: (key, next) => { assert.equal(key, 'valleys-cart-v1'); value = next; } };
  global.window = { dispatchEvent: event => { events.push(event.type); } };
  global.document = { getElementById: () => ({}) };
  saveCart(props.items); assert.deepEqual(readCart(), props.items);
  assert.equal(requestCartOpen(), true);
  assert.deepEqual(events, ['valleys-cart-change', 'valleys-cart-open']);
  value = '{invalid'; assert.deepEqual(readCart(), []);
  global.localStorage.setItem = () => { throw new Error('QUOTA'); };
  assert.throws(() => saveCart([])); assert.equal(events.length, 2);
  global.document.getElementById = () => null; assert.equal(requestCartOpen(), false);
  delete global.window; delete global.document; delete global.localStorage;
});
