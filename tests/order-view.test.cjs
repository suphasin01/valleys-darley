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
const { OrderDetailView } = require('../app/components/OrderDetailView.tsx');
const { orderState } = require('../app/lib/order-state.ts');
const props = { number: 'TEST001', name: 'Test Customer', date: '19/10/2026', status: 'Awaiting payment', items: [], receipt: null, testMode: true, address: '', unavailable: false };

test('an unpaid order has no receipt or paid claim', () => {
  const html = renderToStaticMarkup(React.createElement(OrderDetailView, props));
  assert.ok(!html.includes('<dialog'));
  assert.ok(!html.includes('Paid via Stripe'));
  assert.ok(html.includes('Awaiting payment'));
});
test('receipt uses actual supplied totals and customer details', () => {
  const receipt = { number: 'TEST001', date: '19/10/2026', customer: 'Test Customer', address: 'Test address', currency: 'THB', items: [], subtotal: 20000, shipping: 5000, discount: 0, tax: 0, total: 25000 };
  const html = renderToStaticMarkup(React.createElement(OrderDetailView, { ...props, status: 'Paid', receipt }));
  assert.ok(html.includes('<dialog'));
  assert.ok(html.includes('250.00'));
  assert.ok(html.includes('TEST001'));
  assert.ok(html.includes('Not a tax invoice'));
});
test('fulfillment metadata cannot make an unpaid payment appear shipped', () => {
  assert.equal(orderState({ payment_status: 'unpaid', metadata: { fulfillmentStatus: 'shipped' } }), 'waiting');
  assert.equal(orderState({ payment_status: 'paid', metadata: { fulfillmentStatus: 'shipped' } }), 'shipped');
});
