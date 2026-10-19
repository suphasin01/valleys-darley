import Link from 'next/link';
import { randomUUID } from 'node:crypto';
import { member } from '../../lib/auth';
import { getCustomerProfile } from '../../lib/customer-profile';
import { getCmsContent, localizedContent } from '../../lib/cms';
import { parseCart, resolveCart } from '../../lib/cart';
import { shippingFeeSatang, stripeCheckoutReady, stripeTestMode } from '../../lib/stripe';
import { CheckoutReview } from '../../components/CheckoutReview';

export const dynamic = 'force-dynamic';
export const metadata = { title: "Check Out — Valley’s Darling", robots: { index: false, follow: false } };
export default async function CartCheckout({ searchParams }: { searchParams: Promise<{ items?: string; error?: string }> }) {
  const params = await searchParams;
  let items = null;
  try { if (params.items && params.items.length <= 12000) items = parseCart(JSON.parse(params.items)); } catch { /* Invalid cart is never payable. */ }
  const products = localizedContent(await getCmsContent(), 'en').products;
  const lines = items && resolveCart(items, products);
  if (!lines) return <main className="editorial-page bg-white px-5 py-24 text-center"><h1 className="text-3xl">Please review your bag</h1><p className="mt-6">An item is unavailable or the selection is invalid.</p><Link href="/cart" className="editorial-button mt-8">Back to bag</Link></main>;
  const user = await member();
  const profile = user ? await getCustomerProfile(user) : null;
  const ready = stripeCheckoutReady();
  const payment = !user ? <Link href="/login?next=%2Fcart" className="editorial-button w-full bg-[#f1e9eb]">Sign in to order</Link>
    : !profile ? <Link href="/register?next=%2Fcart" className="editorial-button w-full bg-[#f1e9eb]">Complete delivery details</Link>
      : ready ? <form action="/api/checkout/cart" method="post"><input type="hidden" name="items" value={JSON.stringify(items)} /><input type="hidden" name="checkoutToken" value={randomUUID()} /><button>CONTINUE TO PAYMENT →</button></form>
        : <p className="text-sm">Payment is not configured yet.</p>;
  return <CheckoutReview lines={lines} profile={profile} shipping={ready ? shippingFeeSatang() : null} payment={payment} testMode={stripeTestMode()} error={params.error} />;
}
