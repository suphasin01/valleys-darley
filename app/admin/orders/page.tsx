import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminSession } from '../../lib/admin-auth';
import { orderState, orderStateLabels } from '../../lib/orders';
import { stripeClient, stripeTestMode } from '../../lib/stripe';
import { normalizeTrackingNumber } from '../../lib/thailand-post';
import { OrderTable, type OrderRow } from './OrderTable';
export const dynamic = 'force-dynamic';
export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ after?: string; updated?: string; view?: string }> }) {
  if (!await adminSession()) redirect('/admin/login');
  const { after, updated, view = 'orders' } = await searchParams;
  let orders: OrderRow[] = []; let next: string | null = null; let error = false;
  const route = view === 'shipping' ? '/admin/shipping' : view === 'payments' ? '/admin/payments' : '/admin/orders';
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const page = await stripeClient().checkout.sessions.list({ limit: 50, ...(after && /^cs_(test|live)_[A-Za-z0-9]+$/.test(after) ? { starting_after: after } : {}) });
      orders = page.data.filter(o => o.metadata?.source === 'valleys-darley').map(o => {
        const address = o.collected_information?.shipping_details?.address || o.customer_details?.address;
        const state = orderState(o); const update = Number(o.metadata?.fulfillmentUpdatedAt);
        return { id:o.id, name:o.collected_information?.shipping_details?.name || o.customer_details?.name || o.metadata?.memberName || '—', email:o.customer_details?.email || '', phone:o.customer_details?.phone || '', address:address ? [address.line1,address.line2,address.city,address.state,address.postal_code,address.country].filter(Boolean).join(', ') : '', product:[o.metadata?.productName || o.metadata?.productId || 'Jewelry',o.metadata?.variantLabel,o.metadata?.quantity?`× ${o.metadata.quantity}`:''].filter(Boolean).join(' · '), created:o.created, updated:Number.isFinite(update)&&update>0?update:o.created, amount:o.amount_total || 0, state, label:orderStateLabels[state], tracking:o.metadata?.trackingNumber || '', trackable:!!normalizeTrackingNumber(o.metadata?.trackingNumber || '') };
      });
      next = page.has_more ? page.data.at(-1)?.id || null : null;
    } catch { error = true; }
  }
  return <section className="p-4 md:p-8"><div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-slate-400">E-Commerce / {view}</p><h1 className="mt-2 text-2xl font-semibold text-slate-800">{view==='shipping'?'ติดตามการจัดส่ง':view==='payments'?'การชำระเงิน':'รายการสั่งซื้อ'}</h1></div><Link href={route} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm">รีเฟรชข้อมูล ↻</Link></div>
  <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm leading-6 text-blue-800">ข้อมูลคำสั่งซื้อจากเว็บไซต์ · ยืนยันการชำระเงินผ่าน Stripe · ติดตามเลขพัสดุผ่าน API ไปรษณีย์ไทย<br/><Link href="/admin/line-shopping" className="text-xs text-blue-600 underline">ดูออร์เดอร์และเลขพัสดุจาก LINE SHOPPING →</Link></div>
  {stripeTestMode()&&<p className="mt-4 rounded-lg bg-amber-50 p-4 text-xs text-amber-800">Stripe โหมดทดสอบ — รายการจำลอง ไม่ใช่ยอดรับเงินจริง</p>}
  {updated&&<p role={updated==='1'?'status':'alert'} className={`mt-4 rounded-lg p-4 text-sm ${updated==='1'?'bg-emerald-50 text-emerald-800':'bg-red-50 text-red-800'}`}>{updated==='1'?'บันทึกสถานะแล้ว ลูกค้าจะเห็นข้อมูลล่าสุดในบัญชี':'บันทึกไม่สำเร็จ กรุณาลองใหม่'}</p>}
  {!process.env.STRIPE_SECRET_KEY||error?<p role="alert" className="mt-6 rounded-xl bg-red-50 p-5 text-sm text-red-800">{error?'โหลดคำสั่งซื้อไม่สำเร็จ กรุณาลองใหม่':'ยังไม่ได้เชื่อม Stripe บนเซิร์ฟเวอร์'}</p>:<><OrderTable orders={orders} view={view}/><div className="mt-6 flex justify-between gap-3 text-xs"><Link href={route} className="rounded-lg border bg-white px-4 py-3">หน้าแรก</Link>{next&&<Link href={`${route}?after=${encodeURIComponent(next)}`} className="rounded-lg bg-emerald-600 px-4 py-3 text-white">หน้าถัดไป →</Link>}</div></>}
  </section>;
}
