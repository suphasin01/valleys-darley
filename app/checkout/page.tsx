import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { member, memberProvider } from '../lib/auth';
import { getCmsContent, localizedContent } from '../lib/cms';
import { getLocale } from '../lib/locale';
import { stripeCheckoutReady, stripeTestMode } from '../lib/stripe';
import { getCustomerProfile } from '../lib/customer-profile';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function OrderPage({ searchParams }: { searchParams: Promise<{ product?: string; quantity?: string; error?: string }> }) {
  const { product: id, quantity: rawQuantity, error } = await searchParams;
  if (!id || !/^[a-z0-9-]{1,80}$/.test(id)) notFound();
  const locale = await getLocale();
  const user = await member();
  if (user && !await getCustomerProfile(user)) redirect(`/register?next=${encodeURIComponent(`/checkout?product=${id}`)}`);
  const product = localizedContent(await getCmsContent(), locale).products.find(item => item.id === id && item.published);
  if (!product) notFound();
  const price = Number.isSafeInteger(product.priceBaht) && (product.priceBaht || 0) >= 10 ? product.priceBaht! : null;
  const quantity = /^(?:[1-9]|10)$/.test(rawQuantity || '') ? Number(rawQuantity) : 1;
  const shipping = Number(process.env.STRIPE_SHIPPING_FEE_THB);
  const enabled = stripeCheckoutReady();
  const next = `/checkout?product=${id}&quantity=${quantity}`;
  const th = locale === 'th';
  return <section className="min-h-[75svh] bg-[#f5f0ed] px-5 py-12 text-[#2c2221] md:px-10 md:py-20"><div className="mx-auto max-w-5xl">
    <Link href={`/products/${id}`} className="text-xs text-black/50 underline underline-offset-4">← {th ? 'กลับไปหน้าสินค้า' : 'Back to product'}</Link>
    {stripeTestMode() && <p role="status" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">{th ? 'โหมดทดสอบการชำระเงิน · รายการนี้ไม่เรียกเก็บเงินจริงและจะไม่จัดส่งสินค้า' : 'Test checkout · No real payment will be collected and no items will be shipped.'}</p>}
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.8fr]"><div className="rounded-3xl bg-white p-5 shadow-sm md:p-8"><p className="text-[10px] uppercase tracking-[.28em] text-black/45">VALLEY&apos;S DARLING / CHECKOUT</p><h1 className="mt-3 font-serif text-4xl">{th ? 'สรุปรายการสั่งซื้อ' : 'Your order'}</h1>
      <div className="mt-8 flex gap-5 border-y border-black/10 py-6"><div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f3e8e6]"><Image unoptimized={Boolean(product.lineProductId)} src={product.image} alt={product.name} fill className="object-cover" sizes="96px" /></div><div><h2 className="font-serif text-xl">{product.name}</h2><p className="mt-2 text-xs leading-5 text-black/50">{product.description.slice(0, 120)}</p><p className="mt-3 font-serif text-lg">{price === null ? (th ? 'สอบถามราคา' : 'Price on request') : `฿${price.toLocaleString('th-TH')}`}</p></div></div>
      {price !== null && <form action="/checkout" method="get" className="mt-6 flex items-center gap-4"><input type="hidden" name="product" value={id} /><label htmlFor="quantity" className="text-sm">{th ? 'จำนวน' : 'Quantity'}</label><select id="quantity" name="quantity" defaultValue={quantity} className="rounded-full border border-black/20 bg-white px-5 py-2 text-sm" aria-label={th ? 'จำนวนสินค้า' : 'Quantity'}>{Array.from({ length: 10 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}</option>)}</select><button type="submit" className="text-xs underline underline-offset-4">{th ? 'คำนวณใหม่' : 'Update'}</button></form>}
      <p className="mt-8 text-xs leading-6 text-black/50">{price === null ? (th ? 'ชิ้นนี้ยังไม่ได้กำหนดราคาในร้าน กรุณาติดต่อแอดมินเพื่อสั่งซื้อ' : 'This piece does not have a listed price yet. Contact the store to order.') : (th ? 'ที่อยู่จัดส่งและเบอร์โทรศัพท์จะกรอกในหน้าชำระเงินที่ปลอดภัยของ Stripe ก่อนยืนยันคำสั่งซื้อ' : 'Enter your shipping address and phone number on Stripe’s secure checkout page before confirming your order.')}</p>
    </div><aside className="h-fit rounded-3xl bg-[#eadbd7] p-6 md:p-8"><h2 className="font-serif text-2xl">{th ? 'ยอดชำระ' : 'Order total'}</h2><div className="mt-7 space-y-4 text-sm"><div className="flex justify-between"><span>{th ? 'สินค้า' : 'Items'} {price !== null && `× ${quantity}`}</span><span>{price === null ? '—' : `฿${(price * quantity).toLocaleString('th-TH')}`}</span></div><div className="flex justify-between"><span>{th ? 'ค่าจัดส่งในประเทศไทย' : 'Thailand shipping'}</span><span>{enabled && price !== null ? `฿${shipping.toLocaleString('th-TH')}` : '—'}</span></div><div className="flex justify-between border-t border-black/20 pt-5 font-serif text-2xl"><span>{th ? 'รวม' : 'Total'}</span><span>{enabled && price !== null ? `฿${(price * quantity + shipping).toLocaleString('th-TH')}` : '—'}</span></div></div>
      {error === 'canceled' && <p role="status" className="mt-6 rounded-xl bg-white/70 p-4 text-sm">{th ? 'ยกเลิกการชำระเงินแล้ว ยังไม่มีการเรียกเก็บเงิน' : 'Checkout was canceled. You have not been charged.'}</p>}
      {error === 'unavailable' && <p role="alert" className="mt-6 rounded-xl bg-white/70 p-4 text-sm text-red-700">{th ? 'ยังเริ่มชำระเงินไม่ได้ กรุณาลองใหม่ภายหลัง' : 'Checkout is unavailable. Please try again later.'}</p>}
      {price === null ? <Link href="/contact" className="mt-7 block rounded-full bg-[#2c2221] px-6 py-4 text-center text-sm text-white">{th ? 'ติดต่อแอดมินเพื่อสั่งซื้อ' : 'Contact us to order'} ↗</Link> : !user ? <Link href={`/login?next=${encodeURIComponent(next)}`} className="mt-7 block rounded-full bg-[#2c2221] px-6 py-4 text-center text-sm text-white">{th ? 'เข้าสู่ระบบเพื่อสั่งซื้อ' : 'Sign in to order'} ↗</Link> : enabled ? <form action="/api/checkout" method="post" className="mt-7"><input type="hidden" name="productId" value={id} /><input type="hidden" name="quantity" value={quantity} /><button className="w-full rounded-full bg-[#2c2221] px-6 py-4 text-sm text-white">{th ? 'ไปหน้าชำระเงิน' : 'Continue to payment'} ↗</button></form> : <p role="status" className="mt-7 rounded-xl bg-white/70 p-4 text-sm">{th ? 'ระบบชำระเงินกำลังเตรียมเปิดให้บริการ' : 'Payment is not available yet.'}</p>}
      {user && <p className="mt-4 text-center text-xs text-black/50">{th ? 'สั่งซื้อในชื่อ' : 'Ordering as'} {user.name} · {memberProvider(user).toUpperCase()}</p>}
      <Link href="/contact" className="mt-6 block text-center text-xs underline underline-offset-4">{th ? 'มีคำถาม? ติดต่อร้าน' : 'Questions? Contact us'}</Link>
    </aside></div>
  </div></section>;
}
