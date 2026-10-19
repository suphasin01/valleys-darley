const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.tsx'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, filename);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { AccountAddress } = require('../app/components/AccountAddress.tsx');
const profile = { name: 'Example recipient', email: 'example@example.com', phone: '0812345678', address: 'Example street', subdistrict: 'Example subdistrict', district: 'Example district', province: 'Bangkok', postalCode: '10110' };

test('account address initially shows the saved address without an editable form', () => {
  const html = renderToStaticMarkup(React.createElement(AccountAddress, { profile }));
  assert.ok(html.includes('aria-expanded="false"'));
  assert.ok(html.includes('Example street'));
  assert.ok(!html.includes('<form'));
});

test('inline editor posts required fields to the existing protected profile route', () => {
  const original = React.useState;
  React.useState = () => [true, () => {}];
  try {
    const html = renderToStaticMarkup(React.createElement(AccountAddress, { profile }));
    assert.ok(html.includes('aria-expanded="true"'));
    assert.ok(html.includes('Cancel') && html.includes('Save'));
    assert.ok(html.includes('action="/api/customer/profile"') && html.includes('method="post"'));
    for (const name of Object.keys(profile)) assert.ok(html.includes(`name="${name}"`), name);
    assert.ok(html.includes('name="next" value="/account"'));
    assert.ok(html.includes('pattern="[0-9]{5}"'));
    assert.ok(!html.includes('name="marketingConsent"') && !html.includes('name="privacyAcknowledged"'));
    assert.ok(html.includes('value="TH"'));
  } finally { React.useState = original; }
});
