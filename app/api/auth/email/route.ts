import { NextResponse } from 'next/server';
import { cookieOptions, safeMemberNext, seal, sessionCookie } from '../../../lib/auth';
import { customerStorageReady, loginEmail } from '../../../lib/customer-profile';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return new Response('Invalid origin', { status: 403 });
  const form = await request.formData();
  const next = safeMemberNext(String(form.get('next') || ''));
  const fail = () => NextResponse.redirect(new URL(`/login?error=login&next=${encodeURIComponent(next)}`, origin), 303);
  const email = form.get('email');
  const password = form.get('password');
  if (!customerStorageReady() || typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || password.length > 128) return fail();
  try {
    const identity = await loginEmail(email, password);
    if (!identity) return fail();
    const response = NextResponse.redirect(new URL(next, origin), 303);
    response.cookies.set(sessionCookie, seal({ ...identity, exp: Date.now() + 86400000 }), { ...cookieOptions, maxAge: 86400 });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch { return fail(); }
}
