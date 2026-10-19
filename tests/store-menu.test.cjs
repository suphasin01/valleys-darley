const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, filename);
const { shopMenuLinks, toggleMenuSection } = require('../app/lib/store-menu.ts');
test('Shop submenu contains the six Preview destinations', () => {
  assert.deepEqual(shopMenuLinks.map(([label]) => label), ['SHOP ALL', 'NEW IN', 'NECKLACE', 'RING', 'EARRINGS', 'BRACELET']);
  assert.equal(shopMenuLinks[0][1], '/collections');
  assert.equal(shopMenuLinks[1][1], '/collections#new-in');
  for (const [,href] of shopMenuLinks) assert.ok(href.startsWith('/collections'));
});
test('Shop and Collection behave as an exclusive toggle, matching Preview', () => {
  for (const current of [null, 'shop', 'collection']) for (const requested of ['shop', 'collection']) assert.equal(toggleMenuSection(current, requested), current === requested ? null : requested);
});
test('Header keeps controlled accessibility states and resets the submenu on reopen', () => {
  const source = fs.readFileSync('app/components/Header.tsx', 'utf8');
  for (const id of ['shop-navigation', 'collection-navigation']) assert.ok(source.includes(`aria-controls="${id}"`) && source.includes(`id="${id}"`));
  assert.ok(source.includes('setMenuSection(null); setIsOpen(true)'));
  assert.ok(source.includes("hidden={menuSection !== 'shop'}") && source.includes("hidden={menuSection !== 'collection'}"));
  assert.ok(source.includes("event.key === 'Escape'"));
});
