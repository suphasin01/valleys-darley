const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText, filename);
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const {ReceiptDialog} = require('../app/components/ReceiptDialog.tsx');
test('receipt retains real amounts and has a distinct accessible title per dialog', () => {
  const receipt = { number:'EXAMPLE',date:'19/10/2026',customer:'Example',address:'Example address',currency:'THB',items:[{name:'Ring',quantity:2,total:100000}],subtotal:100000,shipping:5000,discount:0,tax:0,total:105000 };
  const html = renderToStaticMarkup(React.createElement('div',null,React.createElement(ReceiptDialog,{receipt}),React.createElement(ReceiptDialog,{receipt})));
  const labels = [...html.matchAll(/aria-labelledby="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(labels.length,2); assert.notEqual(labels[0],labels[1]);
  assert.ok(html.includes('1,050.00') && html.includes('Ring × 2'));
  assert.ok(html.includes('Not a tax invoice.') && html.includes('Close receipt'));
});
test('print layout removes surrounding page flow instead of leaving blank pages', () => {
  const css=fs.readFileSync('app/globals.css','utf8');
  assert.ok(css.includes('*:not(.receipt-print):not(.receipt-print *):not(:has(.receipt-print[open]))'));
  assert.ok(css.includes('.receipt-print[open] { position: static;'));
});
