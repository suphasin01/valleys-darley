const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
};
const blobs = new Map(), cookieJar = new Map();
let writes = 0, failWrites = false, signedIn = false;
const originalLoad = Module._load;
Module._load = function(request, parent, main) {
  if (request === 'server-only') return {};
  if (request === 'next/headers') return { cookies: async () => ({ get: name => cookieJar.has(name) ? { value: cookieJar.get(name) } : undefined }) };
  if (request.endsWith('lib/admin-auth')) return { adminSession: async () => signedIn };
  if (request === '@vercel/blob') return {
    list: async ({ prefix, limit }) => ({ blobs: [...blobs.keys()].filter(path => path.startsWith(prefix)).slice(0, limit).map(pathname => ({ pathname, url: pathname })), hasMore: false }),
    put: async (pathname, contents) => { if (failWrites) throw new Error('test-write-failed'); writes++; blobs.set(pathname, contents); },
    get: async path => ({ statusCode: 200, stream: new Response(blobs.get(path)).body }),
  };
  return originalLoad.call(this, request, parent, main);
};
process.env.AUTH_SECRET = 'test-only-inquiry-secret-with-at-least-32-characters';
process.env.BLOB_READ_WRITE_TOKEN = 'test-only-never-sent';
const { privacyVersion } = require('../app/lib/privacy.ts');
const { validateInquiry } = require('../app/lib/inquiry-input.ts');
const store = require('../app/lib/inquiries.ts');
const api = require('../app/api/inquiries/route.ts');
const sample = { firstName: 'Jane', lastName: 'Sample', email: 'JANE@example.test', message: 'A question about my necklace.', newsletter: false, privacyAcknowledged: true, privacyVersion, website: '' };
const input = () => validateInquiry(sample);
const reset = () => { blobs.clear(); cookieJar.clear(); writes = 0; failWrites = false; };
const request = (body, origin = 'https://shop.example') => new Request('https://shop.example/api/inquiries', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
const formToken = () => { const token = store.createInquiryToken(Date.now() - 3000); cookieJar.set('vd_inquiry_form', token); return token; };

test('inquiry validation requires notice acknowledgment and a message or explicit newsletter choice', () => {
  assert.equal(input().email, 'jane@example.test');
  for (const change of [{ email: 'invalid' }, { firstName: '' }, { lastName: 'x'.repeat(101) }, { privacyAcknowledged: false }, { privacyVersion: 'old' }, { newsletter: 'yes' }, { message: '' }, { message: 'x'.repeat(3001) }, { website: 'spam' }]) assert.equal(validateInquiry({ ...sample, ...change }), null);
  assert.ok(validateInquiry({ ...sample, message: '', newsletter: true }));
});
test('signed form tokens reject tampering, premature and expired submissions', () => {
  const now = Date.now(), token = store.createInquiryToken(now);
  assert.equal(store.validInquiryToken(token, now), false);
  assert.equal(store.validInquiryToken(token, now + 3000), true);
  assert.equal(store.validInquiryToken(token, now + 1800001), false);
  assert.equal(store.validInquiryToken(token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a'), now + 3000), false);
});
test('form setup is no-store, uses an HttpOnly cookie, and fails closed without configuration', async () => {
  const setup = await api.GET();
  assert.equal(setup.headers.get('cache-control'), 'no-store');
  assert.match(setup.headers.get('set-cookie'), /HttpOnly/i);
  assert.match(setup.headers.get('set-cookie'), /SameSite=strict/i);
  assert.equal(typeof (await setup.json()).token, 'string');
  const previous = process.env.BLOB_READ_WRITE_TOKEN;
  try { delete process.env.BLOB_READ_WRITE_TOKEN; assert.equal((await api.GET()).status, 503); }
  finally { process.env.BLOB_READ_WRITE_TOKEN = previous; }
});
test('inquiries are encrypted, authenticated, deduplicated and bounded per email per day', async () => {
  reset();
  await store.saveInquiry(input());
  const [pathname, envelope] = [...blobs.entries()][0];
  assert.ok(!pathname.includes('jane') && !envelope.includes('example.test') && !envelope.includes('necklace'));
  const record = store.decryptInquiry(JSON.parse(envelope));
  assert.equal(record.email, input().email); assert.equal(record.newsletter, false);
  const corrupted = JSON.parse(envelope); corrupted.tag = Buffer.alloc(16).toString('base64');
  assert.throws(() => store.decryptInquiry(corrupted));
  await store.saveInquiry(input()); assert.equal(writes, 1);
  await store.saveInquiry({ ...input(), message: 'second' });
  await store.saveInquiry({ ...input(), message: 'third' });
  await assert.rejects(store.saveInquiry({ ...input(), message: 'fourth' }), /INQUIRY_RATE_LIMIT/);
});
test('API rejects cross-origin, forged tokens, missing notice and oversized requests without saving', async () => {
  reset(); const token = formToken();
  assert.equal((await api.POST(request({ ...sample, token }, 'https://other.example'))).status, 403);
  assert.equal((await api.POST(request({ ...sample, token: 'forged' }))).status, 403);
  assert.equal((await api.POST(request({ ...sample, token, privacyAcknowledged: false }))).status, 400);
  assert.equal((await api.POST(request({ ...sample, token, message: 'x'.repeat(20000) }))).status, 413);
  assert.equal(writes, 0);
});
test('API reports success only after persistence, and never returns submitted personal information', async () => {
  reset(); const token = formToken();
  failWrites = true;
  const failed = await api.POST(request({ ...sample, token }));
  assert.equal(failed.status, 503); assert.ok(!(await failed.text()).includes('saved'));
  failWrites = false;
  const saved = await api.POST(request({ ...sample, token }));
  assert.deepEqual(await saved.json(), { saved: true });
  assert.equal(writes, 1); assert.equal(saved.headers.get('cache-control'), 'no-store');
});
test('admin inbox requires authentication and escapes the stored customer message', async () => {
  const Inbox = require('../app/admin/inquiries/page.tsx').default;
  signedIn = false;
  await assert.rejects(Inbox({ searchParams: Promise.resolve({}) }), /NEXT_REDIRECT/);
  reset(); await store.saveInquiry({ ...input(), message: '<script>alert(1)</script>' });
  signedIn = true;
  const html = require('react-dom/server').renderToStaticMarkup(await Inbox({ searchParams: Promise.resolve({}) }));
  assert.ok(!html.includes('<script>')); assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('ไม่ได้เลือกรับ Newsletter'));
});
test('the newsletter form renders labelled fields with no preselected marketing consent or false success', () => {
  const Form = require('../app/components/HelpContactForm.tsx').HelpContactForm;
  const html = require('react-dom/server').renderToStaticMarkup(require('react').createElement(Form));
  for (const field of ['firstName', 'lastName', 'email', 'message', 'newsletter', 'privacyAcknowledged']) assert.ok(html.includes(`name="${field}"`));
  assert.ok(!html.includes('checked=""'));
  assert.ok(!html.includes('Your request and newsletter preference have been recorded'));
  assert.ok(html.includes('disabled=""'));
});
