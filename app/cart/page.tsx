import { CartView } from '../components/Cart';
import { getCmsContent, localizedContent } from '../lib/cms';
import { shippingFeeSatang, stripeCheckoutReady } from '../lib/stripe';
export const dynamic = 'force-dynamic';
export const metadata = { title: "Shopping bag | Valley's Darling", robots: {index:false,follow:false} };
export default async function CartPage() {
  const {products} = localizedContent(await getCmsContent(), 'en');
  return <main className="editorial-page min-h-[70svh] bg-white px-5 py-16 text-black md:px-[7%]"><div className="mx-auto max-w-[1280px]"><CartView products={products.filter(p => p.published)} shipping={stripeCheckoutReady() ? shippingFeeSatang() : null} /></div></main>;
}
