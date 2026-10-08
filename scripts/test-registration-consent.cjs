const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
let user = null;
let existing = null;
let writes = 0;
let saved;
let submittedName;
const mod = { exports: {} };
const code = ts.transpileModule(fs.readFileSync('app/api/customer/profile/route.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const dependencies = {
  'next/server': { NextResponse: { redirect: (url, status) => ({ status, headers: new Headers({ location: String(url) }), cookies: { set() {} } }) } },
  '../../../lib/auth': { member: async () => user, memberProvider: () => 'google', safeMemberNext: () => '/account', seal: () => 'test', cookieOptions: {}, sessionCookie: 'test' },
  '../../../lib/privacy': { privacyVersion: '2026-10-03' },
  '../../../lib/customer-profile': { customerStorageReady: () => true, getCustomerProfile: async () => existing, validateProfile: form => { submittedName = form.get('name'); return { name: 'Test' }; }, saveCustomerProfile: async (_, profile) => { writes++; saved = profile; }, registerEmail: async profile => { writes++; saved = profile; return { sub: 'email:test' }; } },
};
vm.runInNewContext(code, { exports: mod.exports, module: mod, require: name => dependencies[name], Response, Headers, URL, Date });
const request = (acknowledge = false, origin = 'https://test.invalid') => {
  const body = new URLSearchParams({ firstName: ' Valley ', lastName: ' Darling ', password: 'test-password-123', confirmPassword: 'test-password-123' });
  if (acknowledge) { body.set('privacyAcknowledged', 'yes'); body.set('privacyVersion', '2026-10-03'); }
  return new Request('https://test.invalid/api/customer/profile', { method: 'POST', headers: { origin }, body });
};
(async () => {
  assert.match((await mod.exports.POST(request())).headers.get('location'), /error=privacy/);
  assert.equal(writes, 0);
  await mod.exports.POST(request(true));
  assert.equal(submittedName, 'Valley Darling');
  assert.equal(saved.privacy.provider, 'email');
  user = { sub: 'google:test' };
  assert.match((await mod.exports.POST(request())).headers.get('location'), /error=privacy/);
  await mod.exports.POST(request(true));
  assert.equal(saved.privacy.provider, 'google');
  existing = { name: 'Existing customer' };
  assert.equal((await mod.exports.POST(request())).headers.get('location'), 'https://test.invalid/account');
  assert.equal(saved.privacy, undefined);
  assert.equal((await mod.exports.POST(request(false, 'https://other.invalid'))).status, 403);
  console.log('New email/social registrations require acknowledgment; existing profile edits and CSRF checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
