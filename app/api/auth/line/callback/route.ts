import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { allowedOrigin, cookieOptions, seal, sessionCookie, unseal } from '../../../../lib/auth';

export async function GET(request: Request) {
  let origin: string;
  try { origin = allowedOrigin(request); } catch { return new Response('Invalid host', { status: 400 }); }
  const jar = await cookies();
  const flow = unseal<{ state: string; nonce: string; verifier: string; redirect: string; target: string; exp: number }>(jar.get('vd_oauth')?.value);
  jar.delete('vd_oauth');
  const params = new URL(request.url).searchParams;
  try {
    if (!flow || flow.state !== params.get('state') || !params.get('code') || params.has('error') || flow.redirect !== origin + '/api/auth/line/callback') throw new Error('Invalid callback');
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000), body: new URLSearchParams({ grant_type: 'authorization_code', code: params.get('code')!, redirect_uri: flow.redirect, client_id: process.env.LINE_CHANNEL_ID!, client_secret: process.env.LINE_CHANNEL_SECRET!, code_verifier: flow.verifier }) });
    if (!tokenResponse.ok) throw new Error('Token exchange failed');
    const token = await tokenResponse.json();
    if (typeof token.id_token !== 'string') throw new Error('Missing token');
    const verified = await fetch('https://api.line.me/oauth2/v2.1/verify', { method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000), body: new URLSearchParams({ id_token: token.id_token, client_id: process.env.LINE_CHANNEL_ID!, nonce: flow.nonce }) });
    if (!verified.ok) throw new Error('Verification failed');
    const profile = await verified.json();
    if (typeof profile.sub !== 'string' || profile.aud !== process.env.LINE_CHANNEL_ID || profile.nonce !== flow.nonce || profile.exp * 1000 <= Date.now()) throw new Error('Invalid identity');
    const response = NextResponse.redirect(new URL(flow.target === '/admin' ? '/admin' : '/account', origin));
    response.cookies.set(sessionCookie, seal({ sub: profile.sub, name: typeof profile.name === 'string' ? profile.name.slice(0, 100) : 'สมาชิก', exp: Date.now() + 86400000 }), { ...cookieOptions, maxAge: 86400 });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login?error=login', origin));
  }
}
