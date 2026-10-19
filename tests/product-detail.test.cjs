const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
};
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { editorialGallery } = require('../app/lib/editorial-images.ts');
const { ProductGuide } = require('../app/components/ProductGuide.tsx');
const { AddToCart } = require('../app/components/Cart.tsx');
const ring = { id: 'pearl-ring', name: 'Ring', image: '/images/ar-ring-silver-v2.png', published: true };
test('the original demo uses the three exported gallery photos while CMS uploads win', () => {
  const images = editorialGallery(ring);
  assert.equal(images.length, 3);
  for (const image of images) assert.ok(fs.statSync(path.join(__dirname, '../public', image)).size > 1000);
  assert.deepEqual(editorialGallery({ ...ring, image: '/uploaded-ring.webp', images: ['/extra.webp', '/extra.webp'] }), ['/uploaded-ring.webp', '/extra.webp']);
  assert.deepEqual(editorialGallery({ ...ring, images: ['/shop-extra.webp'] }), [images[0], '/shop-extra.webp']);
});
test('ring and care guides have labelled, initially closed native dialogs and close controls', () => {
  for (const kind of ['ring', 'necklace', 'care']) {
    const html = renderToStaticMarkup(React.createElement(ProductGuide, { kind }));
    assert.ok(html.includes('<dialog'));
    assert.ok(html.includes('aria-labelledby='));
    assert.ok(html.includes('method="dialog"'));
    assert.ok(!html.includes(' open=""'));
  }
});
test('buying controls use actual CMS variants and do not invent purchasable demo prices', () => {
  const unavailable = renderToStaticMarkup(React.createElement(AddToCart, { product: ring }));
  assert.ok(unavailable.includes('Enquire to order'));
  assert.ok(!unavailable.includes('ADD TO CART'));
  const configured = renderToStaticMarkup(React.createElement(AddToCart, { product: { ...ring, variants: [{ id: 1, label: 'US 6 · Pink', price: 390, available: 2 }, { id: 2, label: 'US 7 · White', price: 490, available: 0 }] } }));
  assert.ok(configured.includes('US 6 · Pink'));
  assert.ok(configured.includes('390'));
  assert.ok(configured.includes('US 7 · White · Sold out'));
  assert.ok(configured.includes('ADD TO CART'));
});
