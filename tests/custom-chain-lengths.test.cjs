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
const { customChainLengths, restoredChainLength } = require('../app/lib/custom-chain-lengths.ts');
const { CustomDesignForm } = require('../app/components/CustomDesignForm.tsx');
test('both verified custom necklaces offer exactly the three Preview chain lengths', () => {
  assert.deepEqual(customChainLengths, ['37–42 cm', '40–45 cm', '45–50 cm']);
  for (const id of ['heart-locket', 'swirl-bow']) {
    const html = renderToStaticMarkup(React.createElement(CustomDesignForm, { id, design: { name: id, left: '', top: '' } }));
    const select = html.match(/<select aria-label="Chain length"[^>]*>(.*?)<\/select>/)[1];
    assert.equal((select.match(/<option /g) || []).length, 4);
    for (const length of customChainLengths) assert.ok(select.includes(length));
    assert.ok(html.includes('Chain length') && html.includes('Not chosen yet'));
    assert.ok(!html.includes('placeholder="Chain length"'));
  }
});
test('known legacy ranges normalize, while old custom requests are retained rather than discarded', () => {
  assert.equal(restoredChainLength(' 40-45 CM '), '40–45 cm');
  assert.equal(restoredChainLength('45—50cm'), '45–50 cm');
  assert.equal(restoredChainLength('Custom length, please advise'), 'Custom length, please advise');
  assert.equal(restoredChainLength(null), '');
  assert.equal(restoredChainLength('x'.repeat(100)).length, 60);
});
