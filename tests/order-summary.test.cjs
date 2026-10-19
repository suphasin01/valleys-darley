const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
};
const { orderSummary } = require('../app/lib/order-summary.ts');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { OrderSummaryCard } = require('../app/components/OrderSummaryCard.tsx');
const products = [
  { id: 'ring', name: 'Pearl Ring', image: '/ring.webp' },
  { id: 'pearl', name: 'Pearl', image: '/pearl.webp' },
  { id: 'earrings', name: 'Ribbon Earrings', image: '/earrings.webp' },
];
const session = { id: 'cs_test_ORDER001', created: 1792368000, amount_total: 45000, currency: 'thb', payment_status: 'unpaid', status: 'open', metadata: { productId: 'ring', productName: 'Original Ring Name', fulfillmentStatus: 'shipped', trackingNumber: 'TEST' } };
test('summary uses the purchased ID and actual amount, not a product price or unrelated image', () => {
  const result = orderSummary(session, products);
  assert.deepEqual(result.images, [{ src: '/ring.webp', name: 'Pearl Ring' }]);
  assert.equal(result.name, 'Original Ring Name');
  assert.equal(result.amount, 45000);
  assert.equal(result.status, 'Awaiting payment');
  assert.equal(result.tracking, false);
});
test('cart matching respects product-name boundaries and leaves unknown items without a photo', () => {
  const cart = orderSummary({ ...session, metadata: { cart: 'true', productName: 'Pearl Ring (White) × 2, Ribbon Earrings × 1' } }, products);
  assert.deepEqual(cart.images.map(image => image.src), ['/ring.webp', '/earrings.webp']);
  assert.deepEqual(orderSummary({ ...session, metadata: { productName: 'Unknown' } }, products).images, []);
});
test('summary links go to the owned order route; tracking is shown only after payment', () => {
  const result = orderSummary({ ...session, payment_status: 'paid' }, products);
  const html = renderToStaticMarkup(React.createElement(OrderSummaryCard, { order: result }));
  assert.ok(html.includes('/orders/cs_test_ORDER001'));
  assert.ok(html.includes('/tracking/cs_test_ORDER001'));
  assert.ok(html.includes('450.00'));
  assert.equal(orderSummary({ ...session, status: 'expired' }, products).status, 'Payment expired');
});
