import { randomBytes, createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { allowedOrigin, cookieOptions, ready, seal } from '../../../lib/auth';

export async function GET(request: Request) {
  let origin: string;
  try { origin = allowedOrigin(request); } catch { return new Response('Invalid host', { status: 400 }); }
  if (!ready()) return NextResponse.redirect(new URL('/login?error=configuration', origin));
  const state = randomBytes(24).toString('hex');
  const nonce = randomBytes(24).toString('hex');
  const verifier = randomBytes(32).toString('base64url');
  const redirect = origin + '/api/auth/line/callback';
  const url = new URL('https://access.line.me/oauth2/v2.1/authorize');
  url.search = new URLSearchParams({ response_type: 'code', client_id: process.env.LINE_CHANNEL_ID!, redirect_uri: redirect, state, nonce, scope: 'openid profile', code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256' }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set('vd_oauth', seal({ state, nonce, verifier, redirect, exp: Date.now() + 600000 }), { ...cookieOptions, maxAge: 600 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
