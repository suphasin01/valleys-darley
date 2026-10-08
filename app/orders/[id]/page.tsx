import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { member } from '../../lib/auth';
import { getLocale } from '../../lib/locale';
import { ownsOrder, orderState, orderStateLabels } from '../../lib/orders';
import { stripeClient, stripeTestMode } from '../../lib/stripe';
import { normalizeTrackingNumber } from '../../lib/thailand-post';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const {id}=await params; if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) notFound();
  const user=await member(); if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
  let order;
  try { order=await stripeClient().checkout.sessions.retrieve(id); } catch { notFound(); }
  if (!ownsOrder(order,user)) notFound();
  let lineItems;
  try { lineItems = await stripeClient().checkout.sessions.listLineItems(id, {limit:100, expand:['data.price.product']}); } catch { /* Preserve access to the order status if line-item lookup is temporarily unavailable. */ }
  const th=await getLocale()==='th'; const shipping=order.collected_information?.shipping_details; const address=shipping?.address||order.customer_details?.address;
  const tracker=normalizeTrackingNumber(order.metadata?.trackingNumber||'');
  const itemList = lineItems ? <section className="mt-6 rounded-2xl bg-white p-6 md:p-8"><h2 className="text-2xl">Items in your order</h2><ul className="mt-5 space-y-5">{lineItems.data.map(item => {
    const product = item.price?.product;
    const description = product && typeof product !== 'string' && !product.deleted ? product.description : null;
    return <li key={item.id} className="border-b border-black/10 pb-4"><p>{item.description} · × {item.quantity}</p>{description && <p className="mt-2 text-sm text-black/60">{description}</p>}<p className="mt-2">฿{(item.amount_total / 100).toLocaleString('en-US',{minimumFractionDigits:2})}</p></li>;
  })}</ul></section> : <p role="status" className="mt-6">Item details are temporarily unavailable. Please refresh to try again.</p>;
  return <main className="min-h-[75svh] bg-[#f5f0ed] px-5 py-12 md:py-20"><div className="mx-auto max-w-3xl"><Link href="/orders" className="text-xs underline">← {th?'คำสั่งซื้อของฉัน':'My orders'}</Link><p className="mt-8 text-xs tracking-[.25em] text-black/40">ORDER · {id.slice(-10)}</p><h1 className="mt-3 font-serif text-4xl">{th?'รายละเอียดคำสั่งซื้อ':'Order details'}</h1>
    {stripeTestMode()&&<p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{th?'รายการทดสอบ ไม่เรียกเก็บเงินจริงหรือจัดส่งสินค้า':'Test order — no real charge or shipment'}</p>}
    {order.metadata?.paymentOutcome==='failed'&&order.payment_status!=='paid'&&<p role="alert" className="mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{th?'การชำระเงินไม่สำเร็จ กรุณาเริ่มสั่งซื้อใหม่หรือติดต่อร้าน':'Payment failed. Please start a new checkout or contact us.'} <Link href={`/products/${order.metadata.productId}`} className="underline">{th?'กลับไปสินค้า':'Back to product'}</Link></p>}
    <section className="mt-6 rounded-2xl bg-white p-6 md:p-8"><p className="text-xs text-black/45">{new Date(order.created*1000).toLocaleString(th?'th-TH':'en-US',{timeZone:'Asia/Bangkok'})}</p><h2 className="mt-4 font-serif text-2xl">{order.metadata?.productName}</h2><p className="mt-3 text-sm text-black/60">{order.metadata?.variantLabel} · × {order.metadata?.quantity||1}</p><p className="mt-5 font-serif text-3xl">฿{((order.amount_total||0)/100).toLocaleString('th-TH')}</p><p className="mt-5 rounded-xl bg-[#f5f0ed] p-4 text-sm">{order.status==='expired'?(th?'หมดเวลาชำระเงิน':'Payment expired'):orderStateLabels[orderState(order)]}</p>{order.status==='open'&&order.url&&<a href={order.url} className="mt-5 inline-block rounded-full bg-[#2c2221] px-6 py-3 text-sm text-white">{th?'ดำเนินการชำระเงินต่อ':'Continue payment'} ↗</a>}</section>
    {itemList}
    <section className="mt-6 rounded-2xl bg-white p-6 md:p-8"><h2 className="font-serif text-2xl">{th?'ที่อยู่ในคำสั่งซื้อ':'Order delivery address'}</h2><p className="mt-4 text-sm leading-7">{shipping?.name||order.customer_details?.name||'—'}<br/>{address?[address.line1,address.line2,address.city,address.state,address.postal_code,address.country].filter(Boolean).join(', '):th?'ยังไม่ได้ยืนยันที่อยู่ในหน้าชำระเงิน':'Address has not been confirmed at checkout.'}<br/>{order.customer_details?.phone||''}</p><p className="mt-4 text-xs text-black/45">{th?'การแก้ไขที่อยู่ในบัญชีจะไม่เปลี่ยนที่อยู่ของคำสั่งซื้อที่ยืนยันแล้ว':'Editing your profile does not change a confirmed order address.'}</p></section>
    {tracker&&order.payment_status==='paid'&&<Link href={`/tracking/${id}`} className="mt-6 block rounded-xl border bg-white p-5 text-sm">{th?'ติดตามพัสดุ':'Track parcel'} · {tracker} →</Link>}<Link href="/contact" className="mt-8 inline-block text-sm underline">{th?'ติดต่อร้านเกี่ยวกับคำสั่งซื้อนี้':'Contact us about this order'}</Link>
  </div></main>;
}
