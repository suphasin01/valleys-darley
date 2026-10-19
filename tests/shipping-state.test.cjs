const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { postalUpdate, postalEventTime } = require('../app/lib/shipping-state.ts');
const { orderState } = require('../app/lib/order-state.ts');
const event = (status, date = '19/10/2569 10:00:00+07:00') => ({ status, date, description: 'Test event', detail: '', location: 'Test office' });
test('packed is distinct from shipped and cannot imply payment', () => {
  assert.equal(orderState({ payment_status: 'paid', metadata: { fulfillmentStatus: 'packed' } }), 'packed');
  assert.equal(orderState({ payment_status: 'unpaid', metadata: { fulfillmentStatus: 'packed' } }), 'waiting');
});
test('preload, unknown and empty events do not dispatch a parcel', () => {
  assert.equal(postalUpdate([]), null);
  for (const code of ['101', '104', '999']) assert.equal(postalUpdate([event(code)]).fulfillment, null);
});
test('physical acceptance and delivery map to the right order state', () => {
  assert.equal(postalUpdate([event('103')]).fulfillment, 'shipped');
  assert.equal(postalUpdate([event('201')]).fulfillment, 'shipped');
  assert.equal(postalUpdate([event('501')]).fulfillment, 'completed');
});
test('Buddhist/Gregorian dates and unsorted events are handled correctly', () => {
  assert.equal(postalEventTime('19/10/2569 10:00:00+07:00'), postalEventTime('19/10/2026 10:00:00+07:00'));
  assert.equal(postalUpdate([event('501', '20/10/2569 10:00:00+07:00'), event('103')]).fulfillment, 'completed');
});
