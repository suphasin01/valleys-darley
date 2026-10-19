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
const { heartArtwork } = require('../app/lib/heart-artwork.ts');
const defaults = { plating: '18K gold plated', gemstone: 'Aquamarine', finish: 'High polish', star: 'Sapphire', engraving: '' };

test('heart gallery uses the separately exported front, inside and engraving for each metal', () => {
  for (const [plating, metal] of [['18K gold plated', 'gold'], ['Rhodium', 'rhodium']]) {
    const html = renderToStaticMarkup(React.createElement(CustomLocketGallery, { ...defaults, plating }));
    const artwork = heartArtwork({ ...defaults, plating });
    for (const part of ['front', 'inside', 'engraving']) {
      const file = artwork[part];
      assert.ok(html.includes(file)); assert.ok(fs.statSync('public' + file).size > 1000);
    }
    assert.ok(html.includes('Open locket') && html.includes('Closed') && html.includes('Inside the lid'));
    assert.ok(html.includes('aria-pressed="true"'));
  }
});
test('all supported combinations have mapped original artwork and engraving is rendered safely', () => {
  const html = renderToStaticMarkup(React.createElement(CustomLocketGallery, { ...defaults, gemstone: 'Pink Tourmaline', finish: 'Matte', engraving: '<script>alert(1)</script>' }));
  assert.ok(html.includes('heart-gold-pink-tourmaline-matte-sapphire.webp'));
  assert.ok(!html.includes('their exact artwork is not shown yet'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('heart-gold-engraving.webp'));
});
test('every original variant maps to the correct source label, with distinct front images and finish-specific lids', async () => {
  const manifest = JSON.parse(fs.readFileSync('public/images/figma/heart-artwork-manifest.json', 'utf8'));
  assert.equal(manifest.variants.length, 16);
  const fronts = new Set(), lids = new Set(), sourceImages = new Set();
  const sharp = require('sharp');
  for (const entry of manifest.variants) {
    const source = Object.fromEntries(entry.variant.split(', ').map(part => part.split('=')));
    const artwork = heartArtwork({ plating: source.Plating === 'Gold' ? '18K gold plated' : 'Rhodium', gemstone: source.Gemstone, finish: source.Finish === 'High Polish' ? 'High polish' : source.Finish, star: source.Star });
    assert.ok(artwork);
    assert.equal(artwork.front, '/images/figma/' + entry.front.file);
    assert.equal(artwork.inside, '/images/figma/' + entry.inside.file);
    for (const part of ['front', 'inside']) {
      const metadata = await sharp('public' + artwork[part]).metadata();
      assert.equal(metadata.width, entry[part].width);
      assert.equal(metadata.height, entry[part].height);
      assert.ok(metadata.hasAlpha);
    }
    fronts.add(artwork.front); lids.add(artwork.inside); sourceImages.add(entry.front.sha256);
  }
  assert.equal(fronts.size, 16); assert.equal(sourceImages.size, 16); assert.equal(lids.size, 4);
  assert.equal(heartArtwork({ ...defaults, gemstone: 'Green Amethyst' }), null);
  assert.equal(heartArtwork({ ...defaults, star: '__proto__' }), null);
});
test('custom design keeps specification controls, 40-character engraving and actual guide dialogs without a fake purchase', () => {
  const html = renderToStaticMarkup(React.createElement(CustomDesignForm, { id: 'heart-locket', design: { name: 'The Ruffle Heart Locket Necklace', left: '', top: '' } }));
  assert.ok(html.includes('maxLength="40"') || html.includes('maxlength="40"'));
  assert.ok(html.includes('Necklace size guide') && html.includes('Care instruction'));
  assert.ok(html.includes('/contact?custom=heart-locket'));
  assert.ok(html.includes('No payment is taken'));
  assert.ok(!html.includes('Green Amethyst'));
});
