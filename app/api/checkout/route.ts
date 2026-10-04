import { getCmsContent } from "../../lib/cms";
import { shippingFeeSatang, stripeCheckoutReady, stripeClient } from "../../lib/stripe";
import { purchaseSelection } from '../../lib/purchase';
import { createHash } from 'node:crypto';
import { member, memberProvider } from "../../lib/auth";
import { getOrCreateMemberCustomer } from "../../lib/orders";
import { getCustomerProfile } from "../../lib/customer-profile";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) return new Response("Invalid origin", { status: 403 });
  const form = await request.formData();
  const productId = form.get("productId");
  if (typeof productId !== "string" || !/^[a-z0-9-]{1,80}$/.test(productId)) return new Response("Invalid product", { status: 400 });
  const quantityRaw = form.get("quantity") ?? "1";
  const quantity = Number(quantityRaw);
  if (typeof quantityRaw !== "string" || !/^(?:[1-9]|10)$/.test(quantityRaw) || !Number.isSafeInteger(quantity)) return new Response("Invalid quantity", { status: 400 });
  const variantRaw = form.get('variantId');
  const variantId = typeof variantRaw === 'string' && /^[0-9]{1,20}$/.test(variantRaw) ? variantRaw : undefined;
  const token = form.get('checkoutToken');
  if (typeof token !== 'string' || !/^[0-9a-f-]{36}$/i.test(token)) return new Response('Invalid checkout token', { status: 400 });
  const next = `/checkout?${new URLSearchParams({ product: productId, quantity: String(quantity), ...(variantId ? {variant:variantId}: {}) })}`;
  const user = await member();
  if (!user) return Response.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, origin), 303);
  if (!await getCustomerProfile(user)) return Response.redirect(new URL(`/register?next=${encodeURIComponent(next)}`, origin), 303);
  const product = (await getCmsContent()).products.find(item => item.id === productId && item.published);
  const selection = product && purchaseSelection(product, variantId, quantity);
  if (!product || !selection) return Response.redirect(new URL(`${next}&error=stock`, origin), 303);
  if (!stripeCheckoutReady()) return Response.redirect(new URL(`/checkout?product=${productId}&quantity=${quantity}&error=unavailable`, origin), 303);

  try {
    const customerId = await getOrCreateMemberCustomer(user);
    const provider = memberProvider(user);
    const session = await stripeClient().checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price_data: { currency: "thb", unit_amount: selection.amount, product_data: { name: product.name, description: [selection.label, product.description].filter(Boolean).join(' · ').slice(0, 500) || undefined } }, quantity }],
      shipping_address_collection: { allowed_countries: ["TH"] },
      shipping_options: [{ shipping_rate_data: { type: "fixed_amount", fixed_amount: { amount: shippingFeeSatang(), currency: "thb" }, display_name: "Thailand shipping" } }],
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${next}&error=canceled`,
      client_reference_id: user.sub,
      metadata: { source: "valleys-darley", productId, productName: product.name.slice(0, 500), variantId: selection.variantId, variantLabel: selection.label.slice(0, 200), quantity: String(quantity), memberId: user.sub, memberName: user.name.slice(0, 100), provider, ...(provider === 'line' ? { lineUserId: user.sub, lineDisplayName: user.name.slice(0, 100) } : {}), fulfillmentStatus: "new" },
      payment_intent_data: { metadata: { source: "valleys-darley", productId, memberId: user.sub, provider } },
    }, { idempotencyKey: `checkout-${createHash('sha256').update(JSON.stringify([user.sub, token, productId, selection.variantId, quantity, selection.amount, shippingFeeSatang()])).digest('hex')}` });
    if (!session.url) throw new Error("Missing Checkout URL");
    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error("Stripe checkout creation failed", error instanceof Error ? error.name : "Unknown error");
    return Response.redirect(new URL(`${next}&error=unavailable`, origin), 303);
  }
}
