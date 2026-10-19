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
const { CustomLocketGallery } = require('../app/components/CustomLocketGallery.tsx');
const { CustomDesignForm } = require('../app/components/CustomDesignForm.tsx');
const defaults = { plating: '18K gold plated', gemstone: 'Aquamarine', finish: 'High polish', star: 'Sapphire', engraving: '' };

test('heart gallery uses the separately exported front, inside and engraving for each metal', () => {
  for (const [plating, metal] of [['18K gold plated', 'gold'], ['Rhodium', 'rhodium']]) {
    const html = renderToStaticMarkup(React.createElement(CustomLocketGallery, { ...defaults, plating }));
    for (const part of ['front', 'inside', 'engraving']) {
      const file = `/images/figma/heart-${metal}-${part}.webp`;
      assert.ok(html.includes(file)); assert.ok(fs.statSync('public' + file).size > 1000);
    }
    assert.ok(html.includes('Open locket') && html.includes('Closed') && html.includes('Inside the lid'));
    assert.ok(html.includes('aria-pressed="true"'));
  }
});
test('unsupported reference artwork is disclosed and engraving is rendered safely', () => {
  const html = renderToStaticMarkup(React.createElement(CustomLocketGallery, { ...defaults, gemstone: 'Pink Tourmaline', finish: 'Matte', engraving: '<script>alert(1)</script>' }));
  assert.ok(html.includes('their exact artwork is not shown yet'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('heart-gold-engraving.webp'));
});
test('custom design keeps specification controls, 40-character engraving and actual guide dialogs without a fake purchase', () => {
  const html = renderToStaticMarkup(React.createElement(CustomDesignForm, { id: 'heart-locket', design: { name: 'The Ruffle Heart Locket Necklace', left: '', top: '' } }));
  assert.ok(html.includes('maxLength="40"') || html.includes('maxlength="40"'));
  assert.ok(html.includes('Necklace size guide') && html.includes('Care instruction'));
  assert.ok(html.includes('/contact?custom=heart-locket'));
  assert.ok(html.includes('No payment is taken'));
});
