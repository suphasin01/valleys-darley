import type Stripe from 'stripe';

export function orderState(session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return 'waiting';
  const status = session.metadata?.fulfillmentStatus;
  return status === 'preparing' || status === 'packed' || status === 'shipped' || status === 'completed' ? status : 'new';
}

export const orderStateLabels: Record<ReturnType<typeof orderState>, string> = {
  waiting: 'Awaiting payment', new: 'Paid · Awaiting processing', preparing: 'Preparing your order', packed: 'Packed · Awaiting postal acceptance', shipped: 'Shipped', completed: 'Completed',
};
