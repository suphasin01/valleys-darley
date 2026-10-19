import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createInquiryToken, inquiriesReady, saveInquiry, validInquiryToken } from '../../lib/inquiries';
import { validateInquiry } from '../../lib/inquiry-input';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const cookieName = 'vd_inquiry_form';
const response = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export async function GET() {
  if (!inquiriesReady()) return response({ error: 'unavailable' }, 503);
  const token = createInquiryToken();
  const result = response({ token });
  result.cookies.set(cookieName, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/inquiries', maxAge: 1800 });
  return result;
}
export async function POST(request: Request) {
  if (request.headers.get('origin') !== new URL(request.url).origin) return response({ error: 'origin' }, 403);
  if (!inquiriesReady()) return response({ error: 'unavailable' }, 503);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return response({ error: 'validation' }, 415);
  const reader = request.body?.getReader();
  if (!reader) return response({ error: 'validation' }, 400);
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 16384) { await reader.cancel(); return response({ error: 'size' }, 413); }
      chunks.push(part.value);
    }
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    const cookie = (await cookies()).get(cookieName)?.value;
    if (!cookie || cookie !== data?.token || !validInquiryToken(data.token)) return response({ error: 'expired' }, 403);
    const input = validateInquiry(data);
    if (!input) return response({ error: 'validation' }, 400);
    await saveInquiry(input);
    const result = response({ saved: true });
    result.cookies.set(cookieName, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api/inquiries', maxAge: 0 });
    return result;
  } catch (error) {
    if (error instanceof SyntaxError) return response({ error: 'validation' }, 400);
    if (error instanceof Error && error.message === 'INQUIRY_RATE_LIMIT') return response({ error: 'limit' }, 429);
    return response({ error: 'save' }, 503);
  }
}
