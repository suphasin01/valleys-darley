import { createHash, randomBytes } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { allowedOrigin, cookieOptions, providerReady, safeMemberNext, seal, sessionCookie, unseal, type Provider } from './auth';

type SocialProvider = Exclude<Provider, 'line' | 'email'>;
type Flow = { state: string; nonce: string; verifier: string; redirect: string; next: string; exp: number };
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const flowCookie = (provider: SocialProvider) => `vd_oauth_${provider}`;

export async function startSocial(request: Request, provider: SocialProvider) {
  let origin: string;
  try { origin = allowedOrigin(request); } catch { return new Response('Invalid host', { status: 400 }); }
  if (!providerReady(provider)) return NextResponse.redirect(new URL('/login?error=configuration', origin));
  const state = randomBytes(24).toString('hex');
  const nonce = randomBytes(24).toString('hex');
  const verifier = randomBytes(32).toString('base64url');
  const redirect = `${origin}/api/auth/${provider}/callback`;
  const next = safeMemberNext(new URL(request.url).searchParams.get('next'));
  const url = provider === 'google' ? new URL('https://accounts.google.com/o/oauth2/v2/auth') : new URL('https://www.facebook.com/dialog/oauth');
  url.search = new URLSearchParams(provider === 'google' ? {
    response_type: 'code', client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: redirect,
    state, nonce, scope: 'openid profile email', code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    code_challenge_method: 'S256', prompt: 'select_account',
  } : {
    response_type: 'code', client_id: process.env.FACEBOOK_APP_ID!, redirect_uri: redirect,
    state, scope: 'public_profile,email',
  }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set(flowCookie(provider), seal({ state, nonce, verifier, redirect, next, exp: Date.now() + 600000 }), { ...cookieOptions, maxAge: 600 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

async function googleIdentity(code: string, flow: Flow) {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: flow.redirect,
      client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, code_verifier: flow.verifier }),
  });
  if (!tokenResponse.ok) throw new Error('Google token exchange failed');
  const token = await tokenResponse.json();
  if (typeof token.id_token !== 'string') throw new Error('Missing Google ID token');
  const { payload } = await jwtVerify(token.id_token, googleKeys, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: process.env.GOOGLE_CLIENT_ID!, algorithms: ['RS256'],
  });
  if (!payload.sub || payload.nonce !== flow.nonce || (payload.email && payload.email_verified !== true)) throw new Error('Invalid Google identity');
  return { sub: `google:${payload.sub}`, name: typeof payload.name === 'string' ? payload.name.slice(0, 100) : 'สมาชิก',
    email: typeof payload.email === 'string' ? payload.email.slice(0, 254) : undefined };
}

async function facebookIdentity(code: string, flow: Flow) {
  const tokenResponse = await fetch('https://graph.facebook.com/oauth/access_token', {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({ client_id: process.env.FACEBOOK_APP_ID!, client_secret: process.env.FACEBOOK_APP_SECRET!, redirect_uri: flow.redirect, code }),
  });
  if (!tokenResponse.ok) throw new Error('Facebook token exchange failed');
  const token = await tokenResponse.json();
  if (typeof token.access_token !== 'string') throw new Error('Missing Facebook access token');
  const check = await fetch('https://graph.facebook.com/debug_token', {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000),
    body: new URLSearchParams({ input_token: token.access_token, access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}` }),
  });
  if (!check.ok) throw new Error('Facebook token validation failed');
  const checked = await check.json();
  const data = checked.data;
  if (!data?.is_valid || String(data.app_id) !== process.env.FACEBOOK_APP_ID || typeof data.user_id !== 'string' || (data.expires_at && data.expires_at * 1000 <= Date.now())) throw new Error('Invalid Facebook identity');
  const profileResponse = await fetch('https://graph.facebook.com/me?fields=id,name,email', {
    cache: 'no-store', signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!profileResponse.ok) throw new Error('Facebook profile failed');
  const profile = await profileResponse.json();
  if (profile.id !== data.user_id) throw new Error('Facebook identity mismatch');
  return { sub: `facebook:${profile.id}`, name: typeof profile.name === 'string' ? profile.name.slice(0, 100) : 'สมาชิก',
    email: typeof profile.email === 'string' ? profile.email.slice(0, 254) : undefined };
}

export async function completeSocial(request: Request, provider: SocialProvider) {
  let origin: string;
  try { origin = allowedOrigin(request); } catch { return new Response('Invalid host', { status: 400 }); }
  const jar = await cookies();
  const flow = unseal<Flow>(jar.get(flowCookie(provider))?.value);
  const params = new URL(request.url).searchParams;
  const fallback = new URL(`/login?error=login&next=${encodeURIComponent(safeMemberNext(flow?.next))}`, origin);
  let response: NextResponse;
  try {
    if (!providerReady(provider) || !flow || flow.state !== params.get('state') || !params.get('code') || params.has('error') || flow.redirect !== `${origin}/api/auth/${provider}/callback`) throw new Error('Invalid callback');
    const identity = provider === 'google' ? await googleIdentity(params.get('code')!, flow) : await facebookIdentity(params.get('code')!, flow);
    response = NextResponse.redirect(new URL(`/register?next=${encodeURIComponent(safeMemberNext(flow.next))}`, origin));
    response.cookies.set(sessionCookie, seal({ ...identity, provider, exp: Date.now() + 86400000 }), { ...cookieOptions, maxAge: 86400 });
  } catch {
    response = NextResponse.redirect(fallback);
  }
  response.cookies.set(flowCookie(provider), '', { ...cookieOptions, maxAge: 0 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
