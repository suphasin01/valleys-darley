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
const { swirlArtwork } = require('../app/lib/swirl-artwork.ts');
const { CustomDesignForm } = require('../app/components/CustomDesignForm.tsx');
const { SwirlBowGallery } = require('../app/components/SwirlBowGallery.tsx');

test('all eight Swirl Bow combinations map to their labelled source front and underside', async () => {
  const manifest = JSON.parse(fs.readFileSync('public/images/figma/swirl-artwork-manifest.json', 'utf8'));
  assert.equal(manifest.variants.length, 8);
  const fronts = new Set(), undersides = new Set();
  const sharp = require('sharp');
  for (const entry of manifest.variants) {
    const source = Object.fromEntries(entry.variant.split(', ').map(part => part.split('=')));
    const artwork = swirlArtwork({ plating: source.Plating === 'Gold' ? '18K gold plated' : 'Rhodium', gemstone: source.Gemstone, finish: source.Finish === 'High Polish' ? 'High polish' : source.Finish });
    assert.ok(artwork);
    for (const part of ['front', 'underneath']) {
      assert.equal(artwork[part], '/images/figma/' + entry[part].file);
      const metadata = await sharp('public' + artwork[part]).metadata();
      assert.equal(metadata.width, entry[part].width); assert.equal(metadata.height, entry[part].height);
      assert.ok(metadata.hasAlpha);
    }
    fronts.add(artwork.front); undersides.add(artwork.underneath);
  }
  assert.equal(fronts.size, 8); assert.equal(undersides.size, 8);
  assert.equal(swirlArtwork({ plating: 'Rhodium', gemstone: 'Pink Tourmaline', finish: 'Matte' }), null);
});
test('Swirl Bow shows the original underside and does not invent locket or engraving controls', () => {
  const html = renderToStaticMarkup(React.createElement(CustomDesignForm, { id: 'swirl-bow', design: { name: 'The Swirl Bow Necklace', left: '', top: '' } }));
  assert.ok(html.includes('underneath') && html.includes('swirl-gold-aquamarine-high-polish-front.webp'));
  assert.ok(html.includes('Green Amethyst'));
  assert.ok(!html.includes('Pink Tourmaline'));
  assert.ok(!html.includes('Star gemstone') && !html.includes('La Graziela') && !html.includes('Up to 40 characters'));
  assert.ok(!html.includes('Open locket'));
  assert.ok(html.includes('/contact?custom=swirl-bow'));
});
test('invalid artwork cannot silently show a different available Swirl Bow combination', () => {
  const html = renderToStaticMarkup(React.createElement(SwirlBowGallery, { plating: 'Unknown', gemstone: 'Green Amethyst', finish: 'Matte' }));
  assert.ok(html.includes('Artwork is unavailable'));
  assert.ok(!html.includes('<img'));
});
