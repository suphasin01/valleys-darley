import { stripeClient } from "../../../lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new Response("Webhook not configured", { status: 400 });
  let event;
  try {
    event = stripeClient().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  if (["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed"].includes(event.type)) {
    const session = event.data.object;
    if (session.object === "checkout.session" && session.metadata?.source === "valleys-darley") {
      console.info("Stripe Checkout event", { eventId: event.id, type: event.type, sessionId: session.id, paymentStatus: session.payment_status });
    }
  }
  return Response.json({ received: true });
}
