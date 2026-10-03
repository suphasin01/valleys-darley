import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const sessionCookie = 'vd_session';
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };
export type Provider = 'line' | 'google' | 'facebook';
export const authSecretReady = () => (process.env.AUTH_SECRET?.length || 0) >= 32;
export const providerReady = (provider: Provider) => authSecretReady() && (provider === 'line'
  ? Boolean(process.env.LINE_CHANNEL_ID && process.env.LINE_CHANNEL_SECRET)
  : provider === 'google'
    ? Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    : Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET));
export const ready = () => providerReady('line');
export function seal(data: object) {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) throw new Error('Auth not configured');
  const body = Buffer.from(JSON.stringify(data)).toString('base64url');
  return body + '.' + createHmac('sha256', process.env.AUTH_SECRET).update(body).digest('base64url');
}
export function unseal<T extends { exp: number }>(value?: string): T | null {
  try {
    if (!value || !process.env.AUTH_SECRET) return null;
    const [body, sig, extra] = value.split('.');
    if (extra || !sig) return null;
    const expected = seal(JSON.parse(Buffer.from(body, 'base64url').toString())).split('.')[1];
    if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const result = JSON.parse(Buffer.from(body, 'base64url').toString()) as T;
    return Number.isFinite(result.exp) && result.exp > Date.now() ? result : null;
  } catch { return null; }
}
export type Member = { sub: string; name: string; email?: string; provider?: Provider; exp: number };
export function memberProvider(user: Member): Provider {
  return user.provider || (user.sub.startsWith('google:') ? 'google' : user.sub.startsWith('facebook:') ? 'facebook' : 'line');
}
export function safeMemberNext(value?: string | null) {
  return value && (/^\/products\/[a-z0-9-]{1,80}$/.test(value) || /^\/checkout\?product=[a-z0-9-]{1,80}(?:&quantity=(?:[1-9]|10))?$/.test(value) || /^\/checkout\/success\?session_id=cs_(test|live)_[A-Za-z0-9]+$/.test(value)) ? value : '/account';
}
export async function member() {
  return unseal<Member>((await cookies()).get(sessionCookie)?.value);
}
export function allowedOrigin(request: Request) {
  const origin = new URL(request.url).origin;
  const allowed = [process.env.NEXT_PUBLIC_SITE_URL || 'https://valleys-darley.vercel.app', process.env.ADMIN_ORIGIN];
  if (process.env.NODE_ENV !== 'production') allowed.push('http://localhost:3000');
  if (!allowed.includes(origin)) throw new Error('Invalid origin');
  return origin;
}
