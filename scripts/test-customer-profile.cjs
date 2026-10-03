const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const blobs = new Map();
process.env.AUTH_SECRET = 'test-only-secret-not-for-production'.repeat(2);
process.env.BLOB_READ_WRITE_TOKEN = 'test-only';
const sdk = {
  get: async (path, options) => {
    assert.equal(options.useCache, false);
    const value = blobs.get(path.replace('https://test.invalid/', ''));
    return value ? { statusCode: 200, stream: new Response(value).body } : null;
  },
  put: async (path, value, options) => {
    if (blobs.has(path) && !options.allowOverwrite) throw new Error('exists');
    blobs.set(path, value);
  },
  list: async () => ({ blobs: [...blobs.keys()].map(path => ({ url: `https://test.invalid/${path}` })), hasMore: false }),
};
const mod = { exports: {} };
const code = ts.transpileModule(fs.readFileSync('app/lib/customer-profile.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
vm.runInNewContext(code, { exports: mod.exports, module: mod, require: name => name === 'server-only' ? {} : name === '@vercel/blob' ? sdk : name === './auth' ? { authSecretReady: () => true } : require(name), process, Buffer, Response, AbortSignal, FormData, Date });
(async () => {
  const api = mod.exports;
  const form = new FormData();
  Object.entries({ name: 'Test Customer', email: 'TEST@example.com', phone: '081-234-5678', address: 'Test address', subdistrict: 'Test subdistrict', district: 'Test district', province: 'Test province', postalCode: '10100' }).forEach(([key, value]) => form.set(key, value));
  const profile = api.validateProfile(form);
  assert.equal(profile.email, 'test@example.com');
  assert.equal(profile.phone, '0812345678');
  form.set('postalCode', 'abc');
  assert.equal(api.validateProfile(form), null);
  const user = await api.registerEmail(profile, 'test-password-12345');
  const raw = [...blobs.values()][0];
  assert.ok(!raw.includes('Test Customer') && !raw.includes('test@example.com') && !raw.includes('test-password'));
  await assert.rejects(api.registerEmail(profile, 'another-password-123'));
  assert.equal((await api.loginEmail('TEST@example.com', 'test-password-12345')).sub, user.sub);
  assert.equal(await api.getCustomerProfile({ sub: 'google:other-user' }), null);
  await api.saveCustomerProfile(user, { ...profile, name: 'Updated Customer' });
  assert.equal((await api.loginEmail(profile.email, 'test-password-12345')).name, 'Updated Customer');
  const page = await api.listCustomerProfiles();
  assert.equal(page.profiles.length, 1);
  assert.ok(!JSON.stringify(page).includes('password'));
  for (let n = 0; n < 5; n++) assert.equal(await api.loginEmail(profile.email, 'incorrect-password'), null);
  assert.equal(await api.loginEmail(profile.email, 'test-password-12345'), null);
  assert.equal(await api.loginEmail('missing@example.com', 'test-password-12345'), null);
  console.log('Customer registration, encryption, ownership, updates, password verification, lockout and admin redaction checks passed.');
})().catch(error => { console.error(error); process.exitCode = 1; });
