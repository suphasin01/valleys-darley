'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const links = [['/admin', 'ภาพรวม / จัดการเว็บไซต์', '⌂'], ['/admin/orders', 'รายการสั่งซื้อ', '▤'], ['/admin/payments', 'การชำระเงิน', '฿'], ['/admin/shipping', 'ติดตามการจัดส่ง', '▱'], ['/admin/line-shopping', 'LINE SHOPPING', '▦'], ['/admin/customers', 'ข้อมูลลูกค้า', '♙']] as const;
export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  if (path === '/admin/login') return children;
  const title = links.find(([href]) => href === path)?.[1] || 'จัดการร้านค้า';
  return <div className="min-h-screen bg-[#f2f5fa] font-sans text-[#334155]">
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-7"><div className="flex items-center gap-5"><button onClick={() => setOpen(!open)} aria-label="เปิดเมนูแอดมิน" aria-expanded={open} className="rounded-lg p-2 lg:hidden">☰</button><Link href="/admin" className="text-lg font-semibold text-slate-900">Valley&apos;s Darling <span className="text-xs font-normal text-slate-400">ADMIN</span></Link><span className="hidden text-sm text-slate-400 md:block">ร้านค้า / <span className="text-emerald-700">{title}</span></span></div><Link href="/" target="_blank" className="rounded-lg border border-slate-200 px-3 py-2 text-xs">เปิดหน้าร้าน ↗</Link></header>
    <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)]"><aside className={`${open ? 'block' : 'hidden'} border-r border-slate-200 bg-[#f8fafc] p-5 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-64px)]`}><p className="px-3 pb-5 pt-3 text-lg font-semibold text-slate-800">จัดการร้านค้า</p><nav className="space-y-2">{links.map(([href,label,icon]) => <Link key={href} href={href} onClick={() => setOpen(false)} aria-current={path===href?'page':undefined} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${path===href?'bg-emerald-50 font-medium text-emerald-700':'text-slate-500 hover:bg-slate-100'}`}><span aria-hidden="true" className="w-5 text-lg">{icon}</span>{label}</Link>)}</nav><div className="mt-8 border-t border-slate-200 pt-5"><Link href="/admin/line-shopping" className="px-3 text-xs leading-6 text-emerald-700">ดูสินค้าและออร์เดอร์ LINE ↗</Link><form action="/api/admin/logout" method="post"><button className="mt-4 px-3 py-2 text-xs text-slate-500">ออกจากระบบ</button></form></div></aside><div className="min-w-0">{children}</div></div>
  </div>;
}
