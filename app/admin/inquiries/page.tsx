import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminSession } from '../../lib/admin-auth';
import { listInquiries } from '../../lib/inquiries';

export const dynamic = 'force-dynamic';
export default async function InquiryInbox({ searchParams }: { searchParams: Promise<{ cursor?: string }> }) {
  if (!await adminSession()) redirect('/admin/login');
  const { cursor } = await searchParams;
  let page: Awaited<ReturnType<typeof listInquiries>> = { records: [], cursor: undefined }, failed = false;
  try { page = await listInquiries(typeof cursor === 'string' && cursor.length < 1000 ? cursor : undefined); } catch { failed = true; }
  return <main className="p-5 md:p-10"><div className="mx-auto max-w-5xl">
    <h1 className="text-3xl font-semibold text-slate-900">ข้อความ / Newsletter</h1>
    <p className="mt-3 text-sm leading-6 text-slate-500">ข้อความจากฟอร์ม Help และตัวเลือกการรับข่าวสาร ข้อมูลส่วนนี้ไม่ใช่บัญชีสมาชิก และยังไม่มีการส่งอีเมลการตลาดอัตโนมัติ</p>
    {failed ? <p role="alert" className="mt-8 rounded-xl bg-amber-50 p-5">ยังโหลดข้อความไม่ได้ กรุณาตรวจการตั้งค่าและลองใหม่</p> : !page.records.length ? <p className="mt-8 rounded-xl bg-white p-6">ยังไม่มีข้อความในหน้านี้</p> : <div className="mt-8 space-y-5">{page.records.map(record => <article key={record.id} className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><h2 className="text-lg font-semibold">{record.firstName} {record.lastName}</h2><time dateTime={record.createdAt} className="text-xs text-slate-500">{new Date(record.createdAt).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}</time></div>
      <a href={`mailto:${record.email}`} className="mt-2 inline-block break-all text-sm underline">{record.email}</a>
      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">{record.message || 'สมัครรับข่าวสารโดยไม่มีข้อความเพิ่มเติม'}</p>
      <p className={`mt-5 inline-block rounded-full px-3 py-1 text-xs ${record.newsletter ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{record.newsletter ? 'เลือกรับ Newsletter' : 'ไม่ได้เลือกรับ Newsletter'}</p>
      <p className="mt-3 text-xs text-slate-400">รับทราบ Privacy {record.privacyVersion} · ข้อความตัวเลือก {record.consentVersion} · บันทึก {record.createdAt}</p>
    </article>)}</div>}
    {page.cursor && <Link href={`/admin/inquiries?cursor=${encodeURIComponent(page.cursor)}`} className="mt-8 inline-block rounded-lg border bg-white px-5 py-3 text-sm">ดูหน้าถัดไป →</Link>}
  </div></main>;
}
