import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { randomUUID } from 'node:crypto';
import { member } from '../lib/auth';
import { getCmsContent } from '../lib/cms';
import { stripeCheckoutReady, stripeTestMode, shippingFeeSatang } from '../lib/stripe';
import { getCustomerProfile } from '../lib/customer-profile';
import { purchaseSelection } from '../lib/purchase';
import { CheckoutReview } from '../components/CheckoutReview';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Check Out — Valley’s Darling', robots: { index: false, follow: false } };
export default async function Checkout({ searchParams }: { searchParams: Promise<{ product?: string; quantity?: string; variant?: string; error?: string }> }) {
  const { product: id, quantity: rawQuantity, variant: rawVariant, error } = await searchParams;
  if (!id || !/^[a-z0-9-]{1,80}$/.test(id)) notFound();
  const product = (await getCmsContent()).products.find(item => item.id === id && item.published);
  if (!product) notFound();
  const variant = rawVariant ?? String(product.variants?.find(item => item.available > 0)?.id || product.variants?.[0]?.id || '');
  const quantity = /^(?:[1-9]|10)$/.test(rawQuantity || '') ? Number(rawQuantity) : 1;
  const selection = purchaseSelection(product, variant, quantity);
  const next = `/checkout?${new URLSearchParams({ product: id, quantity: String(quantity), ...(variant ? { variant } : {}) })}`;
  const user = await member();
  const profile = user ? await getCustomerProfile(user) : null;
  if (user && !profile) redirect(`/register?next=${encodeURIComponent(next)}`);
  const ready = stripeCheckoutReady();
  const controls = <form method="get" action="/checkout" className="mt-5 space-y-4 text-sm">
    <input type="hidden" name="product" value={id} />
    {product.variants?.length ? <label className="block">Color / size<select name="variant" defaultValue={variant} className="mt-2 min-h-11 w-full rounded-md border border-black/20 bg-white px-3 font-sans">{product.variants.map(item => <option key={item.id} value={item.id} disabled={item.available < 1}>{item.label || item.sku || item.id}{item.available < 1 ? ' — Sold out' : ''}</option>)}</select></label> : null}
    <label className="block">Quantity<select name="quantity" defaultValue={quantity} className="ml-4 min-h-11 rounded-md border border-black/20 bg-white px-4 font-sans">{Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select></label>
    <button className="min-h-11 rounded-md bg-[#f1e9eb] px-6">Update selection</button>
  </form>;
  if (!selection) return <main className="editorial-page mx-auto min-h-[75svh] max-w-xl bg-white px-6 py-20"><h1 className="text-2xl uppercase">Review your selection</h1><p role="alert" className="mt-5 text-sm">This option or quantity is unavailable. Choose an available selection before payment.</p>{controls}<Link href={`/products/${id}`} className="mt-8 inline-block underline">Back to product</Link></main>;
  const payment = !user ? <Link href={`/login?next=${encodeURIComponent(next)}`} className="editorial-button w-full bg-[#f1e9eb]">Sign in to order</Link> : ready ? <form action="/api/checkout" method="post"><input type="hidden" name="productId" value={id} /><input type="hidden" name="quantity" value={quantity} /><input type="hidden" name="variantId" value={selection.variantId} /><input type="hidden" name="checkoutToken" value={randomUUID()} /><button>CONTINUE TO PAYMENT →</button></form> : <p className="text-sm">Payment is not configured yet.</p>;
  return <CheckoutReview lines={[{ productId: id, variantId: selection.variantId, quantity, product, selection }]} profile={profile} shipping={ready ? shippingFeeSatang() : null} payment={payment} testMode={stripeTestMode()} error={error} next={next} selectionControls={<details className="mt-6 text-sm"><summary className="cursor-pointer underline underline-offset-4">Edit product selection</summary>{controls}</details>} />;
}
