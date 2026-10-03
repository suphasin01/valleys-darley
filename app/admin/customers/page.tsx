import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminSession } from '../../lib/admin-auth';
import { customerStorageReady, listCustomerProfiles } from '../../lib/customer-profile';
export const dynamic = 'force-dynamic';
export default async function Customers({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  if (!await adminSession()) redirect('/admin/login');
  const params = await searchParams;
  let page: Awaited<ReturnType<typeof listCustomerProfiles>> = { profiles: [], cursor: undefined };
  let failed = false;
  try { page = await listCustomerProfiles(params.cursor?.length && params.cursor.length < 1000 ? params.cursor : undefined); } catch { failed = true; }
  return <main className="min-h-screen bg-[#f4f1ec] px-5 py-12 text-[#211a16]"><div className="mx-auto max-w-5xl"><Link href="/admin" className="text-sm underline">← กลับ CMS</Link><p className="mt-8 text-xs tracking-[.25em] text-black/45">CONTENT STUDIO / CUSTOMERS</p><h1 className="mt-3 font-serif text-4xl">ข้อมูลลูกค้า</h1>
    <p className="mt-4 text-sm text-black/55">ข้อมูลติดต่อและที่อยู่ที่ลูกค้าลงทะเบียนไว้สำหรับคำสั่งซื้อ</p>
    {(!customerStorageReady() || failed) && <p role="alert" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm">ยังโหลดข้อมูลลูกค้าไม่ได้ กรุณาตรวจการตั้งค่าระบบสมาชิกและลองใหม่</p>}
    <div className="mt-8 grid gap-4 sm:grid-cols-2">{page.profiles.map(({ profile, provider }, index) => <article key={index} className="rounded-2xl bg-white p-6"><p className="text-xs text-black/45">{provider}</p><h2 className="mt-2 font-serif text-2xl">{profile.name}</h2><p className="mt-3 break-words text-sm leading-7">{profile.email}<br />{profile.phone}<br />{profile.address}<br />{profile.subdistrict}, {profile.district}, {profile.province} {profile.postalCode}</p>{profile.privacy && <p className="mt-4 text-xs leading-6 text-black/45">รับทราบ PDPA รุ่น {profile.privacy.version}<br />{new Date(profile.privacy.acknowledgedAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })} · {profile.privacy.provider.toUpperCase()}</p>}</article>)}</div>
    {!failed && customerStorageReady() && !page.profiles.length && <p className="mt-8 text-sm text-black/50">ยังไม่มีลูกค้าลงทะเบียนในหน้านี้</p>}
    {page.cursor && <Link href={`/admin/customers?cursor=${encodeURIComponent(page.cursor)}`} className="mt-8 inline-block rounded-full bg-[#211a16] px-6 py-3 text-sm text-white">หน้าถัดไป →</Link>}
  </div></main>;
}
