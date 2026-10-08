import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { member } from '../../lib/auth';
import { getCustomerProfile } from '../../lib/customer-profile';
import { getCmsContent, localizedContent } from '../../lib/cms';
import { parseCart, resolveCart } from '../../lib/cart';
import { shippingFeeSatang, stripeCheckoutReady, stripeTestMode } from '../../lib/stripe';
export const dynamic = 'force-dynamic';
export const metadata = { robots: {index:false,follow:false} };
export default async function CartCheckout({searchParams}:{searchParams:Promise<{items?:string;error?:string}>}) {
  const params = await searchParams;
  let items = null;
  try { if (params.items && params.items.length <= 12000) items = parseCart(JSON.parse(params.items)); } catch { /* Invalid cart is never payable. */ }
  const products = localizedContent(await getCmsContent(), 'en').products;
  const lines = items && resolveCart(items, products);
  if (!lines) return <main className="editorial-page bg-white px-5 py-24 text-center"><h1 className="text-3xl">Please review your bag</h1><p className="mt-6">An item is unavailable or the selection is invalid.</p><Link href="/cart" className="editorial-button mt-8">Back to bag</Link></main>;
  const user = await member();
  const profile = user ? await getCustomerProfile(user) : null;
  const ready = stripeCheckoutReady();
  const shipping = ready ? shippingFeeSatang() : null;
  const subtotal = lines.reduce((sum,line) => sum + line.selection.amount * line.quantity, 0);
  const money = (amount:number) => `฿${(amount / 100).toLocaleString('en-US',{minimumFractionDigits:2})}`;
  return <main className="editorial-page bg-white px-5 py-16 text-black md:px-[7%]"><div className="mx-auto max-w-[1100px]"><Link href="/cart" className="underline">← Back to bag</Link><h1 className="mt-10 text-4xl">Check out</h1>{stripeTestMode() && <p role="status" className="mt-6 bg-amber-50 p-4">Test mode · No real charge or shipment.</p>}{params.error && <p role="alert" className="mt-6 bg-rose-50 p-4">{params.error === 'canceled' ? 'Payment canceled. Your bag has been kept.' : 'Unable to start payment. Review availability in your bag and try again.'}</p>}
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]"><section><h2 className="text-2xl">Delivery details</h2>{profile ? <><p className="mt-6 leading-8">{profile.name}<br/>{profile.phone}<br/>{profile.address}<br/>{profile.subdistrict}, {profile.district}<br/>{profile.province} {profile.postalCode}<br/>Thailand<br/>{profile.email}</p><Link href="/register?edit=1&next=%2Fcart" className="mt-5 inline-block underline">Edit address</Link><p className="mt-6 text-sm">Review and confirm your address on Stripe Checkout.</p></> : <p className="mt-6">Sign in and complete your delivery address to continue.</p>}<p className="mt-8 text-sm">Online checkout supports Thailand delivery. For international shipping, <Link href="/help#contact" className="underline">contact us for a quote</Link>.</p></section>
    <aside className="h-fit rounded-lg bg-[#f1e9eb] p-6"><h2 className="text-2xl">Your order</h2><ul className="mt-6 space-y-5">{lines.map(line=><li key={`${line.productId}:${line.variantId}`}><p>{line.product.name}</p><p className="text-sm">{line.selection.label} · × {line.quantity}</p><p className="mt-2">{money(line.selection.amount * line.quantity)}</p></li>)}</ul><dl className="mt-6 space-y-4 border-t border-black/20 pt-6"><div className="flex justify-between"><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === null ? '—' : money(shipping)}</dd></div><div className="flex justify-between text-xl"><dt>Total</dt><dd>{shipping === null ? '—' : money(subtotal + shipping)}</dd></div></dl>
    {!user ? <Link href="/login?next=%2Fcart" className="editorial-button mt-6 w-full bg-white">Sign in to order</Link> : !profile ? <Link href="/register?next=%2Fcart" className="editorial-button mt-6 w-full bg-white">Complete delivery details</Link> : ready ? <form action="/api/checkout/cart" method="post" className="mt-6"><input type="hidden" name="items" value={JSON.stringify(items)}/><input type="hidden" name="checkoutToken" value={randomUUID()}/><button className="w-full rounded-lg bg-white p-4">CONTINUE TO PAYMENT →</button></form> : <p className="mt-6">Payment is not configured yet.</p>}
    </aside></div></div></main>;
}
