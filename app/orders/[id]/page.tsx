import { notFound, redirect } from 'next/navigation';
import { member } from '../../lib/auth';
import { ownsOrder, orderState, orderStateLabels } from '../../lib/orders';
import { stripeClient, stripeTestMode } from '../../lib/stripe';
import { normalizeTrackingNumber } from '../../lib/thailand-post';
import { getCmsContent } from '../../lib/cms';
import { editorialImage } from '../../lib/editorial-images';
import { OrderDetailView, type OrderDisplayItem } from '../../components/OrderDetailView';
import type { ReceiptData } from '../../components/ReceiptDialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: "Order Details — Valley’s Darling", robots: { index: false, follow: false } };
export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) notFound();
  const user = await member();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
  let order;
  try { order = await stripeClient().checkout.sessions.retrieve(id); } catch { notFound(); }
  if (!ownsOrder(order, user)) notFound();
  let items: OrderDisplayItem[] = [];
  let unavailable = false;
  try {
    const [lineItems, content] = await Promise.all([
      stripeClient().checkout.sessions.listLineItems(id, { limit: 100, expand: ['data.price.product'] }),
      getCmsContent(),
    ]);
    items = lineItems.data.map(item => {
      const product = item.price?.product;
      const expanded = product && typeof product !== 'string' && !product.deleted ? product : null;
      const cmsProduct = content.products.find(candidate => candidate.name === item.description || candidate.id === expanded?.metadata?.productId);
      return { name: item.description || 'Jewelry', quantity: item.quantity || 1, unitAmount: item.price?.unit_amount ?? Math.round(item.amount_subtotal / (item.quantity || 1)), total: item.amount_total, description: expanded?.description || undefined, image: expanded?.images?.[0] || (cmsProduct ? editorialImage(cmsProduct) : undefined) };
    });
  } catch { unavailable = true; }
  const shipping = order.collected_information?.shipping_details;
  const address = shipping?.address || order.customer_details?.address;
  const customer = shipping?.name || order.customer_details?.name || user.name;
  const addressText = address ? [address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(', ') : '';
  const date = new Date(order.created * 1000).toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' });
  const paid = order.payment_status === 'paid';
  const receipt: ReceiptData | null = paid && !unavailable ? {
    number: id.slice(-10), date, customer, address: addressText, currency: (order.currency || 'thb').toUpperCase(),
    items: items.map(item => ({ name: item.name, description: item.description, quantity: item.quantity, total: item.total })),
    subtotal: order.amount_subtotal || 0, shipping: order.total_details?.amount_shipping || 0, discount: order.total_details?.amount_discount || 0, tax: order.total_details?.amount_tax || 0, total: order.amount_total || 0,
  } : null;
  const tracker = normalizeTrackingNumber(order.metadata?.trackingNumber || '');
  const status = order.status === 'expired' ? 'Payment expired' : order.metadata?.paymentOutcome === 'failed' && !paid ? 'Payment failed · Please contact us or start a new checkout' : orderStateLabels[orderState(order)];
  return <OrderDetailView number={id.slice(-10)} name={customer} date={date} status={status} items={items} receipt={receipt} testMode={stripeTestMode()} paymentUrl={order.status === 'open' && !paid ? order.url || undefined : undefined} trackingUrl={tracker && paid ? `/tracking/${id}` : undefined} address={[customer, addressText, order.customer_details?.phone].filter(Boolean).join('\n')} unavailable={unavailable} />;
}
