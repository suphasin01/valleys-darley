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
const About = require('../app/about/page.tsx').default;
const { Footer } = require('../app/components/Footer.tsx');

test('About follows the preview story order without duplicating the meaning paragraph', async () => {
  const html = renderToStaticMarkup(await About());
  assert.ok(html.includes('Enter to the World'));
  assert.equal((html.match(/valleydarley comes from/g) || []).length, 1);
  assert.ok(html.indexOf('/assets/about/keepsakes.jpg') < html.indexOf('imagination leads.'));
  assert.ok(html.indexOf('imagination leads.') < html.indexOf('craft follows.'));
  assert.ok(html.indexOf('craft follows.') < html.indexOf('id="packaging"'));
  assert.ok(html.includes('alt="Where to find us – at Tres Siam Square Soi 5"'));
  for (const id of ['stories', 'packaging', 'where-to-find-us']) assert.ok(html.includes(`id="${id}"`));
  for (const image of ['hero.jpg','valley.jpg','keepsakes.jpg','where.png','bows.png']) assert.ok(fs.statSync(`public/assets/about/${image}`).size > 1000);
});

test('About footer links target their corresponding sections instead of an unrelated page', () => {
  const html = renderToStaticMarkup(Footer({ locale: 'en' }));
  for (const id of ['stories', 'packaging', 'where-to-find-us']) assert.ok(html.includes(`href="/about#${id}"`));
  assert.ok(html.includes('our packaging'));
});
