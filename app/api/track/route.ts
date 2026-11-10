import { member } from '../../lib/auth';
import { memberOrders } from '../../lib/orders';
import { normalizeTrackingNumber, trackThailandPost } from '../../lib/thailand-post';

export const dynamic = 'force-dynamic';
const reply=(body:object,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
/** Restrict API lookups to a customer's paid orders, not an anonymous parcel scraper. */
export async function POST(request:Request) {
  if (request.headers.get('origin')!==new URL(request.url).origin) return reply({error:'Invalid request.'},403);
  const user=await member();
  if (!user) return reply({error:'Please sign in to track your orders.',signIn:true},401);
  if (Number(request.headers.get('content-length')||0)>1024) return reply({error:'Invalid request.'},413);
  let barcode:string|null=null;
  try {
    const reader=request.body?.getReader();if(!reader)return reply({error:'Invalid request.'},400);
    const chunks:Uint8Array[]=[];let bytes=0;
    while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>1024){await reader.cancel();return reply({error:'Invalid request.'},413);}chunks.push(chunk.value);}
    const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));barcode=typeof body?.barcode==='string'?normalizeTrackingNumber(body.barcode):null;
  } catch {return reply({error:'Please enter a valid tracking number.'},400);}
  if (!barcode) return reply({error:'Please enter a valid tracking number, e.g. EE123456789TH.'},400);
  try {
    const orders=await memberOrders(user,true);
    const order=orders.find(item=>item.payment_status==='paid' && normalizeTrackingNumber(item.metadata?.trackingNumber||'')===barcode);
    if (!order) return reply({error:'No matching shipment was found in this account. Check My orders or use the same sign-in method used for your purchase.'},404);
    if (!process.env.THAILAND_POST_TOKEN_KEY) return reply({error:'Live tracking is not available yet. You can use the official Thailand Post website.',barcode},503);
    const events=await trackThailandPost(barcode,'EN');
    return reply({barcode,events});
  } catch {return reply({error:'Tracking is temporarily unavailable. Please try again later.',barcode},503);}
}
