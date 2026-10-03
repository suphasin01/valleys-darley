import { NextResponse } from 'next/server';
import { allowedOrigin, cookieOptions, providerReady, safeMemberNext, seal } from '../../../lib/auth';
import { privacyCookie, privacyVersion } from '../../../lib/privacy';
export async function POST(request: Request) {
  let origin: string;
  try { origin = allowedOrigin(request); } catch { return new Response('Invalid host', { status: 400 }); }
  if (request.headers.get('origin') !== origin) return new Response('Invalid origin', { status: 403 });
  const form = await request.formData();
  const next = safeMemberNext(String(form.get('next') || ''));
  const provider = form.get('provider');
  if (form.get('privacyAcknowledged') !== 'yes' || form.get('privacyVersion') !== privacyVersion) return NextResponse.redirect(new URL(`/register?error=privacy&next=${encodeURIComponent(next)}`, origin), 303);
  if ((provider !== 'google' && provider !== 'line') || !providerReady(provider)) return NextResponse.redirect(new URL('/login?error=configuration', origin), 303);
  const response = NextResponse.redirect(new URL(`/api/auth/${provider}?next=${encodeURIComponent(next)}`, origin), 303);
  response.cookies.set(privacyCookie, seal({ provider, version: privacyVersion, exp: Date.now() + 600000 }), { ...cookieOptions, maxAge: 600 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
