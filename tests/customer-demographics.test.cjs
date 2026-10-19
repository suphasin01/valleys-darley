const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const crypto = require('node:crypto');
for (const extension of ['.ts', '.tsx']) require.extensions[extension] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText, filename);
};
const { validateDemographics, genderOptions } = require('../app/lib/customer-demographics.ts');
const form = values => { const value = new FormData(); for (const [key, item] of Object.entries(values)) value.set(key, item); return value; };
test('optional gender choices match Preview and unknown values fail closed', () => {
  assert.deepEqual(genderOptions.map(option => option.label), ['Female', 'Male', 'Prefer not to say']);
  for (const gender of ['', ...genderOptions.map(option => option.value)]) assert.deepEqual(validateDemographics(form({ gender, country: 'TH' })), { gender, country: 'TH' });
  assert.deepEqual(validateDemographics(form({})), {});
  assert.equal(validateDemographics(form({ gender: 'arbitrary' })), null);
  assert.equal(validateDemographics(form({ country: 'US' })), null);
});

const key = crypto.createHash('sha256').update('vd-customers-v1:unit-test-secret-not-a-live-credential').digest();
function envelope(record) {
  const iv = crypto.randomBytes(12), cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(record)), cipher.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') });
}
function unwrap(value) {
  const data = JSON.parse(value), decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(data.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(data.tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(data.data, 'base64')), decipher.final()]));
}
const values = { name: 'Unit Test', email: 'person@example.invalid', phone: '0100000000', address: 'Test only', subdistrict: 'Test', district: 'Test', province: 'Test', postalCode: '10000' };
const existing = { sub: 'google:unit-test', profile: { ...values, gender: 'female', country: 'TH', privacy: { version: 'existing-version', acknowledgedAt: '2026-10-01', provider: 'google' } } };
let written;
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'server-only') return {};
  if (request === './auth' && parent.filename.endsWith('customer-profile.ts')) return { authSecretReady: () => true };
  if (request === '@vercel/blob') return {
    get: async () => ({ statusCode: 200, stream: new Response(envelope(existing)).body }),
    put: async (pathname, body) => { written = { pathname, body }; }, list: async () => ({ blobs: [] }),
  };
  return originalLoad.call(this, request, parent, isMain);
};
const { validateProfile, saveCustomerProfile } = require('../app/lib/customer-profile.ts');
Module._load = originalLoad;
process.env.AUTH_SECRET = 'unit-test-secret-not-a-live-credential';
process.env.BLOB_READ_WRITE_TOKEN = 'unit-test-mocked-no-network';
test('profile validation stores optional demographic fields without weakening address validation', () => {
  const profile = validateProfile(form({ ...values, gender: 'prefer-not-to-say', country: 'TH' }));
  assert.equal(profile.gender, 'prefer-not-to-say'); assert.equal(profile.country, 'TH');
  assert.equal(validateProfile(form({ ...values, gender: 'invalid' })), null);
  assert.equal(validateProfile(form({ ...values, country: 'US' })), null);
  assert.equal(validateProfile(form({ ...values, postalCode: 'invalid' })), null);
  assert.ok(validateProfile(form(values)));
});
test('encrypted profile updates preserve omitted fields and allow withdrawing an optional gender value', async () => {
  const user = { sub: existing.sub, name: 'Unit Test', provider: 'google' };
  await saveCustomerProfile(user, validateProfile(form(values)));
  assert.equal(unwrap(written.body).profile.gender, 'female');
  assert.equal(unwrap(written.body).profile.country, 'TH');
  await saveCustomerProfile(user, validateProfile(form({ ...values, gender: '' })));
  assert.equal(unwrap(written.body).profile.gender, '');
  assert.equal(unwrap(written.body).profile.privacy.version, 'existing-version');
  assert.ok(!written.body.includes('person@example.invalid') && !written.pathname.includes('person'));
});
