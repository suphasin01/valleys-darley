import { createHash } from 'node:crypto';
import { getCmsContent } from '../../../lib/cms';
import { parseCart, resolveCart } from '../../../lib/cart';
import { member, memberProvider } from '../../../lib/auth';
import { getCustomerProfile } from '../../../lib/customer-profile';
import { getOrCreateMemberCustomer } from '../../../lib/orders';
import { stripeClient, stripeCheckoutReady, shippingFeeSatang } from '../../../lib/stripe';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return new Response('Invalid origin', {status:403});
  const form = await request.formData();
  const raw = form.get('items');
  const token = form.get('checkoutToken');
  if (typeof raw !== 'string' || raw.length > 12000 || typeof token !== 'string' || !/^[0-9a-f-]{36}$/i.test(token)) return new Response('Invalid cart', {status:400});
  let items;
  try { items = parseCart(JSON.parse(raw)); } catch { return new Response('Invalid cart', {status:400}); }
  if (!items) return new Response('Invalid cart', {status:400});
  const user = await member();
  if (!user) return Response.redirect(new URL('/login?next=%2Fcart',origin),303);
  if (!await getCustomerProfile(user)) return Response.redirect(new URL('/register?next=%2Fcart',origin),303);
  const lines = resolveCart(items,(await getCmsContent()).products);
  const next = `/checkout/cart?items=${encodeURIComponent(JSON.stringify(items))}`;
  if (!lines || !stripeCheckoutReady()) return Response.redirect(new URL(`${next}&error=unavailable`,origin),303);
  try {
    const customer = await getOrCreateMemberCustomer(user);
    const provider = memberProvider(user);
    const shipping = shippingFeeSatang();
    const names = lines.map(line => `${line.product.name}${line.selection.label ? ` (${line.selection.label})` : ''} × ${line.quantity}`).join(', ').slice(0,500);
    const quantity = lines.reduce((sum,line) => sum + line.quantity, 0);
    const session = await stripeClient().checkout.sessions.create({
      mode:'payment', customer,
      line_items:lines.map(line=>({price_data:{currency:'thb',unit_amount:line.selection.amount,product_data:{name:line.product.name,description:[line.selection.label,line.product.description].filter(Boolean).join(' · ').slice(0,500) || undefined}},quantity:line.quantity})),
      shipping_address_collection:{allowed_countries:['TH']},
      shipping_options:[{shipping_rate_data:{type:'fixed_amount',fixed_amount:{amount:shipping,currency:'thb'},display_name:'Thailand shipping'}}],
      phone_number_collection:{enabled:true}, billing_address_collection:'auto',
      success_url:`${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,cancel_url:`${origin}${next}&error=canceled`,
      client_reference_id:user.sub,
      metadata:{source:'valleys-darley',productName:names,quantity:String(quantity),cart:'true',memberId:user.sub,memberName:user.name.slice(0,100),provider,fulfillmentStatus:'new',...(provider==='line'?{lineUserId:user.sub,lineDisplayName:user.name.slice(0,100)}:{})},
      payment_intent_data:{metadata:{source:'valleys-darley',memberId:user.sub,provider}},
    },{idempotencyKey:`cart-${createHash('sha256').update(JSON.stringify([user.sub,token,lines.map(line=>[line.productId,line.variantId,line.quantity,line.selection.amount]),shipping])).digest('hex')}`});
    if (!session.url) throw new Error('Missing Checkout URL');
    return Response.redirect(session.url,303);
  } catch {
    return Response.redirect(new URL(`${next}&error=unavailable`,origin),303);
  }
}
