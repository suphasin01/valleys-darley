import Stripe from "stripe";

export function stripeTestMode() {
  return process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") === true;
}

export function stripeCheckoutReady() {
  const shipping = Number(process.env.STRIPE_SHIPPING_FEE_THB);
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_SHIPPING_FEE_THB !== undefined && Number.isSafeInteger(shipping) && shipping >= 0 && shipping <= 100000);
}

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_NOT_CONFIGURED");
  return new Stripe(key);
}

export function shippingFeeSatang() {
  const amount = Number(process.env.STRIPE_SHIPPING_FEE_THB);
  if (!stripeCheckoutReady()) throw new Error("STRIPE_NOT_CONFIGURED");
  return amount * 100;
}
