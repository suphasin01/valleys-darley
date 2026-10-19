import { getCmsContent } from '../../../lib/cms';
import { publicCartProducts } from '../../../lib/cart-catalog';
import { shippingFeeSatang, stripeCheckoutReady } from '../../../lib/stripe';

export const dynamic = 'force-dynamic';
export async function GET() {
  try {
    const content = await getCmsContent();
    return Response.json({ products: publicCartProducts(content.products), shipping: stripeCheckoutReady() ? shippingFeeSatang() : null }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Catalog temporarily unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
