import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member } from '../lib/auth';
import { getLocale } from '../lib/locale';
import { memberOrders, orderState, orderStateLabels } from '../lib/orders';
import { stripeTestMode } from '../lib/stripe';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function Orders() {
  const user = await member(); if (!user) redirect('/login?next=%2Forders');
  const th = await getLocale() === 'th';
  let orders: Awaited<ReturnType<typeof memberOrders>> = []; let error = false;
  try { orders = await memberOrders(user, true); } catch { error = true; }
  return <main className="min-h-[75svh] bg-[#f5f0ed] px-5 py-12 md:py-20"><div className="mx-auto max-w-4xl"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs tracking-[.25em] text-black/40">VALLEY&apos;S DARLING / ORDERS</p><h1 className="mt-3 font-serif text-4xl">{th?'คำสั่งซื้อของฉัน':'My orders'}</h1><p className="mt-3 text-xs text-black/50">{th?'แสดงรายการล่าสุด สูงสุด 100 รายการต่อบัญชีชำระเงิน':'Latest orders, up to 100 per payment account'}</p></div><Link href="/account" className="text-sm underline">{th?'บัญชีและที่อยู่':'Account & address'}</Link></div>
    {stripeTestMode()&&<p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{th?'รายการทดสอบ ไม่มีการเรียกเก็บเงินจริง':'Test orders — no real payments'}</p>}
    {error?<p role="alert" className="mt-8 text-sm text-red-700">{th?'โหลดคำสั่งซื้อไม่ได้ กรุณาลองใหม่':'Orders are unavailable. Please try again.'}</p>:orders.length?<div className="mt-8 space-y-4">{orders.map(o=><Link href={`/orders/${o.id}`} key={o.id} className="block rounded-2xl border border-black/10 bg-white p-6 transition hover:border-black/30"><div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs text-black/40">{new Date(o.created*1000).toLocaleString(th?'th-TH':'en-US',{timeZone:'Asia/Bangkok'})} · {o.id.slice(-10)}</p><h2 className="mt-3 font-serif text-xl">{o.metadata?.productName}</h2><p className="mt-2 text-xs text-black/50">{o.metadata?.variantLabel} · × {o.metadata?.quantity||1}</p></div><p className="font-serif text-2xl">฿{((o.amount_total||0)/100).toLocaleString('th-TH')}</p></div><p className="mt-4 text-sm">{o.status==='expired'?(th?'หมดเวลาชำระเงิน':'Payment expired'):orderStateLabels[orderState(o)]} →</p></Link>)}</div>:<div className="mt-8 rounded-2xl bg-white p-10 text-center"><p>{th?'ยังไม่มีคำสั่งซื้อ':'No orders yet'}</p><Link href="/collections" className="mt-6 inline-block rounded-full bg-[#2c2221] px-6 py-3 text-sm text-white">{th?'เลือกซื้อสินค้า':'Shop jewelry'}</Link></div>}
  </div></main>;
}
