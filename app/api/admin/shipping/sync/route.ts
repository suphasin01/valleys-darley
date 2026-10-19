import { adminSession } from '../../../../lib/admin-auth';
import { syncPostalOrders } from '../../../../lib/shipping-sync';

export async function POST(request: Request) {
  if (!await adminSession()) return new Response('Unauthorized', { status: 401 });
  if (request.headers.get('origin') !== new URL(request.url).origin) return new Response('Invalid origin', { status: 403 });
  if (!process.env.THAILAND_POST_TOKEN_KEY) return Response.json({ error: 'ยังไม่ได้ตั้งค่า API ไปรษณีย์ไทย' }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!Array.isArray(body?.ids) || body.ids.length > 10 || body.ids.some((id: unknown) => typeof id !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(id))) return new Response('Invalid orders', { status: 400 });
  return Response.json(await syncPostalOrders(body.ids), { headers: { 'Cache-Control': 'no-store' } });
}
