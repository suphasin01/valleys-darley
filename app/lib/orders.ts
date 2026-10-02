import { createHash } from 'node:crypto';
import type Stripe from 'stripe';
import type { Member } from './auth';
import { stripeClient } from './stripe';

function lineHash(sub: string) { return createHash('sha256').update(sub).digest('hex'); }

export async function findLineCustomers(sub: string) {
  const result = await stripeClient().customers.search({ query: `metadata['lineUserHash']:'${lineHash(sub)}'`, limit: 100 });
  return result.data.filter(customer => !customer.deleted && customer.metadata.lineUserId === sub);
}

export async function getOrCreateLineCustomer(user: Member) {
  const stripe = stripeClient();
  const existing = (await findLineCustomers(user.sub))[0];
  if (existing) {
    if (existing.name !== user.name) await stripe.customers.update(existing.id, { name: user.name });
    return existing.id;
  }
  const customer = await stripe.customers.create({ name: user.name, metadata: { source: 'valleys-darley', lineUserId: user.sub, lineUserHash: lineHash(user.sub) } }, { idempotencyKey: `line-customer-${lineHash(user.sub)}` });
  return customer.id;
}

export async function memberOrders(sub: string) {
  const stripe = stripeClient();
  const customers = await findLineCustomers(sub);
  const pages = await Promise.all(customers.map(customer => stripe.checkout.sessions.list({ customer: customer.id, status: 'complete', limit: 100 })));
  return pages.flatMap(page => page.data).filter(session => session.metadata?.source === 'valleys-darley' && session.metadata?.lineUserId === sub).sort((a, b) => b.created - a.created);
}

export function orderState(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return 'waiting';
  const status = session.metadata?.fulfillmentStatus;
  return status === 'preparing' || status === 'shipped' || status === 'completed' ? status : 'new';
}

export const orderStateLabels: Record<ReturnType<typeof orderState>, string> = {
  waiting: 'รอยืนยันการชำระเงิน', new: 'ชำระแล้ว · รอดำเนินการ', preparing: 'กำลังเตรียมสินค้า', shipped: 'จัดส่งแล้ว', completed: 'เสร็จสิ้น',
};
