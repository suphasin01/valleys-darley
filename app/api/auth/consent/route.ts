import { NextResponse } from 'next/server';
import { allowedOrigin, providerReady, safeMemberNext } from '../../../lib/auth';
export async function POST(request: Request) {
  let origin: string;
  try { origin = allowedOrigin(request); } catch { return new Response('Invalid host', { status: 400 }); }
  if (request.headers.get('origin') !== origin) return new Response('Invalid origin', { status: 403 });
  const form = await request.formData();
  const next = safeMemberNext(String(form.get('next') || ''));
  const provider = form.get('provider');
  if ((provider !== 'google' && provider !== 'line') || !providerReady(provider)) return NextResponse.redirect(new URL('/login?error=configuration', origin), 303);
  const response = NextResponse.redirect(new URL(`/api/auth/${provider}?next=${encodeURIComponent(next)}`, origin), 303);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
