import 'server-only';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { get, list, put } from '@vercel/blob';
import type { InquiryInput } from './inquiry-input';

export type Inquiry = InquiryInput & { id: string; createdAt: string; source: 'help'; consentVersion: '2026-10-19' };
export const inquiriesReady = () => (process.env.AUTH_SECRET?.length || 0) >= 32 && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
function key() {
  if (!inquiriesReady()) throw new Error('INQUIRY_NOT_CONFIGURED');
  return createHash('sha256').update(`vd-inquiries-v1:${process.env.AUTH_SECRET}`).digest();
}
const digest = (value: string) => createHmac('sha256', key()).update(value).digest('hex');
export function createInquiryToken(now = Date.now()) {
  const body = `${now}.${randomBytes(24).toString('hex')}`;
  return `${body}.${digest(`form:${body}`)}`;
}
export function validInquiryToken(value: unknown, now = Date.now()) {
  if (typeof value !== 'string' || value.length > 180) return false;
  const match = /^(\d{13})\.([a-f0-9]{48})\.([a-f0-9]{64})$/.exec(value);
  if (!match || now - Number(match[1]) < 2000 || now - Number(match[1]) > 1800000) return false;
  return timingSafeEqual(Buffer.from(match[3]), Buffer.from(digest(`form:${match[1]}.${match[2]}`)));
}
export function encryptInquiry(record: Inquiry) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(record), 'utf8'), cipher.final()]);
  return JSON.stringify({ v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') });
}
export function decryptInquiry(envelope: { v: number; iv: string; tag: string; data: string }): Inquiry {
  if (envelope.v !== 1) throw new Error('INQUIRY_FORMAT');
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(envelope.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
  return JSON.parse(Buffer.concat([decipher.update(Buffer.from(envelope.data, 'base64')), decipher.final()]).toString());
}
export async function saveInquiry(input: InquiryInput, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  const prefix = `inquiries/v1/${digest(`${day}:${input.email}`)}/`;
  const id = digest(`${day}:${JSON.stringify(input)}`), pathname = `${prefix}${id}.json`;
  const existing = await list({ prefix, limit: 4 });
  if (existing.blobs.some(blob => blob.pathname === pathname)) return;
  if (existing.blobs.length >= 3 || existing.hasMore) throw new Error('INQUIRY_RATE_LIMIT');
  const record: Inquiry = { ...input, id, createdAt: now.toISOString(), source: 'help', consentVersion: '2026-10-19' };
  await put(pathname, encryptInquiry(record), { access: 'public', addRandomSuffix: false, allowOverwrite: false, contentType: 'application/json', cacheControlMaxAge: 60 });
}
export async function listInquiries(cursor?: string) {
  if (!inquiriesReady()) throw new Error('INQUIRY_NOT_CONFIGURED');
  const page = await list({ prefix: 'inquiries/v1/', limit: 30, ...(cursor ? { cursor } : {}) });
  const records = await Promise.all(page.blobs.map(async blob => {
    const result = await get(blob.url, { access: 'public', useCache: false, abortSignal: AbortSignal.timeout(10000) });
    if (!result || result.statusCode !== 200) throw new Error('INQUIRY_READ_FAILED');
    return decryptInquiry(await new Response(result.stream).json());
  }));
  records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { records, cursor: page.hasMore ? page.cursor : undefined };
}
