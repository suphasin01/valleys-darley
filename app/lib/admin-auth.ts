import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const adminCookie = 'vd_admin_session';
export const adminCookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/', maxAge: 60 * 60 * 12 };

function credentials() {
  const match = /^scrypt:([a-f0-9]{32,128}):([a-f0-9]{128})$/i.exec(process.env.ADMIN_PASSWORD_HASH || '');
  const username = process.env.ADMIN_USERNAME;
  const secret = process.env.ADMIN_SESSION_SECRET;
  return username && match && secret && secret.length >= 32 ? { username, salt: match[1], hash: Buffer.from(match[2], 'hex'), secret } : null;
}

export const adminReady = () => Boolean(credentials());

export function verifyAdmin(username: string, password: string) {
  const config = credentials();
  if (!config || password.length > 1024 || username.length > 256) return false;
  const derived = scryptSync(password, Buffer.from(config.salt, 'hex'), 64);
  return username === config.username && timingSafeEqual(derived, config.hash);
}

export function createAdminToken() {
  const config = credentials();
  if (!config) throw new Error('Admin login is not configured');
  const body = Buffer.from(JSON.stringify({ username: config.username, exp: Date.now() + adminCookieOptions.maxAge * 1000 })).toString('base64url');
  const signature = createHmac('sha256', config.secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export async function adminSession() {
  const config = credentials();
  const token = (await cookies()).get(adminCookie)?.value;
  if (!config || !token) return false;
  try {
    const [body, signature, extra] = token.split('.');
    if (!body || !signature || extra || body.length > 2048) return false;
    const expected = createHmac('sha256', config.secret).update(body).digest('base64url');
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    return data.username === config.username && Number.isFinite(data.exp) && data.exp > Date.now();
  } catch { return false; }
}
