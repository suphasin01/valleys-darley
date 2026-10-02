import { getCmsContent } from "../../lib/cms";
import { shippingFeeSatang, stripeCheckoutReady, stripeClient } from "../../lib/stripe";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) return new Response("Invalid origin", { status: 403 });
  const form = await request.formData();
  const productId = form.get("productId");
  if (typeof productId !== "string" || !/^[a-z0-9-]{1,80}$/.test(productId)) return new Response("Invalid product", { status: 400 });
  const product = (await getCmsContent()).products.find(item => item.id === productId && item.published);
  if (!product || !Number.isSafeInteger(product.priceBaht) || (product.priceBaht || 0) < 10 || (product.priceBaht || 0) > 999999) return new Response("Product is not available for checkout", { status: 400 });
  if (!stripeCheckoutReady()) return Response.redirect(new URL(`/products/${productId}?checkout=unavailable`, origin), 303);

  try {
    const session = await stripeClient().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price_data: { currency: "thb", unit_amount: product.priceBaht! * 100, product_data: { name: product.name, description: product.description.slice(0, 500) || undefined } }, quantity: 1 }],
      shipping_address_collection: { allowed_countries: ["TH"] },
      shipping_options: [{ shipping_rate_data: { type: "fixed_amount", fixed_amount: { amount: shippingFeeSatang(), currency: "thb" }, display_name: "Thailand shipping" } }],
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/products/${encodeURIComponent(productId)}?checkout=canceled`,
      client_reference_id: productId,
      metadata: { source: "valleys-darley", productId, productName: product.name.slice(0, 500) },
    }, { idempotencyKey: `checkout-${crypto.randomUUID()}` });
    if (!session.url) throw new Error("Missing Checkout URL");
    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error("Stripe checkout creation failed", error instanceof Error ? error.name : "Unknown error");
    return Response.redirect(new URL(`/products/${productId}?checkout=unavailable`, origin), 303);
  }
}
