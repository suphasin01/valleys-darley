import { createHash } from 'node:crypto';
import type Stripe from 'stripe';
import { memberProvider, type Member } from './auth';
import { stripeClient } from './stripe';
import { getCustomerProfile } from './customer-profile';

function memberHash(sub: string) { return createHash('sha256').update(sub).digest('hex'); }

export async function findMemberCustomers(user: Member) {
  const provider = memberProvider(user);
  const key = provider === 'line' ? 'lineUserHash' : 'memberIdHash';
  const result = await stripeClient().customers.search({ query: `metadata['${key}']:'${memberHash(user.sub)}'`, limit: 100 });
  return result.data.filter(customer => !customer.deleted && (provider === 'line' ? customer.metadata.lineUserId === user.sub : customer.metadata.memberId === user.sub));
}

export async function getOrCreateMemberCustomer(user: Member) {
  const stripe = stripeClient();
  const profile = await getCustomerProfile(user);
  if (!profile) throw new Error('CUSTOMER_PROFILE_REQUIRED');
  const address = { line1: profile.address, line2: profile.subdistrict, city: profile.district, state: profile.province, postal_code: profile.postalCode, country: 'TH' };
  const details = { name: profile.name, email: profile.email, phone: profile.phone, address, shipping: { name: profile.name, phone: profile.phone, address } };
  const existing = (await findMemberCustomers(user))[0];
  if (existing) {
    await stripe.customers.update(existing.id, details);
    return existing.id;
  }
  const provider = memberProvider(user);
  const customer = await stripe.customers.create({ ...details, metadata: {
    source: 'valleys-darley', memberId: user.sub, memberIdHash: memberHash(user.sub), provider,
    ...(provider === 'line' ? { lineUserId: user.sub, lineUserHash: memberHash(user.sub) } : {}),
  } }, { idempotencyKey: `member-customer-${memberHash(user.sub)}` });
  return customer.id;
}

export async function memberOrders(user: Member, includeOpen = false) {
  const stripe = stripeClient();
  const customers = await findMemberCustomers(user);
  const pages = await Promise.all(customers.map(customer => stripe.checkout.sessions.list({ customer: customer.id, ...(includeOpen ? {} : { status: 'complete' as const }), limit: 100 })));
  return pages.flatMap(page => page.data).filter(session => session.metadata?.source === 'valleys-darley' && (session.metadata.memberId || session.metadata.lineUserId) === user.sub).sort((a, b) => b.created - a.created);
}

export function ownsOrder(session: Stripe.Checkout.Session, user: Member) {
  return session.metadata?.source === 'valleys-darley' && (session.metadata.memberId || session.metadata.lineUserId) === user.sub;
}

export function orderState(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return 'waiting';
  const status = session.metadata?.fulfillmentStatus;
  return status === 'preparing' || status === 'shipped' || status === 'completed' ? status : 'new';
}

export const orderStateLabels: Record<ReturnType<typeof orderState>, string> = {
  waiting: 'รอยืนยันการชำระเงิน', new: 'ชำระแล้ว · รอดำเนินการ', preparing: 'กำลังเตรียมสินค้า', shipped: 'จัดส่งแล้ว', completed: 'เสร็จสิ้น',
};
