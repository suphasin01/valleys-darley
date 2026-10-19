import type Stripe from 'stripe';
import type { CmsProduct } from './cms';
import { editorialImage } from './editorial-images';
import { orderState, orderStateLabels } from './order-state';

/** Never substitute an unrelated demo photograph for an unknown purchased product. */
export function orderSummary(order: Stripe.Checkout.Session, products: CmsProduct[]) {
  const name = order.metadata?.productName || 'Jewelry';
  const matching = products.filter(product => order.metadata?.productId
    ? product.id === order.metadata.productId
    : product.name === name || (order.metadata?.cart === 'true' &&
      (name.startsWith(`${product.name} × `) || name.startsWith(`${product.name} (`) ||
        name.includes(`, ${product.name} × `) || name.includes(`, ${product.name} (`))));
  return {
    id: order.id, number: order.id.slice(-10), name,
    date: new Date(order.created * 1000).toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' }),
    status: order.status === 'expired' ? 'Payment expired' : orderStateLabels[orderState(order)],
    amount: order.amount_total || 0, currency: order.currency || 'thb',
    images: matching.map(product => ({ src: editorialImage(product), name: product.name })),
    tracking: order.payment_status === 'paid' && Boolean(order.metadata?.trackingNumber),
    variant: order.metadata?.variantLabel || '',
  };
}
export type OrderSummary = ReturnType<typeof orderSummary>;
