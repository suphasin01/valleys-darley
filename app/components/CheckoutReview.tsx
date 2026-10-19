import Link from 'next/link';
import { BrandLogo } from './Header';
import { editorialImage } from '../lib/editorial-images';
import type { resolveCart } from '../lib/cart';

type Profile = { name: string; email: string; phone: string; address: string; subdistrict: string; district: string; province: string; postalCode: string };
export function CheckoutReview({ lines, profile, shipping, payment, testMode, error, selectionControls, next = '/cart' }: {
  lines: NonNullable<ReturnType<typeof resolveCart>>; profile: Profile | null; shipping: number | null; payment: React.ReactNode; testMode: boolean; error?: string; selectionControls?: React.ReactNode; next?: string;
}) {
  const subtotal = lines.reduce((sum, line) => sum + line.selection.amount * line.quantity, 0);
  const money = (amount: number) => `฿${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const fields = profile ? [
    ['Name', profile.name, 'col-span-2'], ['Address', profile.address, 'col-span-2'],
    ['Subdistrict', profile.subdistrict, ''], ['District', profile.district, ''],
    ['Province', profile.province, ''], ['Postal code', profile.postalCode, ''], ['Phone', profile.phone, 'col-span-2'],
  ] : [];
  return <main className="editorial-page min-h-screen bg-white text-black">
    <header className="border-b border-black/15"><div className="mx-auto flex min-h-24 max-w-[1440px] items-center justify-between px-6 md:min-h-32 md:px-[5%]"><Link href="/" aria-label="Valley's Darling home"><BrandLogo className="text-[24px] md:text-[34px]" /></Link><Link href="/cart" aria-label="Return to cart" className="p-3 text-[#cdbac2]"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.3"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg></Link></div></header>
    <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[52fr_48fr]">
      <section className="px-6 py-10 md:px-[7%] lg:py-16">
        <nav className="flex flex-wrap gap-6 text-xs uppercase underline underline-offset-4"><Link href="/cart">‹ Return to cart</Link><Link href="/collections">Continue shopping</Link></nav>
        <h1 className="sr-only">Check out</h1>
        {selectionControls}
        {testMode && <p role="status" className="mt-6 bg-amber-50 px-4 py-3 text-xs">Test mode · No real charge or shipment.</p>}
        {error && <p role="alert" className="mt-5 bg-rose-50 px-4 py-3 text-sm">{error === 'canceled' ? 'Payment canceled. Your bag has been kept.' : 'Unable to start payment. Review your bag and try again.'}</p>}
        <section className="mt-10"><h2 className="text-xl uppercase lg:text-right">Contact us</h2>{profile ? <label className="mt-5 block text-xs"><span className="sr-only">Contact email</span><input aria-label="Contact email" readOnly value={profile.email} className="w-full rounded-md border border-black/15 px-4 py-3 font-sans text-sm text-black/65" /></label> : <p className="mt-5 text-sm">Sign in and complete your delivery details to continue.</p>}</section>
        <section className="mt-16 md:mt-24"><div className="flex items-center justify-between gap-5"><h2 className="text-xl uppercase">Delivery</h2>{profile && <Link href={`/register?edit=1&next=${encodeURIComponent(next)}`} className="text-xs underline underline-offset-4">Edit details</Link>}</div>{profile ? <div className="mt-5 grid grid-cols-2 gap-3"><label className="col-span-2 text-xs"><span className="sr-only">Country</span><input aria-label="Country" readOnly value="Thailand" className="w-full rounded-md border border-black/15 px-4 py-3 font-sans text-sm text-black/65" /></label>{fields.map(([label, value, span]) => <label key={label} className={`${span} text-xs`}><span className="sr-only">{label}</span><input aria-label={label} readOnly value={value} className="w-full rounded-md border border-black/15 px-4 py-3 font-sans text-sm text-black/65" /></label>)}</div> : <Link href={`/register?next=${encodeURIComponent(next)}`} className="mt-5 inline-block text-sm underline">Complete delivery address</Link>}</section>
        <section className="mt-12"><h2 className="text-xl uppercase">Shipping method</h2><p className="mt-5 rounded-md border border-black/15 px-4 py-4 text-sm">Thailand delivery <span className="float-right">{shipping === null ? 'At checkout' : money(shipping)}</span></p><p className="mt-3 text-xs text-black/55">For international delivery, <Link href="/contact" className="underline">contact us for a quote</Link>.</p></section>
        <section className="mt-12"><h2 className="text-xl uppercase">Payment</h2><p className="mt-4 text-sm leading-6 text-black/60">You will securely review your address and payment details on Stripe Checkout.</p><div className="mt-6 [&_button]:w-full [&_button]:rounded-md [&_button]:bg-[#f1e9eb] [&_button]:px-5 [&_button]:py-4">{payment}</div></section>
      </section>
      <aside aria-label="Order summary" className="border-black/10 bg-[#f7f7f7] px-6 py-10 md:px-[12%] lg:border-l lg:py-20">
        <h2 className="sr-only">Your order</h2><ul className="space-y-7">{lines.map(line => <li key={`${line.productId}:${line.variantId}`} className="flex items-start gap-4"><div className="relative w-24 shrink-0"><img src={editorialImage(line.product)} alt={line.product.name} className="aspect-square w-full object-cover" /><span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full bg-white text-xs">{line.quantity}</span></div><div className="min-w-0 flex-1 text-xs uppercase"><Link href={`/products/${line.productId}`} className="leading-5">{line.product.name}</Link>{line.selection.label && <p className="mt-2 text-black/60">{line.selection.label}</p>}<Link href={next === '/cart' ? '/cart' : `/products/${line.productId}`} className="mt-3 block text-[10px] underline underline-offset-4">{next === '/cart' ? 'Edit in cart' : 'View product'}</Link></div><p className="text-xs">{money(line.selection.amount * line.quantity)}</p></li>)}</ul>
        <dl className="mt-16 space-y-3 font-sans text-sm"><div className="flex justify-between gap-5"><dt>Subtotal · {lines.reduce((sum, line) => sum + line.quantity, 0)} items</dt><dd>{money(subtotal)}</dd></div><div className="flex justify-between gap-5"><dt>Shipping</dt><dd>{shipping === null ? 'At checkout' : money(shipping)}</dd></div><div className="flex justify-between gap-5 pt-10"><dt>Total</dt><dd>{shipping === null ? 'Calculated at checkout' : money(subtotal + shipping)}</dd></div></dl>
        <p className="mt-5 font-sans text-xs leading-5 text-black/50">All prices are in Thai baht. Price and availability are checked before payment.</p>
      </aside>
    </div>
  </main>;
}
