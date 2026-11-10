const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { catalogArtwork } = require('../app/lib/editorial-images.ts');
const { CatalogPhoto } = require('../app/components/CatalogPhoto.tsx');
test('supplied studio photos and detail hovers replace original demo photography', () => {
  const artwork = catalogArtwork({ id: 'pearl-ring', image: '/images/ar-ring-silver-v2.png' });
  assert.equal(artwork.primary, '/assets/products/rosette-ribbon-mother-of-pearl-ring/card.jpg');
  assert.equal(artwork.hover, '/assets/products/rosette-ribbon-mother-of-pearl-ring/shared/02.jpg');
  assert.ok(fs.statSync('public' + artwork.hover).size > 1000);
  assert.equal(catalogArtwork({ id: 'heart-locket', image: '/images/product-closeup-2.png' }).hover, '/assets/products/ruffle-heart-locket-necklace/02.jpg');
});
test('CMS-uploaded photography wins and never inherits unrelated demo imagery', () => {
  assert.deepEqual(catalogArtwork({ id: 'pearl-ring', image: '/images/new-upload.webp' }), { primary: '/images/new-upload.webp', hover: undefined });
  assert.deepEqual(catalogArtwork({ id: 'new-piece', image: '/images/main.webp', images: ['/images/main.webp', '/images/second.webp'] }), { primary: '/images/main.webp', hover: '/images/second.webp' });
  assert.equal(catalogArtwork({ id: 'pearl-ring', image: '/images/ar-ring-silver-v2.png', images: ['/images/user-detail.webp'] }).hover, '/images/user-detail.webp');
});
test('secondary image is decorative and remains hidden until it has loaded successfully', () => {
  const html = renderToStaticMarkup(React.createElement(CatalogPhoto, { primary: '/main.webp', hover: '/second.webp', name: 'Ring' }));
  assert.ok(html.includes('alt="Ring"') && html.includes('aria-hidden="true"'));
  assert.ok(html.includes('data-ready="false"'));
  assert.ok(!renderToStaticMarkup(React.createElement(CatalogPhoto, { primary: '/main.webp', name: 'Ring' })).includes('catalog-photo-hover'));
  const css = fs.readFileSync('app/globals.css', 'utf8');
  assert.ok(css.includes('(hover: hover) and (pointer: fine)'));
  assert.ok(css.includes('.catalog-card:focus-visible .catalog-photo-hover[data-ready="true"]'));
});
