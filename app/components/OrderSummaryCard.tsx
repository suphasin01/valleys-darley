import Link from 'next/link';
import type { OrderSummary } from '../lib/order-summary';

export function OrderSummaryCard({ order }: { order: OrderSummary }) {
  return <article className="min-w-0 text-sm">
    <dl className="space-y-1 uppercase leading-6">
      <div><dt className="inline">Order number: </dt><dd className="inline break-all">{order.number}</dd></div>
      <div><dt className="inline">Order date: </dt><dd className="inline">{order.date}</dd></div>
      <div><dt className="inline">Status: </dt><dd className="inline">{order.status}</dd></div>
    </dl>
    {order.images.length > 0 && <Link href={`/orders/${order.id}`} aria-label={`View order ${order.number}`} className="mt-7 flex w-fit max-w-full flex-wrap gap-3">
      {order.images.map(image => <img key={image.src} src={image.src} alt={image.name} width={156} height={200} className="aspect-[.78] w-28 object-cover md:w-[156px]" />)}
    </Link>}
    <h3 className="mt-5 max-w-md text-sm uppercase leading-6">{order.name}</h3>
    {order.variant && <p className="mt-1 text-xs uppercase text-black/60">{order.variant}</p>}
    <p className="mt-2">{new Intl.NumberFormat('en-US', { style: 'currency', currency: order.currency.toUpperCase() }).format(order.amount / 100)}</p>
    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-xs uppercase underline underline-offset-4"><Link href={`/orders/${order.id}`}>View order details</Link>{order.tracking && <Link href={`/tracking/${order.id}`}>Track parcel</Link>}</div>
  </article>;
}
