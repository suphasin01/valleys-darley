import { timingSafeEqual } from 'node:crypto';
import { stripeClient } from '../../../lib/stripe';
import { normalizeTrackingNumber } from '../../../lib/thailand-post';
import { syncPostalOrders } from '../../../lib/shipping-sync';

export const maxDuration = 60;
export async function POST(request: Request) {
  const secret = process.env.THAILAND_POST_WEBHOOK_SECRET;
  if (!secret || !process.env.THAILAND_POST_TOKEN_KEY) return new Response('Webhook not configured', { status: 503 });
  const supplied = Buffer.from(request.headers.get('authorization') || '');
  const expected = Buffer.from(`Bearer ${secret}`);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return new Response('Unauthorized', { status: 401 });
  const raw = await request.text();
  if (raw.length > 128000) return new Response('Payload too large', { status: 413 });
  let body;
  try { body = JSON.parse(raw); } catch { return new Response('Invalid JSON', { status: 400 }); }
  if (!Array.isArray(body.items) || body.items.length > 1000) return new Response('Invalid events', { status: 400 });
  const barcodes = new Set<string>();
  for (const item of body.items) {
    const barcode = typeof item?.barcode === 'string' ? normalizeTrackingNumber(item.barcode) : null;
    if (barcode) barcodes.add(barcode);
  }
  if (!barcodes.size) return Response.json({ received: true, changed: 0 });
  try {
    const ids: string[] = [];
    for await (const order of stripeClient().checkout.sessions.list({ limit: 100, status: 'complete' })) {
      if (order.metadata?.source === 'valleys-darley' && order.payment_status === 'paid' && barcodes.has(order.metadata.trackingNumber || '')) ids.push(order.id);
    }
    let changed = 0; let failed = 0;
    // Pull authoritative events again: a webhook payload alone cannot mark an order shipped.
    for (let index = 0; index < ids.length; index += 10) {
      const result = await syncPostalOrders(ids.slice(index, index + 10));
      changed += result.changed; failed += result.failed;
    }
    return Response.json({ received: !failed, changed }, { status: failed ? 503 : 200 });
  } catch { return new Response('Please retry later', { status: 503 }); }
}
