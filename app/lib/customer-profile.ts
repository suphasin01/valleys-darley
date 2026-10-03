import 'server-only';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { get, list, put } from '@vercel/blob';
import { authSecretReady, type Member } from './auth';

const scrypt = promisify(scryptCallback);
export type CustomerProfile = { name: string; email: string; phone: string; address: string; subdistrict: string; district: string; province: string; postalCode: string; updatedAt: string; privacy?: { version: string; acknowledgedAt: string; provider: string } };
type CustomerRecord = { sub: string; profile: CustomerProfile; password?: { salt: string; hash: string }; failed?: number; lockedUntil?: number };
export const customerStorageReady = () => authSecretReady() && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
function encryptionKey() {
  if (!customerStorageReady()) throw new Error('CUSTOMER_STORAGE_NOT_CONFIGURED');
  return createHash('sha256').update(`vd-customers-v1:${process.env.AUTH_SECRET}`).digest();
}
function pathname(sub: string) { return `customers/v1/${createHmac('sha256', encryptionKey()).update(sub).digest('hex')}.json`; }
function encrypt(record: CustomerRecord) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(record), 'utf8'), cipher.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') });
}
function decrypt(envelope: { iv: string; tag: string; data: string }): CustomerRecord {
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(envelope.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]).toString()) as CustomerRecord;
}
async function readRecord(sub: string): Promise<CustomerRecord | null> {
  if (!customerStorageReady()) return null;
  const path = pathname(sub);
  const blob = await get(path, { access: 'public', useCache: false, abortSignal: AbortSignal.timeout(10000) });
  if (!blob) return null;
  if (blob.statusCode !== 200) throw new Error('CUSTOMER_READ_FAILED');
  const envelope = await new Response(blob.stream).json();
  const record = decrypt(envelope);
  if (record.sub !== sub) throw new Error('CUSTOMER_ID_MISMATCH');
  return record;
}
async function writeRecord(record: CustomerRecord, overwrite = true) {
  await put(pathname(record.sub), encrypt(record), { access: 'public', addRandomSuffix: false, allowOverwrite: overwrite, contentType: 'application/json', cacheControlMaxAge: 60 });
}
export function validateProfile(form: FormData): CustomerProfile | null {
  const field = (key: string, max: number) => { const value = form.get(key); return typeof value === 'string' && value.trim().length <= max ? value.trim() : ''; };
  const profile = { name: field('name', 100), email: field('email', 254).toLowerCase(), phone: field('phone', 20).replace(/[\s()-]/g, ''), address: field('address', 250), subdistrict: field('subdistrict', 100), district: field('district', 100), province: field('province', 100), postalCode: field('postalCode', 5), updatedAt: new Date().toISOString() };
  if (!profile.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) || !/^(?:0\d{8,9}|\+66\d{8,9})$/.test(profile.phone) || !profile.address || !profile.subdistrict || !profile.district || !profile.province || !/^\d{5}$/.test(profile.postalCode)) return null;
  return profile;
}
export async function getCustomerProfile(user: Member) { return (await readRecord(user.sub))?.profile || null; }
export async function listCustomerProfiles(cursor?: string) {
  if (!customerStorageReady()) return { profiles: [], cursor: undefined };
  const page = await list({ prefix: 'customers/v1/', limit: 50, ...(cursor ? { cursor } : {}) });
  const profiles = await Promise.all(page.blobs.map(async blob => {
    const result = await get(blob.url, { access: 'public', useCache: false, abortSignal: AbortSignal.timeout(10000) });
    if (!result || result.statusCode !== 200) throw new Error('CUSTOMER_READ_FAILED');
    const record = decrypt(await new Response(result.stream).json());
    return { profile: record.profile, provider: record.sub.startsWith('email:') ? 'EMAIL' : record.sub.startsWith('google:') ? 'GOOGLE' : record.sub.startsWith('facebook:') ? 'FACEBOOK' : 'LINE' };
  }));
  return { profiles, cursor: page.hasMore ? page.cursor : undefined };
}
export async function saveCustomerProfile(user: Member, profile: CustomerProfile) {
  const existing = await readRecord(user.sub);
  await writeRecord({ ...existing, sub: user.sub, profile: { ...profile, privacy: existing?.profile.privacy || profile.privacy } });
}
function emailSub(email: string) { return `email:${createHash('sha256').update(email.trim().toLowerCase()).digest('hex')}`; }
export async function registerEmail(profile: CustomerProfile, password: string) {
  const sub = emailSub(profile.email);
  const salt = randomBytes(24).toString('hex');
  const hash = (await scrypt(password, salt, 64) as Buffer).toString('hex');
  await writeRecord({ sub, profile, password: { salt, hash } }, false);
  return { sub, name: profile.name, email: profile.email, provider: 'email' as const };
}
export async function loginEmail(email: string, password: string) {
  const record = await readRecord(emailSub(email));
  const digest = await scrypt(password, record?.password?.salt || 'missing-account-dummy-salt', 64) as Buffer;
  if (!record?.password || (record.lockedUntil || 0) > Date.now()) return null;
  if (!timingSafeEqual(digest, Buffer.from(record.password.hash, 'hex'))) {
    const failed = (record.failed || 0) + 1;
    await writeRecord({ ...record, failed, lockedUntil: failed >= 5 ? Date.now() + 15 * 60 * 1000 : 0 });
    return null;
  }
  await writeRecord({ ...record, failed: 0, lockedUntil: 0 });
  return { sub: record.sub, name: record.profile.name, email: record.profile.email, provider: 'email' as const };
}
