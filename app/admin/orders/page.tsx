import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminSession } from '../../lib/admin-auth';
import { orderState, orderStateLabels } from '../../lib/orders';
import { stripeClient } from '../../lib/stripe';
import { normalizeTrackingNumber } from '../../lib/thailand-post';

export const dynamic = 'force-dynamic';

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ after?: string; updated?: string }> }) {
  if (!await adminSession()) redirect('/admin/login');
  const { after, updated } = await searchParams;
  let orders: Awaited<ReturnType<ReturnType<typeof stripeClient>['checkout']['sessions']['list']>>['data'] = [];
  let next: string | null = null;
  let error = false;
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const page = await stripeClient().checkout.sessions.list({ limit: 50, status: 'complete', ...(after && /^cs_(test|live)_[A-Za-z0-9]+$/.test(after) ? { starting_after: after } : {}) });
      orders = page.data.filter(order => order.metadata?.source === 'valleys-darley');
      next = page.has_more ? page.data.at(-1)?.id || null : null;
    } catch { error = true; }
  }
  return <main className="min-h-screen bg-[#f4f1ec] px-5 py-12 text-[#211a16] md:px-10"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs tracking-[.25em] text-black/45">CONTENT STUDIO / ORDERS</p><h1 className="mt-2 font-serif text-4xl">รายการสั่งซื้อ</h1></div><Link href="/admin" className="rounded-full border border-black/25 px-5 py-3 text-xs">← กลับ CMS</Link></div>
    {!process.env.STRIPE_SECRET_KEY ? <p className="mt-8 rounded-xl bg-amber-50 p-5 text-sm">ยังไม่ได้ตั้งค่า STRIPE_SECRET_KEY บนเซิร์ฟเวอร์</p> : error ? <p role="alert" className="mt-8 rounded-xl bg-red-50 p-5 text-sm">โหลดรายการจาก Stripe ไม่สำเร็จ กรุณาลองใหม่</p> : <>
      {updated === '1' && <p role="status" className="mt-7 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">อัปเดตสถานะคำสั่งซื้อแล้ว</p>}
      {updated === '0' && <p role="alert" className="mt-7 rounded-xl bg-red-50 p-4 text-sm text-red-800">อัปเดตสถานะไม่สำเร็จ</p>}
      <p className="mt-7 text-xs text-black/50">แสดงออเดอร์ Checkout ที่ลูกค้ากรอกข้อมูลเสร็จแล้ว สถานะชำระเงินอ้างอิง Stripe โดยตรง</p>
      <div className="mt-6 space-y-4">{orders.map(order => {
        const address = order.collected_information?.shipping_details?.address;
        const state = orderState(order);
        return <article key={order.id} className="rounded-2xl bg-white p-5 shadow-sm md:p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs text-black/45">{new Date(order.created * 1000).toLocaleString('th-TH')} · {order.id}</p><h2 className="mt-2 font-serif text-2xl">{order.metadata?.productName || order.metadata?.productId || 'Jewelry'}</h2><p className="mt-2 text-sm">{orderStateLabels[state]}</p></div><p className="font-serif text-2xl">฿{((order.amount_total || 0) / 100).toLocaleString('th-TH')}</p></div>
          <div className="mt-5 grid gap-3 border-t border-black/10 pt-5 text-sm md:grid-cols-2"><div><p className="text-xs text-black/40">LINE MEMBER</p><p className="mt-1">{order.metadata?.lineDisplayName || '—'}</p><p className="break-all text-xs text-black/45">{order.metadata?.lineUserId || '—'}</p></div><div><p className="text-xs text-black/40">CUSTOMER / DELIVERY</p><p className="mt-1">{order.customer_details?.name || '—'} · {order.customer_details?.phone || '—'}</p><p className="break-all text-xs text-black/60">{order.customer_details?.email || '—'}</p>{address && <p className="mt-1 text-xs leading-5 text-black/65">{[address.line1, address.line2, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(', ')}</p>}</div></div>
          {normalizeTrackingNumber(order.metadata?.trackingNumber || '') && <Link href={`/tracking/${encodeURIComponent(order.id)}`} className="mt-4 inline-block text-xs underline">ดูสถานะจากไปรษณีย์ไทย ↗</Link>}
          {state !== 'waiting' && <form action="/api/admin/orders/status" method="post" className="mt-6 flex flex-wrap items-end gap-3 border-t border-black/10 pt-5"><input type="hidden" name="sessionId" value={order.id} /><label className="text-xs">สถานะจัดส่ง<select name="status" defaultValue={state} className="mt-2 block rounded-lg border border-black/20 bg-white px-3 py-2 text-sm"><option value="new">รอดำเนินการ</option><option value="preparing">กำลังเตรียมสินค้า</option><option value="shipped">จัดส่งแล้ว</option><option value="completed">เสร็จสิ้น</option></select></label><label className="text-xs">เลขพัสดุไปรษณีย์ไทย<input name="trackingNumber" defaultValue={order.metadata?.trackingNumber || ''} maxLength={13} placeholder="EA123456789TH" className="mt-2 block rounded-lg border border-black/20 px-3 py-2 text-sm uppercase" /></label><button className="rounded-lg bg-[#211a16] px-5 py-2.5 text-xs text-white">บันทึกสถานะ</button></form>}
        </article>;
      })}{!orders.length && <p className="rounded-xl bg-white p-8 text-sm text-black/50">ยังไม่มีออเดอร์ในหน้านี้</p>}</div>
      <div className="mt-8 flex gap-3"><Link href="/admin/orders" className="rounded-full border border-black/20 px-5 py-2 text-xs">หน้าแรก</Link>{next && <Link href={`/admin/orders?after=${encodeURIComponent(next)}`} className="rounded-full bg-[#211a16] px-5 py-2 text-xs text-white">หน้าถัดไป →</Link>}</div>
    </>}
  </div></main>;
}
