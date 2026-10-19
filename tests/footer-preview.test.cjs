const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
};
const { renderToStaticMarkup } = require('react-dom/server');
const { Footer } = require('../app/components/Footer.tsx');
test('footer includes the Preview shop and help labels with real destinations', () => {
  const html = renderToStaticMarkup(Footer({ locale: 'en' }));
  for (const label of ['necklace', 'ring', 'earrings', 'bracelet', 'collection', 'after sale services', 'care instruction', 'shipping and return', 'size guide']) assert.ok(html.includes(`>${label}</a>`), label);
  for (const route of ['/collections', '/custom-made', '/collections/be-present', '/privacy', '/terms']) assert.ok(html.includes(`href="${route}"`));
  const help = fs.readFileSync('app/help/page.tsx', 'utf8');
  for (const anchor of ['contact', 'after-sales', 'care', 'shipping', 'size-guide']) {
    assert.ok(html.includes(`href="/help#${anchor}"`));
    assert.ok(help.includes(`id="${anchor}"`));
  }
  assert.ok(html.includes('aria-label="Footer navigation"'));
});
test('oversized footer wordmark is home-only, not appended to every short page', () => {
  const css = fs.readFileSync('app/globals.css', 'utf8');
  assert.ok(css.includes('.footer-home-brand { display: none; }'));
  assert.ok(css.includes('body:has(.figma-home) .footer-home-brand { display: block; }'));
});
