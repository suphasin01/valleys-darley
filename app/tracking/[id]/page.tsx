import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { adminSession } from '../../lib/admin-auth';
import { member } from '../../lib/auth';
import { getLocale } from '../../lib/locale';
import { stripeClient } from '../../lib/stripe';
import { normalizeTrackingNumber, trackThailandPost } from '../../lib/thailand-post';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };

export default async function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id)) notFound();
  const [user, admin, locale] = await Promise.all([member(), adminSession(), getLocale()]);
  if (!user && !admin) redirect('/login');
  if (!process.env.STRIPE_SECRET_KEY) notFound();

  let barcode: string | null = null;
  let productName = '';
  let orderMemberId = '';
  try {
    const order = await stripeClient().checkout.sessions.retrieve(id);
    if (order.metadata?.source !== 'valleys-darley' || order.payment_status !== 'paid') notFound();
    orderMemberId = order.metadata.memberId || order.metadata.lineUserId || '';
    barcode = normalizeTrackingNumber(order.metadata.trackingNumber || '');
    productName = order.metadata.productName || '';
  } catch { notFound(); }
  if ((!admin && user?.sub !== orderMemberId) || !barcode) notFound();

  let events: Awaited<ReturnType<typeof trackThailandPost>> = [];
  let error: 'configuration' | 'unavailable' | null = null;
  if (!process.env.THAILAND_POST_TOKEN_KEY) error = 'configuration';
  else {
    try { events = await trackThailandPost(barcode, locale === 'th' ? 'TH' : 'EN'); }
    catch { error = 'unavailable'; }
  }
  const officialUrl = `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(barcode)}`;
  const eventKey = (date: string) => {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/.exec(date);
    return match ? Number(`${match[3]}${match[2]}${match[1]}${match[4]}${match[5]}`) : 0;
  };
  const timeline = [...events].sort((a, b) => eventKey(b.date) - eventKey(a.date));
  return <main className="min-h-[75svh] bg-[#f4f1ec] px-5 py-12 text-[#211a16] md:px-10 md:py-20"><div className="mx-auto max-w-3xl">
    <Link href={admin ? '/admin/orders' : '/account'} className="text-xs text-black/55 underline">← {locale === 'th' ? 'กลับไปคำสั่งซื้อ' : 'Back to orders'}</Link>
    <p className="mt-10 text-[10px] uppercase tracking-[.25em] text-black/45">THAILAND POST · TRACK &amp; TRACE</p>
    <h1 className="mt-3 font-serif text-4xl">{locale === 'th' ? 'ติดตามพัสดุ' : 'Track your parcel'}</h1>
    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-8"><p className="text-xs text-black/45">{productName}</p><p className="mt-2 font-serif text-2xl tracking-wide">{barcode}</p><a href={officialUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-xs underline">{locale === 'th' ? 'เปิดเว็บไซต์ไปรษณีย์ไทย' : 'Open Thailand Post website'} ↗</a></div>
    {error === 'configuration' ? <p role="status" className="mt-6 rounded-xl bg-amber-50 p-5 text-sm">{locale === 'th' ? 'ยังไม่เชื่อม API ไปรษณีย์ไทย สามารถตรวจสถานะได้จากลิงก์ทางการด้านบน' : 'Thailand Post API is not connected yet. Use the official tracking link above.'}</p> : error === 'unavailable' ? <p role="status" className="mt-6 rounded-xl bg-rose-50 p-5 text-sm">{locale === 'th' ? 'ยังดึงข้อมูลจากไปรษณีย์ไทยไม่ได้ กรุณาลองใหม่ภายหลัง' : 'Thailand Post tracking is temporarily unavailable. Please try again later.'}</p> : !timeline.length ? <p role="status" className="mt-6 rounded-xl bg-white p-5 text-sm">{locale === 'th' ? 'ยังไม่พบเหตุการณ์สำหรับเลขพัสดุนี้ ลองตรวจใหม่หลังไปรษณีย์รับฝาก' : 'No tracking events yet. Check again after Thailand Post accepts the parcel.'}</p> : <section className="mt-8"><h2 className="font-serif text-2xl">{locale === 'th' ? 'ความคืบหน้าการจัดส่ง' : 'Delivery progress'}</h2><ol className="mt-5 space-y-3">{timeline.map((event, index) => <li key={`${event.date}-${event.status}-${index}`} className="border-l-2 border-[#84694f] bg-white p-5"><p className="text-xs text-black/45">{event.date}{event.location ? ` · ${event.location}` : ''}</p><h3 className="mt-2 font-serif text-lg">{event.description || event.status}</h3>{event.detail && <p className="mt-2 text-sm leading-6 text-black/60">{event.detail}</p>}</li>)}</ol></section>}
  </div></main>;
}
