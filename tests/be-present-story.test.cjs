const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
};
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { bePresentStory } = require('../app/lib/be-present-story.ts');
const { BePresentStorybook } = require('../app/components/BePresentStorybook.tsx');

test('the story contains all five original chapters and distinct local illustrations', () => {
  assert.deepEqual(bePresentStory.map(chapter => chapter.title), ['The Wish', 'Lily the Guardian', 'The World of Imagination', 'The Gift into Reality', 'The Magic Within']);
  assert.equal(new Set(bePresentStory.map(chapter => chapter.image)).size, 5);
  for (const chapter of bePresentStory) {
    assert.ok(chapter.alt && chapter.paragraphs.every(Boolean));
    assert.ok(fs.statSync(path.join(__dirname, '../public', chapter.image)).size > 1000);
  }
});
test('the initial book is server-rendered with accessible navigation and the original title', () => {
  const html = renderToStaticMarkup(React.createElement(BePresentStorybook));
  assert.ok(html.includes('Page 1 of 5: The Wish'));
  assert.ok(html.includes('be-present-story-1.webp'));
  assert.ok(html.includes('be-present-book-title.webp'));
  assert.ok(html.includes('disabled=""'));
  assert.ok(html.includes('Turn the page'));
  assert.ok(!html.includes('Read again'));
});
