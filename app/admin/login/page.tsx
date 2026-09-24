import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminReady, adminSession } from '../../lib/admin-auth';

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await adminSession()) redirect('/admin');
  const { error } = await searchParams;
  const ready = adminReady();
  return <section className="flex min-h-screen items-center justify-center bg-[#f4f1ec] px-5 py-24 text-[#211a16]">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl md:p-12">
      <p className="brand-script text-3xl">Valley&apos;s Darling</p>
      <p className="mt-2 text-[10px] tracking-[.25em] text-black/40">CONTENT STUDIO</p>
      <h1 className="mt-8 font-serif text-4xl">เข้าสู่ระบบแอดมิน</h1>
      <p className="mt-3 text-sm text-black/55">บัญชีผู้ดูแลแยกจากบัญชีสมาชิก LINE</p>
      {!ready && <p role="status" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">ยังไม่ได้ตั้งค่าบัญชีผู้ดูแลบนเซิร์ฟเวอร์</p>}
      {error === 'credentials' && <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</p>}
      <form action="/api/admin/login" method="post" className="mt-8 space-y-5">
        <label className="block text-sm">ชื่อผู้ใช้<input name="username" autoComplete="username" required maxLength={256} className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black" /></label>
        <label className="block text-sm">รหัสผ่าน<input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3 outline-none focus:border-black" /></label>
        <button disabled={!ready} className="w-full rounded-xl bg-[#211a16] px-5 py-3 font-medium text-white disabled:opacity-40">เข้าสู่ระบบ</button>
      </form>
      <Link href="/" className="mt-8 block text-sm text-black/55 underline">กลับหน้าเว็บไซต์</Link>
    </div>
  </section>;
}
