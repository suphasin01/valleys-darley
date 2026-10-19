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
const { SavedDesignDialog } = require('../app/components/SavedDesignDialog.tsx');
test('saved sheet renders selected data and escaped notes without claiming account persistence', () => {
  const html = renderToStaticMarkup(React.createElement(SavedDesignDialog, {
    name: 'Swirl Bow', specifications: [['Product', 'Swirl Bow'], ['Gemstone', 'Green Amethyst']],
    note: '<script>not executable</script>', artwork: { front: '/front.webp', reverse: '/back.webp', reverseLabel: 'Underneath' },
  }));
  assert.ok(html.includes('<dialog') && html.includes('Your custom design'));
  assert.ok(html.includes('Green Amethyst') && html.includes('Underneath'));
  assert.ok(html.includes('&lt;script&gt;') && !html.includes('<script>'));
  assert.ok(html.includes('saved on this device') && !html.includes('saved to your account'));
  assert.ok(html.includes('Save as PDF'));
});
test('saved sheet supports text-only designs without substituting incorrect artwork', () => {
  const html = renderToStaticMarkup(React.createElement(SavedDesignDialog, { name: 'Custom', specifications: [['Product', 'Custom']], note: '', artwork: null }));
  assert.ok(!html.includes('<figure') && html.includes('Custom'));
});
