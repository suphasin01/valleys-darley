import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin, member } from '../lib/auth';
export default async function Admin() {
  const user = await member();
  if (!user) redirect('/login?next=admin');
  if (!isAdmin(user.sub)) return <section className="min-h-[70vh] px-6 pt-32 text-center"><h1 className="text-3xl">บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ</h1><p className="my-6">กรุณาติดต่อผู้ดูแลเพื่อขอสิทธิ์</p><Link href="/account" className="underline">กลับบัญชีสมาชิก</Link></section>;
  return <section className="mx-auto min-h-[70vh] max-w-5xl px-6 pb-20 pt-32"><p className="text-xs tracking-[0.3em] text-gray-400">VALLEY’S DARLEY / ADMIN</p><h1 className="mt-4 text-4xl">พื้นที่ผู้ดูแลระบบ</h1><p className="mt-4">เข้าสู่ระบบในชื่อ {user.name}</p><div className="my-8 rounded-2xl bg-white p-8 shadow-sm"><h2 className="text-xl">ระบบสมาชิก</h2><p className="mt-3 text-gray-500">เตรียมพื้นที่สำหรับจัดการสมาชิกแล้ว ยังไม่ได้เปิดระบบรายชื่อสมาชิกและการจัดการข้อมูล</p></div><Link href="/account" className="underline">บัญชีของฉัน</Link><form action="/api/auth/logout" method="post" className="mt-6"><button className="btn-outline">ออกจากระบบ</button></form></section>;
}
