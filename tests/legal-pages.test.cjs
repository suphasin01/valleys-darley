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
const Privacy = require('../app/privacy/page.tsx').default;
const Terms = require('../app/terms/page.tsx').default;
test('privacy follows the centered Preview document and retains accurate data-use disclosures', () => {
  const html = renderToStaticMarkup(Privacy());
  assert.ok(html.includes('legal-document') && html.includes('text-center'));
  assert.ok(!html.includes('rounded-3xl') && !html.includes('bg-[#f5f0ed]'));
  let previous = -1;
  for (const heading of ['Who we are', 'What we collect', 'Order history', 'How we use it', 'Your choices', 'Who we share it with', 'International transfers', 'Cookies', 'How we keep it safe', 'How long we keep it', 'Your rights', 'Children', 'Contact us', 'Updates to this policy']) {
    const position = html.indexOf(`>${heading}</h2>`); assert.ok(position > previous, heading); previous = position;
  }
  assert.ok(html.includes('passwords are hashed') && html.includes('profiles are encrypted'));
  assert.ok(html.includes('Google or LINE') && !html.includes('Facebook'));
  assert.ok(html.includes('not requirements to register or order'));
  assert.ok(html.includes('does not automatically start a newsletter'));
  assert.ok(html.includes('href="/account"') && html.includes('href="/register"') && html.includes('mailto:valleydarley@gmail.com'));
});
test('terms retain the existing ordering and payment conditions in the matching document layout', () => {
  const html = renderToStaticMarkup(Terms());
  assert.ok(html.includes('legal-document') && html.includes('Terms of Service'));
  for (const copy of ['Provide accurate contact and delivery information', 'test mode does not take a real payment', 'Order-specific terms communicated by the store', 'Do not access other customers']) assert.ok(html.includes(copy));
  assert.ok(html.includes('href="/privacy"') && html.includes('mailto:valleydarley@gmail.com'));
});
