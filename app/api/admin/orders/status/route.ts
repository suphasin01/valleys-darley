import { adminSession } from '../../../../lib/admin-auth';
import { stripeClient } from '../../../../lib/stripe';
import { normalizeTrackingNumber } from '../../../../lib/thailand-post';

export async function POST(request: Request) {
  if (!await adminSession()) return new Response('Unauthorized', { status: 401 });
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return new Response('Invalid origin', { status: 403 });
  const form = await request.formData();
  const sessionId = form.get('sessionId');
  const status = form.get('status');
  const trackingNumber = form.get('trackingNumber');
  if (typeof sessionId !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId) || !['new', 'preparing', 'shipped', 'completed'].includes(String(status)) || typeof trackingNumber !== 'string' || trackingNumber.length > 100) return new Response('Invalid order update', { status: 400 });
  const barcode = trackingNumber.trim() ? normalizeTrackingNumber(trackingNumber) : null;
  if (trackingNumber.trim() && !barcode) return new Response('Invalid Thailand Post tracking number', { status: 400 });
  if ((status === 'shipped' || status === 'completed') && !barcode) return new Response('Tracking number required', { status: 400 });
  try {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.source !== 'valleys-darley' || session.payment_status !== 'paid') return new Response('Order not paid', { status: 400 });
    await stripe.checkout.sessions.update(sessionId, { metadata: { fulfillmentStatus: String(status), trackingNumber: barcode || '', carrier: barcode ? 'thailand-post' : '' } });
    return Response.redirect(new URL('/admin/orders?updated=1', origin), 303);
  } catch { return Response.redirect(new URL('/admin/orders?updated=0', origin), 303); }
}
