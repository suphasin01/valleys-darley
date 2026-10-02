import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member } from '../lib/auth';
import { copy } from '../lib/i18n';
import { getLocale } from '../lib/locale';
import { memberOrders, orderState, orderStateLabels } from '../lib/orders';
export default async function Account() {
  const user = await member();
  if (!user) redirect('/login');
  const locale = await getLocale();
  const t = copy[locale];
  let orders: Awaited<ReturnType<typeof memberOrders>> = [];
  let unavailable = false;
  if (process.env.STRIPE_SECRET_KEY) {
    try { orders = await memberOrders(user.sub); } catch { unavailable = true; }
  }
  return <section className="mx-auto min-h-[70vh] max-w-4xl px-6 pb-20 pt-24"><p className="text-xs tracking-[0.3em] text-gray-400">{t.membership}</p><h1 className="mt-4 font-serif text-4xl">{t.hello} {user.name}</h1><div className="my-8 rounded-2xl bg-white p-8 shadow-sm"><p className="text-green-700">{t.lineConnected}</p><p className="mt-3 text-gray-500">{t.welcomeMember}</p><Link className="btn-primary mt-6" href="/collections">{locale === 'th' ? 'เลือกซื้อสินค้า' : 'SHOP JEWELRY'}</Link></div>
    <h2 className="font-serif text-2xl">{locale === 'th' ? 'คำสั่งซื้อของฉัน' : 'My orders'}</h2>
    {unavailable ? <p role="status" className="mt-5 text-sm text-red-700">{locale === 'th' ? 'ยังโหลดคำสั่งซื้อไม่ได้ กรุณาลองใหม่ภายหลัง' : 'Orders are temporarily unavailable. Please try again later.'}</p> : orders.length ? <div className="mt-5 space-y-3">{orders.map(order => <div key={order.id} className="rounded-xl border border-black/10 bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-black/45">{new Date(order.created * 1000).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US')} · {order.id.slice(-10)}</p><h3 className="mt-2 font-serif text-lg">{order.metadata?.productName || order.metadata?.productId || 'Jewelry'}</h3></div><p className="font-serif text-xl">฿{((order.amount_total || 0) / 100).toLocaleString(locale === 'th' ? 'th-TH' : 'en-US')}</p></div><p className="mt-3 text-sm">{orderStateLabels[orderState(order)]}</p>{order.metadata?.trackingNumber && <p className="mt-2 text-xs text-black/60">{locale === 'th' ? 'เลขติดตามพัสดุ' : 'Tracking'}: {order.metadata.trackingNumber}</p>}</div>)}</div> : <p className="mt-5 text-sm text-black/50">{locale === 'th' ? 'ยังไม่มีคำสั่งซื้อ' : 'No orders yet.'}</p>}
    <form action="/api/auth/logout" method="post" className="mt-10"><button className="btn-outline">{t.logOut}</button></form>
  </section>;
}
