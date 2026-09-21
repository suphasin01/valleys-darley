import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin, member } from '../lib/auth';
export default async function Account() {
  const user = await member();
  if (!user) redirect('/login');
  return <section className="mx-auto min-h-[70vh] max-w-3xl px-6 pb-20 pt-32"><p className="text-xs tracking-[0.3em] text-gray-400">MY MEMBERSHIP</p><h1 className="mt-4 text-4xl">สวัสดี {user.name}</h1><div className="my-8 rounded-2xl bg-white p-8 shadow-sm"><p className="text-green-700">เชื่อมต่อบัญชี LINE แล้ว</p><p className="mt-3 text-gray-500">ยินดีต้อนรับสู่ Valley’s Darley</p><Link className="btn-primary mt-6" href="/ar">ลองเครื่องประดับ AR</Link></div>{isAdmin(user.sub) && <Link href="/admin" className="mr-6 underline">เข้าสู่หน้าแอดมิน</Link>}<form action="/api/auth/logout" method="post" className="mt-6"><button className="btn-outline">ออกจากระบบ</button></form></section>;
}
