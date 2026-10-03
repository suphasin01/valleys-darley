import { NextResponse } from 'next/server';
import { cookieOptions, member, memberProvider, safeMemberNext, seal, sessionCookie } from '../../../lib/auth';
import { privacyVersion } from '../../../lib/privacy';
import { customerStorageReady, getCustomerProfile, registerEmail, saveCustomerProfile, validateProfile } from '../../../lib/customer-profile';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return new Response('Invalid origin', { status: 403 });
  if (!customerStorageReady()) return NextResponse.redirect(new URL('/register?error=configuration', origin), 303);
  const form = await request.formData();
  const next = safeMemberNext(String(form.get('next') || ''));
  const fail = (error: string) => NextResponse.redirect(new URL(`/register?error=${error}&edit=1&next=${encodeURIComponent(next)}`, origin), 303);
  try {
    const user = await member();
    const existing = user ? await getCustomerProfile(user) : null;
    if (!existing && (form.get('privacyAcknowledged') !== 'yes' || form.get('privacyVersion') !== privacyVersion)) return fail('privacy');
    const profile = validateProfile(form);
    if (!profile) return fail('validation');
    if (!existing) profile.privacy = { version: privacyVersion, acknowledgedAt: new Date().toISOString(), provider: user ? memberProvider(user) : 'email' };
    let identity;
    if (user) {
      // Native account login IDs cannot be changed by editing the contact email.
      await saveCustomerProfile(user, profile);
      identity = { ...user, name: profile.name };
    } else {
      const password = form.get('password');
      if (typeof password !== 'string' || password.length < 12 || password.length > 128 || password !== form.get('confirmPassword')) return fail('password');
      identity = await registerEmail(profile, password);
    }
    const response = NextResponse.redirect(new URL(next, origin), 303);
    response.cookies.set(sessionCookie, seal({ ...identity, exp: Date.now() + 86400000 }), { ...cookieOptions, maxAge: 86400 });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch { return fail('save'); }
}
