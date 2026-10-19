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
const Help = require('../app/help/page.tsx').default;
const { ProductGuide } = require('../app/components/ProductGuide.tsx');

test('Help preserves section destinations, original artwork and working contact links', () => {
  const html = renderToStaticMarkup(React.createElement(Help));
  for (const id of ['contact', 'after-sales', 'shipping', 'returns', 'care', 'size-guide', 'ring-size']) assert.ok(html.includes(`id="${id}"`));
  for (const file of ['help-title.webp', 'help-care.png', 'help-necklace-size.png', 'help-ring-size.png', 'help-ribbon.png']) {
    assert.ok(html.includes(file));
    assert.ok(fs.statSync(`public/images/figma/${file}`).size > 1000);
  }
  assert.ok(html.includes('href="mailto:valleydarley@gmail.com"'));
  assert.ok(html.includes('href="/orders"'));
  assert.ok(html.includes('Online checkout currently supports Thailand delivery'));
  assert.ok(!html.includes('free international shipping'));
});

test('Help and the product care overlay share the complete bead and metal care copy', () => {
  const help = renderToStaticMarkup(React.createElement(Help));
  const overlay = renderToStaticMarkup(React.createElement(ProductGuide, { kind: 'care' }));
  for (const phrase of ['How to care for stone, pearl and crystal jewelry', 'How to care for metal jewelry', 'Cleaning and storage', 'Any residue left on the surface may react with the jewelry']) {
    assert.ok(help.includes(phrase));
    assert.ok(overlay.includes(phrase));
  }
});
