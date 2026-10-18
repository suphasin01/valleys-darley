import Link from "next/link";
import type { memberOrders } from "../lib/orders";
import { orderState, orderStateLabels } from "../lib/order-state";

type Profile = { name: string; phone: string; address: string; subdistrict: string; district: string; province: string; postalCode: string; email: string };

export function AccountOverview({ profile, provider, orders, unavailable }: { profile: Profile; provider: string; orders: Awaited<ReturnType<typeof memberOrders>>; unavailable: boolean }) {
  return <main className="editorial-page mx-auto min-h-[75svh] max-w-[1440px] bg-white px-6 pb-24 pt-12 text-black md:px-[7%] md:pt-24">
    <h1 className="sr-only">My account</h1>
    <div className="grid gap-14 md:grid-cols-[1fr_2fr] md:gap-[12%]">
      <section className="min-w-0"><h2 className="text-sm uppercase">Profile</h2><p className="mt-4 text-xl uppercase">{profile.name}</p><p className="mt-3 break-words text-base">{profile.email}</p><p className="mt-3 text-xs text-black/50">Signed in with {provider.toUpperCase()}</p>
        <div className="mt-12 flex justify-between gap-4"><h2 className="text-sm uppercase">Address</h2><Link href="/register?edit=1&next=%2Faccount" className="text-xs uppercase underline underline-offset-4">Edit</Link></div>
        <address className="mt-4 not-italic text-sm leading-8"><p className="border-b border-black/30">{profile.name} · {profile.phone}</p><p className="border-b border-black/30">{profile.address}</p><p className="border-b border-black/30">{profile.subdistrict}, {profile.district}</p><p className="border-b border-black/30">{profile.province} {profile.postalCode}, Thailand</p></address>
        <Link href="/register?edit=1&next=%2Faccount" className="mt-5 inline-block text-xs underline underline-offset-4">Edit profile & privacy preferences</Link>
      </section>
      <section className="min-w-0"><div className="flex items-start justify-between gap-5"><h2 className="text-sm uppercase">Orders</h2><form action="/api/auth/logout" method="post"><button className="min-h-8 text-xs uppercase underline underline-offset-4">Logout</button></form></div>
        {unavailable ? <p role="status" className="mt-8 text-sm text-red-800">Orders are temporarily unavailable. Please try again later.</p> : orders.length ? <div className="mt-8 grid gap-8 sm:grid-cols-2">{orders.slice(0, 6).map(order => <article key={order.id} className="border-b border-black/15 pb-6 text-sm"><p>ORDER NUMBER: {order.id.slice(-10)}</p><p className="mt-2">ORDER DATE: {new Date(order.created * 1000).toLocaleDateString('en-GB', { timeZone: 'Asia/Bangkok' })}</p><h3 className="mt-5 uppercase leading-6">{order.metadata?.productName || 'Jewelry'}</h3><p className="mt-3">{orderStateLabels[orderState(order)]}</p><p className="mt-3">฿{((order.amount_total || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p><Link href={`/orders/${order.id}`} className="mt-5 inline-block text-xs uppercase underline underline-offset-4">View order details</Link></article>)}</div> : <p className="mt-8 text-sm text-black/60">No orders yet.</p>}
        <Link href="/orders" className="mt-8 inline-block text-sm underline underline-offset-4">View all orders & pending payments</Link><br /><Link href="/collections" className="mt-5 inline-block bg-[#f1e9eb] px-8 py-3 text-sm uppercase">Continue shopping</Link>
      </section>
    </div>
  </main>;
}
