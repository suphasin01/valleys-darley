import Link from 'next/link';
import type { CmsProduct } from '../lib/cms';
import { resolveCart, type CartItem } from '../lib/cart';
import { purchaseSelection } from '../lib/purchase';
import { editorialImage } from '../lib/editorial-images';

export function CartDrawerContents({ items, products, shipping, status, error, update, close }: {
  items: CartItem[]; products: CmsProduct[]; shipping: number | null;
  status: 'loading' | 'ready' | 'error'; error: string; update: (items: CartItem[]) => void; close: () => void;
}) {
  const lines = resolveCart(items, products);
  const subtotal = lines?.reduce((sum, line) => sum + line.quantity * line.selection.amount, 0) || 0;
  const money = (amount: number) => `฿${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  return <div className="shopping-bag-content flex min-h-full flex-col px-6 pb-12 sm:px-12 sm:pb-16">
    <div className="shopping-bag-header sticky top-0 z-10 flex items-center justify-end gap-6 bg-white py-7 sm:py-10"><Link href="/account" onClick={close} className="inline-flex min-h-11 items-center border border-black/50 bg-[#f1e9eb] px-6 py-2 text-sm uppercase">Account</Link><button type="button" onClick={close} aria-label="Close shopping bag" className="min-h-11 px-1 text-lg font-semibold uppercase">Close</button></div>
    <h2 id="shopping-bag-title" className="flex items-baseline gap-3"><span className="brand-script text-[42px] sm:text-5xl">Shopping Bag</span><span className="text-sm" aria-live="polite">({items.reduce((sum, item) => sum + item.quantity, 0)})</span></h2>
    {status === 'loading' ? <p role="status" className="py-16 text-center text-sm">Updating your bag…</p> : status === 'error' ? <p role="alert" className="py-12 text-sm">Your bag could not be updated. <Link href="/cart" onClick={close} className="underline">View bag to try again.</Link></p> : !items.length ? <div className="py-20 text-center"><p className="text-sm">Your shopping bag is empty.</p><Link href="/collections" onClick={close} className="mt-8 inline-block bg-[#f1e9eb] px-8 py-3 text-sm uppercase">Continue shopping</Link></div> : <>
      <div className="mt-10 space-y-10">{items.map((item, index) => {
        const product = products.find(candidate => candidate.id === item.productId);
        const line = resolveCart([item], products)?.[0];
        const available = product ? purchaseSelection(product, item.variantId || undefined, 1)?.available || 0 : 0;
        const quantity = (value: number) => update(items.map((candidate, row) => row === index ? { ...candidate, quantity: value } : candidate));
        return <article key={`${item.productId}:${item.variantId}`} className="flex gap-5 sm:gap-8">
          {product ? <Link href={`/products/${product.id}`} onClick={close} className="w-[34%] max-w-[155px] shrink-0 self-start"><img src={editorialImage(product)} alt={product.name} className="aspect-[.775] w-full object-cover" /></Link> : <div aria-hidden="true" className="aspect-[.775] w-[34%] max-w-[155px] shrink-0 self-start bg-[#f1e9eb]" />}
          <div className="min-w-0 flex-1 text-xs"><h3 className="uppercase leading-5">{product ? <Link href={`/products/${product.id}`} onClick={close}>{product.name}</Link> : 'Unavailable product'}</h3><p className="mt-1">{line ? money(line.selection.amount) : 'Unavailable'}</p>{line?.selection.label && <p className="mt-4 uppercase leading-5">{line.selection.label}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-2"><span className="uppercase">Quantity:</span><div role="group" aria-label={`Quantity for ${product?.name || item.productId}`} className="inline-flex items-center border border-black/60"><button type="button" aria-label={`Decrease quantity for ${product?.name || item.productId}`} disabled={item.quantity <= 1} onClick={() => quantity(item.quantity - 1)} className="h-8 w-8 disabled:opacity-25">−</button><span aria-live="polite" className="min-w-5 text-center">{item.quantity}</span><button type="button" aria-label={`Increase quantity for ${product?.name || item.productId}`} disabled={item.quantity >= Math.min(10, available)} onClick={() => quantity(item.quantity + 1)} className="h-8 w-8 disabled:opacity-25">+</button></div></div>
            <button type="button" onClick={() => update(items.filter((_, row) => row !== index))} aria-label={`Remove ${product?.name || item.productId}`} className="mt-2 min-h-11 uppercase underline underline-offset-4">Remove</button>{!line && <p className="mt-2 text-red-800">Please remove or reselect this item.</p>}
          </div>
        </article>;
      })}</div>
      <div className="shopping-bag-summary mt-auto pt-20"><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{lines ? money(subtotal) : '—'}</dd></div><div className="flex justify-between gap-4"><dt>Thailand shipping</dt><dd>{shipping === null ? 'At checkout' : money(shipping)}</dd></div></dl><p className="mt-5 text-xs leading-5 text-black/60">Price, availability and delivery details are checked again before payment.</p>
        <div className="shopping-bag-actions mt-12 flex flex-col items-center gap-3">{lines && <Link href={`/checkout/cart?items=${encodeURIComponent(JSON.stringify(items))}`} onClick={close} className="w-full rounded-md border border-black bg-[#f1e9eb] px-5 py-3 text-center text-sm uppercase sm:w-auto">Proceed to check out</Link>}<Link href="/cart" onClick={close} className="rounded-md bg-black px-7 py-3 text-sm uppercase text-white">View bag</Link></div>
      </div>
    </>}
    {error && <p role="alert" className="mt-5 text-sm text-red-800">{error}</p>}
  </div>;
}
