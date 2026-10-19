import { stripeClient } from './stripe';
import { normalizeTrackingNumber, trackThailandPostBatch, type TrackingEvent } from './thailand-post';
import { postalEventTime, postalUpdate } from './shipping-state';

export async function syncPostalOrders(ids: string[]) {
  const stripe = stripeClient();
  let changed = 0; let failed = 0;
  const orders = await Promise.all([...new Set(ids)].map(id => stripe.checkout.sessions.retrieve(id).catch(() => null)));
  const barcodes = orders.filter(order => order?.payment_status === 'paid' && order.metadata?.source === 'valleys-darley').map(order => normalizeTrackingNumber(order?.metadata?.trackingNumber || '')).filter((barcode): barcode is string => !!barcode);
  if (!barcodes.length) return { changed, failed: orders.filter(order => !order).length };
  let events: Record<string, TrackingEvent[]>;
  try { events = await trackThailandPostBatch(barcodes, 'TH'); } catch { return { changed, failed: barcodes.length }; }
  await Promise.all([...new Set<string>(ids)].map(async id => {
    try {
      const order = await stripe.checkout.sessions.retrieve(id);
      const barcode = normalizeTrackingNumber(order.metadata?.trackingNumber || '');
      if (order.metadata?.source !== 'valleys-darley' || order.payment_status !== 'paid' || !barcode) return;
      const update = postalUpdate(events[barcode] || []);
      if (!update || postalEventTime(update.event.date) <= Number(order.metadata?.postalEventTime || 0)) return;
      const current = await stripe.checkout.sessions.retrieve(id);
      if (current.metadata?.trackingNumber !== barcode || current.payment_status !== 'paid' || postalEventTime(update.event.date) <= Number(current.metadata?.postalEventTime || 0)) return;
      await stripe.checkout.sessions.update(id, { metadata: {
        postalStatus: update.event.status, postalDescription: update.event.description.slice(0, 400), postalEventTime: String(postalEventTime(update.event.date)), postalEventDate: update.event.date.slice(0, 80), postalLocation: update.event.location.slice(0, 200),
        ...(update.fulfillment && current.metadata?.fulfillmentStatus !== 'completed' ? { fulfillmentStatus: update.fulfillment, fulfillmentUpdatedAt: String(Math.floor(Date.now() / 1000)) } : {}),
      } });
      changed++;
    } catch { failed++; }
  }));
  return { changed, failed };
}
