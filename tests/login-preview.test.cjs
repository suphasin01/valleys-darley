const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('login uses the original 3x Figma badge at its 192x126 layout size', async () => {
  const source = fs.readFileSync('app/components/AuthTitle.tsx', 'utf8');
  const metadata = await require('sharp')('public/images/figma/login-badge.webp').metadata();
  assert.equal(metadata.width, 576); assert.equal(metadata.height, 378);
  assert.ok(source.includes('/images/figma/login-badge.webp'));
  assert.ok(source.includes('h-[126px] w-[192px]'));
});
test('email form styling cannot override Google and LINE button branding', () => {
  const css = fs.readFileSync('app/globals.css', 'utf8');
  const source = fs.readFileSync('app/login/page.tsx', 'utf8');
  assert.ok(source.includes('className="email-sign-in space-y-6"'));
  assert.ok(css.includes('.auth-design .email-sign-in > button'));
  assert.ok(!css.includes('.auth-design form > button') && !css.includes('.auth-design button[type=submit]'));
  assert.ok(source.includes('<SocialSignIn next={next}'));
});
test('login preserves safe-next and form endpoints while recovery help makes no false email claim', () => {
  const source = fs.readFileSync('app/login/page.tsx', 'utf8');
  for (const text of ['safeMemberNext(params.next)', 'action="/api/auth/email"', 'name="next" value={next}', 'encodeURIComponent(next)', 'autoComplete="current-password"']) assert.ok(source.includes(text));
  assert.ok(source.includes('Forgot password?') && source.includes('No reset email is sent from this page.'));
  assert.ok(source.includes('href="/help#contact"'));
});
