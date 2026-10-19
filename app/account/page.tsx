import { redirect } from 'next/navigation';
import { member, memberProvider } from '../lib/auth';
import { memberOrders } from '../lib/orders';
import { getCustomerProfile } from '../lib/customer-profile';
import { AccountOverview } from '../components/AccountOverview';
import { getCmsContent } from '../lib/cms';
import { orderSummary } from '../lib/order-summary';

export const metadata = { title: "My Account — Valley’s Darling", robots: { index: false, follow: false } };
export default async function Account() {
  const user = await member();
  if (!user) redirect('/login?next=%2Faccount');
  const profile = await getCustomerProfile(user);
  if (!profile) redirect('/register?next=%2Faccount');
  let orders: Awaited<ReturnType<typeof memberOrders>> = [];
  let unavailable = false;
  if (process.env.STRIPE_SECRET_KEY) {
    try { orders = await memberOrders(user); } catch { unavailable = true; }
  }
  const content = await getCmsContent();
  return <AccountOverview profile={profile} provider={memberProvider(user)} orders={orders.slice(0, 6).map(order => orderSummary(order, content.products))} unavailable={unavailable} />;
}
