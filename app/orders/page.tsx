import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member } from '../lib/auth';
import { memberOrders, orderState } from '../lib/orders';
import { stripeTestMode } from '../lib/stripe';
import { getCmsContent } from '../lib/cms';
import { orderSummary } from '../lib/order-summary';
import { OrderSummaryCard } from '../components/OrderSummaryCard';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Orders — Valley’s Darling', robots: { index: false, follow: false } };
export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await member(); if (!user) redirect('/login?next=%2Forders');
  let orders: Awaited<ReturnType<typeof memberOrders>> = []; let error = false;
  try { orders = await memberOrders(user, true); } catch { error = true; }
  const content = await getCmsContent();
  const { status: rawStatus } = await searchParams;
  const tabs = [['all', 'All'], ['waiting', 'Awaiting payment'], ['paid', 'Processing'], ['shipped', 'Shipped'], ['completed', 'Completed']] as const;
  const status = tabs.some(([key]) => key === rawStatus) ? rawStatus : 'all';
  const matches = (order: typeof orders[number], key: string) => key === 'all' || (key === 'waiting' ? order.status !== 'expired' && order.payment_status !== 'paid' : key === 'paid' ? ['new', 'preparing', 'packed'].includes(orderState(order)) : orderState(order) === key);
  const visible = orders.filter(order => matches(order, status!));
  return <main className="editorial-page mx-auto min-h-[75svh] max-w-[1200px] bg-white px-6 pb-24 pt-10 text-black md:px-16 md:pt-12">
    <Link href="/account" className="text-xs uppercase underline underline-offset-4">‹ Back to account</Link>
    <h1 className="mt-8 text-xl font-semibold uppercase">My orders</h1>
    {stripeTestMode() && <p role="status" className="mt-6 bg-amber-50 px-4 py-3 text-xs">Test orders · No real charge or shipment.</p>}
    <nav aria-label="Order status" className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-b border-black/15 pb-5 text-xs uppercase">{tabs.map(([key, label]) => <Link key={key} href={`/orders?status=${key}`} aria-current={status === key ? 'page' : undefined} className={status === key ? 'font-semibold underline underline-offset-8' : 'text-black/55 hover:text-black'}>{label} ({orders.filter(order => matches(order, key)).length})</Link>)}</nav>
    {error ? <p role="alert" className="mt-12 text-sm text-red-800">Orders are temporarily unavailable. <Link href="/orders" className="underline">Please try again.</Link></p> : visible.length ? <div className="mt-12 grid gap-x-16 gap-y-16 md:grid-cols-2">{visible.map(order => <OrderSummaryCard key={order.id} order={orderSummary(order, content.products)} />)}</div> : <div className="py-20 text-center"><p className="text-sm">No orders in this category.</p><Link href="/collections" className="mt-8 inline-block bg-[#f1e9eb] px-8 py-3 text-sm uppercase">Shop jewelry</Link></div>}
    <p className="mt-12 text-xs text-black/45">Latest orders, up to 100 per payment account.</p>
  </main>;
}
