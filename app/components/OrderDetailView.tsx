import Link from 'next/link';
import { ReceiptDialog, type ReceiptData } from './ReceiptDialog';

export type OrderDisplayItem = { name: string; quantity: number; unitAmount: number; total: number; description?: string; image?: string };
export function OrderDetailView({ number, name, date, status, items, receipt, testMode, paymentUrl, trackingUrl, address, unavailable }: {
  number: string; name: string; date: string; status: string; items: OrderDisplayItem[]; receipt: ReceiptData | null; testMode: boolean; paymentUrl?: string; trackingUrl?: string; address: string; unavailable: boolean;
}) {
  const money = (amount: number) => `฿${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  return <main className="editorial-page mx-auto min-h-[75svh] bg-white px-6 pb-24 pt-10 text-black md:px-16 md:pt-12"><div className="mx-auto max-w-[900px]">
    <Link href="/account" className="text-xs uppercase underline underline-offset-4">‹ Back to account</Link><h1 className="mt-8 text-xl font-semibold uppercase">{name || 'Your order'}</h1>
    {testMode && <p role="status" className="mt-6 bg-amber-50 px-4 py-3 text-xs">Test order · No real charge or shipment.</p>}
    <section className="mt-12 md:mt-20"><h2 className="sr-only">Order details</h2><dl className="space-y-2 text-sm uppercase"><div><dt className="inline">Order number: </dt><dd className="inline break-all">{number}</dd></div><div><dt className="inline">Order date: </dt><dd className="inline">{date}</dd></div><div><dt className="inline">Status: </dt><dd className="inline">{status}</dd></div></dl>
      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_250px] md:gap-12"><div>{unavailable ? <p role="status" className="text-sm">Item details are temporarily unavailable. Please refresh to try again.</p> : <ul className="space-y-8">{items.map((item, index) => <li key={index} className="flex gap-5 md:gap-8">{item.image ? <img src={item.image} alt={item.name} className="aspect-[3/4] w-24 shrink-0 self-start object-cover md:w-36" /> : <div aria-hidden="true" className="aspect-[3/4] w-24 shrink-0 self-start bg-[#f1e9eb] md:w-36" />}<div className="min-w-0 py-2"><h3 className="text-sm uppercase leading-6">{item.name}</h3><p className="mt-1 text-base">{money(item.unitAmount)} × {item.quantity}</p>{item.description && <p className="mt-6 whitespace-pre-line text-xs uppercase leading-6 text-black/60">{item.description}</p>}</div></li>)}</ul>}</div>
        <aside className="flex flex-col gap-5 md:justify-center">{receipt && <ReceiptDialog receipt={receipt} />}{paymentUrl && <a href={paymentUrl} className="bg-[#f1e9eb] px-6 py-3 text-center text-sm uppercase">Continue payment</a>}{trackingUrl && <Link href={trackingUrl} className="border border-black/20 px-6 py-3 text-center text-sm uppercase">Track parcel</Link>}</aside>
      </div>
    </section>
    <section className="mt-16 border-t border-black/15 pt-8"><h2 className="text-sm uppercase">Delivery address</h2><p className="mt-4 whitespace-pre-line text-sm leading-7">{address || 'Address has not been confirmed at checkout.'}</p><p className="mt-4 text-xs text-black/45">Editing your profile does not change the address of a confirmed order.</p></section><div className="mt-8 flex flex-wrap gap-6 text-sm underline underline-offset-4"><Link href="/orders">View all orders</Link><Link href="/contact">Contact us about this order</Link></div>
  </div></main>;
}
