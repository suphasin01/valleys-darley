import Link from "next/link";
import { stripeClient, stripeTestMode } from "../../lib/stripe";
import { member } from "../../lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order Status — Valley’s Darling", robots: { index: false, follow: false } };

export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  const user = await member();
  let paid = false;
  let pending = false;
  let productName = "";
  let total = 0;
  if (sessionId && /^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId) && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await stripeClient().checkout.sessions.retrieve(sessionId);
      if (user && session.metadata?.source === "valleys-darley" && (session.metadata.memberId || session.metadata.lineUserId) === user.sub) {
        paid = session.payment_status === "paid";
        pending = !paid && session.status === "complete";
        productName = session.metadata.productName || "";
        total = session.amount_total || 0;
      }
    } catch { /* Invalid or unavailable sessions do not imply payment. */ }
  }
  return <main className="editorial-page flex min-h-[70svh] items-center justify-center bg-white px-6 py-20 text-[#261e1c]"><div className="w-full max-w-xl p-8 text-center md:p-14">
    <p className="text-[10px] uppercase tracking-[.25em]">VALLEY&apos;S DARLING · CHECKOUT</p>
    {stripeTestMode() && <p role="status" className="mt-5 bg-amber-50 p-4 text-sm text-amber-900">Test mode · No real charge or shipment.</p>}
    <h1 className="mt-7 text-4xl">{!user ? "Sign in to view your order" : paid ? "Payment confirmed" : pending ? "Confirming your payment" : "Payment not confirmed"}</h1>
    <p className="mt-5 text-sm leading-7 text-black/60">{!user ? "Use the same account you used at checkout to view your order status." : paid ? `${productName} · ฿${(total / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : pending ? "Your payment is still being processed. Please check your order again shortly." : "We could not confirm a successful payment. If you have been charged, contact us with your Stripe transaction reference."}</p>
    {paid && <p className="mt-4 text-xs leading-6 text-black/50">Your order will be prepared using the delivery details confirmed on Stripe Checkout.</p>}
    <div className="mt-9 flex flex-wrap justify-center gap-3">{!user && <Link href={`/login?next=${encodeURIComponent(`/checkout/success?session_id=${sessionId || ''}`)}`} className="bg-[#f1e9eb] px-6 py-3 text-xs">Sign in</Link>}<Link href={user ? "/orders" : "/collections"} className="border border-[#261e1c] px-6 py-3 text-xs">{user ? "My orders" : "Shop jewelry"}</Link><Link href="/contact" className="border border-[#261e1c] px-6 py-3 text-xs">Contact us</Link></div>
  </div></main>;
}
