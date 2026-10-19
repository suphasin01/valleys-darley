import Link from "next/link";
import type { OrderSummary } from "../lib/order-summary";
import { OrderSummaryCard } from './OrderSummaryCard';
import { AccountAddress } from './AccountAddress';

type Profile = { name: string; phone: string; address: string; subdistrict: string; district: string; province: string; postalCode: string; email: string };

export function AccountOverview({ profile, provider, orders, unavailable }: { profile: Profile; provider: string; orders: OrderSummary[]; unavailable: boolean }) {
  return <main className="editorial-page mx-auto min-h-[75svh] max-w-[1440px] bg-white px-6 pb-24 pt-12 text-black md:px-[7%] md:pt-24">
    <h1 className="sr-only">My account</h1>
    <div className="grid gap-14 md:grid-cols-[1fr_2fr] md:gap-[12%]">
      <section className="min-w-0"><h2 className="text-sm uppercase">Profile</h2><p className="mt-4 text-xl uppercase">{profile.name}</p><p className="mt-3 break-words text-base">{profile.email}</p><p className="mt-3 text-xs text-black/50">Signed in with {provider.toUpperCase()}</p>
        <AccountAddress profile={profile} />
        <Link href="/register?edit=1&next=%2Faccount" className="mt-5 inline-block text-xs underline underline-offset-4">Edit profile & privacy preferences</Link>
      </section>
      <section className="min-w-0"><div className="flex items-start justify-between gap-5"><h2 className="text-sm uppercase">Orders</h2><form action="/api/auth/logout" method="post"><button className="min-h-8 text-xs uppercase underline underline-offset-4">Logout</button></form></div>
        {unavailable ? <p role="status" className="mt-8 text-sm text-red-800">Orders are temporarily unavailable. Please try again later.</p> : orders.length ? <div className="mt-12 grid gap-x-10 gap-y-14 lg:grid-cols-2">{orders.slice(0, 6).map(order => <OrderSummaryCard key={order.id} order={order} />)}</div> : <p className="mt-8 text-sm text-black/60">No orders yet.</p>}
        <Link href="/orders" className="mt-8 inline-block text-sm underline underline-offset-4">View all orders & pending payments</Link><br /><Link href="/collections" className="mt-5 inline-block bg-[#f1e9eb] px-8 py-3 text-sm uppercase">Continue shopping</Link>
      </section>
    </div>
  </main>;
}
