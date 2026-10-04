import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import { member } from '../lib/auth';
import { getCmsContent, localizedContent } from '../lib/cms';
import { getLocale } from '../lib/locale';
import { stripeCheckoutReady, stripeTestMode, shippingFeeSatang } from '../lib/stripe';
import { getCustomerProfile } from '../lib/customer-profile';
import { purchaseSelection } from '../lib/purchase';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function Checkout({ searchParams }: { searchParams: Promise<{ product?: string; quantity?: string; variant?: string; error?: string }> }) {
  const { product: id, quantity: rawQuantity, variant: rawVariant, error } = await searchParams;
  if (!id || !/^[a-z0-9-]{1,80}$/.test(id)) notFound();
  const locale = await getLocale(); const th = locale === 'th';
  const product = localizedContent(await getCmsContent(), locale).products.find(p=>p.id===id && p.published);
  if (!product) notFound();
  const variant = rawVariant || String(product.variants?.find(v=>v.available>0)?.id || product.variants?.[0]?.id || '');
  const quantity = /^(?:[1-9]|10)$/.test(rawQuantity || '') ? Number(rawQuantity) : 1;
  const selection = purchaseSelection(product, variant, quantity);
  const next = `/checkout?${new URLSearchParams({ product:id, quantity:String(quantity), ...(variant?{variant}: {}) })}`;
  const user = await member(); const profile = user ? await getCustomerProfile(user) : null;
  if (user && !profile) redirect(`/register?next=${encodeURIComponent(next)}`);
  const enabled = stripeCheckoutReady() && (!product.lineProductId || stripeTestMode());
  const shipping = stripeCheckoutReady() ? shippingFeeSatang() / 100 : null;
  const price = selection ? selection.amount / 100 : null;
  const money = (v: number | null) => v === null ? '—' : `฿${v.toLocaleString(th?'th-TH':'en-US',{minimumFractionDigits:2})}`;
  return <main className="min-h-[75svh] bg-[#f5f0ed] px-5 py-10 text-[#2c2221] md:px-10 md:py-16"><div className="mx-auto max-w-6xl">
    <div className="flex justify-between gap-4 text-xs"><Link href={`/products/${id}`} className="underline">← {th?'กลับไปหน้าสินค้า':'Back to product'}</Link><Link href="/orders" className="underline">{th?'คำสั่งซื้อของฉัน':'My orders'}</Link></div>
    <p className="mt-8 text-[10px] tracking-[.25em]">VALLEY&apos;S DARLING / CHECKOUT</p><h1 className="mt-3 font-serif text-4xl">{th?'รายการสั่งซื้อของคุณ':'Your order'}</h1>
    {stripeTestMode()&&<p role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{th?'โหมดทดสอบ · ไม่มีการเรียกเก็บเงินจริงหรือจัดส่งสินค้า และไม่หักสต็อกใน LINE':'Test mode · No real charge, shipment or LINE stock deduction.'}</p>}
    {error&&<p role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error==='stock'?(th?'ตัวเลือกนี้ไม่มีสินค้าเพียงพอ หรือราคาเปลี่ยน กรุณาเลือกใหม่':'Stock or price has changed. Please select again.'):error==='canceled'?(th?'ยกเลิกการชำระเงินแล้ว':'Checkout canceled.'):error==='inventory'?(th?'ยังไม่เปิดรับเงินจริงสำหรับสินค้า LINE จนกว่าระบบจองสต็อกจะพร้อม':'Live LINE-stock checkout is not enabled.'):th?'เริ่มชำระเงินไม่ได้ กรุณาลองใหม่':'Checkout is unavailable. Please try again.'}</p>}
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.65fr]"><section className="rounded-3xl bg-white p-6 md:p-8">
      <div className="flex gap-5 border-b border-black/10 pb-6"><div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl"><Image unoptimized={Boolean(product.lineProductId)} src={product.image} alt={product.name} fill sizes="112px" className="object-cover"/></div><div><h2 className="font-serif text-2xl">{product.name}</h2><p className="mt-3 text-xs leading-6 text-black/50">{product.description.slice(0,150)}</p></div></div>
      <form method="get" action="/checkout" className="mt-6 space-y-5"><input type="hidden" name="product" value={id}/>{product.variants&&<label className="block text-sm">{th?'เลือกสี / ขนาด':'Color / size'}<select name="variant" defaultValue={variant} className="mt-2 w-full rounded-xl border border-black/15 bg-white p-3">{product.variants.map(v=><option key={v.id} value={v.id} disabled={v.available<1}>{v.label||v.sku||v.id} · {money(v.price)} · {v.available<1?(th?'หมด':'Sold out'):`${th?'คงเหลือ':'Available'} ${v.available}`}</option>)}</select></label>}<label className="block text-sm">{th?'จำนวน':'Quantity'}<select name="quantity" defaultValue={quantity} className="ml-4 rounded-xl border border-black/15 bg-white px-4 py-2">{Array.from({length:10},(_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}</select></label><button className="rounded-full border border-black/20 px-6 py-3 text-xs">{th?'อัปเดตรายการ / คำนวณราคา':'Update selection / calculate total'}</button></form>
      {!selection&&<p className="mt-5 text-sm text-rose-700">{th?'กรุณาเลือกตัวเลือกและจำนวนที่มีสินค้าเพียงพอ':'Please choose an available option and quantity.'}</p>}
      <div className="mt-8 border-t border-black/10 pt-6"><h2 className="font-serif text-2xl">{th?'ที่อยู่จัดส่ง':'Delivery address'}</h2>{profile?<><p className="mt-4 text-sm leading-7">{profile.name} · {profile.phone}<br/>{profile.address}<br/>{profile.subdistrict}, {profile.district}, {profile.province} {profile.postalCode}<br/>{profile.email}</p><Link href={`/register?edit=1&next=${encodeURIComponent(next)}`} className="mt-4 inline-block text-xs underline">{th?'แก้ไขที่อยู่':'Edit address'}</Link><p className="mt-4 text-xs text-black/50">{th?'ตรวจและยืนยันที่อยู่อีกครั้งในหน้าชำระเงิน Stripe':'Review and confirm your address on Stripe Checkout.'}</p></>:<p className="mt-4 text-sm text-black/50">{th?'เข้าสู่ระบบด้วย LINE หรือ Google แล้วกรอกข้อมูลจัดส่งก่อนชำระเงิน':'Sign in with LINE or Google and complete your delivery details.'}</p>}</div>
    </section><aside className="h-fit rounded-3xl bg-[#eadbd7] p-6 md:p-8"><h2 className="font-serif text-2xl">{th?'สรุปยอดชำระ':'Order summary'}</h2><p className="mt-4 text-xs leading-6">{selection?.label}</p><dl className="mt-6 space-y-4 text-sm"><div className="flex justify-between"><dt>{th?'สินค้า':'Items'} × {quantity}</dt><dd>{money(price===null?null:price*quantity)}</dd></div><div className="flex justify-between"><dt>{th?'ค่าจัดส่ง':'Shipping'}</dt><dd>{money(shipping)}</dd></div><div className="flex justify-between border-t border-black/20 pt-5 font-serif text-2xl"><dt>{th?'รวม':'Total'}</dt><dd>{money(price===null||shipping===null?null:price*quantity+shipping)}</dd></div></dl>
      {!user?<Link href={`/login?next=${encodeURIComponent(next)}`} className="mt-7 block rounded-full bg-[#2c2221] p-4 text-center text-sm text-white">{th?'เข้าสู่ระบบเพื่อสั่งซื้อ':'Sign in to order'} ↗</Link>:selection&&enabled?<form action="/api/checkout" method="post" className="mt-7"><input type="hidden" name="productId" value={id}/><input type="hidden" name="quantity" value={quantity}/><input type="hidden" name="variantId" value={selection.variantId}/><input type="hidden" name="checkoutToken" value={randomUUID()}/><button className="w-full rounded-full bg-[#2c2221] p-4 text-sm text-white">{th?'ไปหน้าชำระเงิน':'Continue to payment'} ↗</button></form>:<p className="mt-7 text-sm text-black/60">{!selection?(th?'ตัวเลือกนี้ยังสั่งซื้อไม่ได้':'This selection is unavailable.'):(th?'ระบบชำระเงินยังไม่เปิดให้บริการ':'Checkout is not available yet.')}</p>}
      <Link href="/contact" className="mt-6 block text-center text-xs underline">{th?'ต้องการความช่วยเหลือ? ติดต่อร้าน':'Need help? Contact us'}</Link>
    </aside></div>
  </div></main>;
}
