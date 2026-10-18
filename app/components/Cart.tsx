'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CmsProduct } from '../lib/cms';
import { parseCart, resolveCart, type CartItem } from '../lib/cart';
import { editorialImage } from '../lib/editorial-images';

const storageKey = 'valleys-cart-v1';
function readCart(): CartItem[] {
  try { return parseCart(JSON.parse(localStorage.getItem(storageKey) || '[]')) || []; } catch { return []; }
}
function saveCart(items: CartItem[]) {
  localStorage.setItem(storageKey, JSON.stringify(items));
  window.dispatchEvent(new Event('valleys-cart-change'));
}
export function AddToCart({ product }: { product: CmsProduct }) {
  const [variantId, setVariant] = useState(String(product.variants?.find(v => v.available > 0)?.id || ''));
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const selected = product.variants?.find(v => String(v.id) === variantId);
  const max = Math.min(10, selected?.available ?? 10);
  const purchasable = product.variants?.length ? !!selected && max > 0 : Number.isSafeInteger(product.priceBaht) && product.priceBaht! >= 10;
  function add() {
    try {
      const items = readCart();
      const existing = items.find(item => item.productId === product.id && item.variantId === variantId);
      if (existing && existing.quantity + quantity > max) { setMessage(`Maximum available: ${max}. Please review your bag.`); return; }
      if (!existing && items.length >= 20) { setMessage('Your bag holds up to 20 different selections.'); return; }
      if (existing) existing.quantity += quantity;
      else items.push({ productId: product.id, variantId, quantity });
      saveCart(items); setMessage('Added to your bag.');
    } catch { setMessage('Your browser could not save the bag. Please enable site storage.'); }
  }
  return <div className="mt-8 w-full space-y-4">
    {!!product.variants?.length && <label className="block text-sm">Color / size<select value={variantId} onChange={e => { setVariant(e.target.value); setQuantity(1); setMessage(''); }} className="mt-2 w-full rounded-lg border border-black/20 bg-white p-3">{product.variants.map(v => <option key={v.id} value={v.id} disabled={v.available < 1}>{v.label || v.sku || v.id} · ฿{v.price.toLocaleString('en-US')}{v.available < 1 ? ' · Sold out' : ''}</option>)}</select></label>}
    {purchasable ? <><label className="block text-sm">Quantity<select value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="ml-4 rounded-lg border border-black/20 bg-white px-4 py-2">{Array.from({length:max}, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label><button type="button" onClick={add} className="w-full rounded-lg bg-[#f1e9eb] px-8 py-4 text-xl hover:bg-[#e6d6dd]">ADD TO CART</button></> : <Link href="/help#contact" className="editorial-button w-full">{product.variants?.length ? 'Sold out · Contact us' : 'Enquire to order'}</Link>}
    <p role="status" className="text-sm">{message}{message === 'Added to your bag.' && <> <Link href="/cart" className="underline">View bag →</Link></>}</p>
  </div>;
}

export function CartView({ products, shipping }: { products: CmsProduct[]; shipping: number | null }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const refresh = () => { setItems(readCart()); setLoaded(true); };
    refresh(); window.addEventListener('storage', refresh); window.addEventListener('valleys-cart-change', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('valleys-cart-change', refresh); };
  }, []);
  function update(next: CartItem[]) { try { saveCart(next); setError(''); } catch { setError('Unable to save your bag. Please enable site storage.'); } }
  const lines = resolveCart(items, products);
  const subtotal = lines?.reduce((sum, line) => sum + line.quantity * line.selection.amount, 0) || 0;
  const money = (amount: number) => `฿${(amount / 100).toLocaleString('en-US', {minimumFractionDigits:2})}`;
  if (!loaded) return <p role="status" className="py-20 text-center">Loading your bag…</p>;
  if (!items.length) return <section className="py-20 text-center md:py-32"><h1 className="brand-script text-5xl md:text-6xl">Your cart is empty</h1><Link href="/collections" className="editorial-button mt-10 bg-[#f1e9eb]">Continue shopping</Link></section>;
  return <><div className="grid grid-cols-[1fr_auto] items-end gap-5 border-b border-black/15 pb-5 md:grid-cols-[3fr_1fr_1fr]"><h1 className="brand-script text-4xl md:text-6xl">Product</h1><span className="hidden text-center text-xs uppercase md:block">Quantity</span><span className="text-right text-xs uppercase">Total</span></div><div>{items.map((item, index) => {
    const product = products.find(p => p.id === item.productId);
    const line = resolveCart([item], products)?.[0];
    const changeQuantity = (quantity: number) => update(items.map((row, i) => i === index ? {...row, quantity} : row));
    return <article key={`${item.productId}:${item.variantId}`} className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-4 border-b border-black/15 py-6 md:grid-cols-[3fr_1fr_1fr]">
      <div className="flex min-w-0 gap-4 md:gap-8"><Link href={`/products/${item.productId}`} tabIndex={-1} aria-hidden="true" className="block aspect-[3/4] w-24 shrink-0 overflow-hidden bg-[#f7f7f7] md:w-[155px]">{product && <img src={editorialImage(product)} alt="" className="h-full w-full object-cover" />}</Link><div className="min-w-0 pt-2"><Link href={`/products/${item.productId}`} className="block text-sm uppercase leading-6 md:text-lg">{product?.name || 'Unavailable product'}</Link><p className="mt-1 text-sm">{line ? money(line.selection.amount) : 'Unavailable'}</p>{line?.selection.label && <p className="mt-5 text-sm uppercase">{line.selection.label}</p>}{!line && <p className="mt-3 text-xs text-red-800">Please remove or reselect this item.</p>}</div></div>
      <div className="col-start-1 row-start-2 flex items-start gap-3 md:col-start-2 md:row-start-1 md:justify-center md:pt-2"><div role="group" aria-label={`Quantity for ${product?.name || item.productId}`} className="inline-flex items-center border border-black/40"><button type="button" aria-label={`Decrease quantity for ${product?.name || item.productId}`} disabled={item.quantity <= 1} onClick={() => changeQuantity(item.quantity - 1)} className="h-10 w-10 disabled:opacity-25">−</button><span aria-live="polite" className="min-w-6 text-center text-sm">{item.quantity}</span><button type="button" aria-label={`Increase quantity for ${product?.name || item.productId}`} disabled={item.quantity >= Math.min(10, line?.selection.available ?? 10)} onClick={() => changeQuantity(item.quantity + 1)} className="h-10 w-10 disabled:opacity-25">+</button></div></div>
      <div className="col-start-2 row-span-2 row-start-1 flex flex-col items-end justify-between pt-2 md:col-start-3"><p className="text-sm">{line ? money(line.selection.amount * item.quantity) : '—'}</p><button aria-label={`Remove ${product?.name || item.productId}`} onClick={() => update(items.filter((_, i) => i !== index))} className="min-h-11 text-xs uppercase underline underline-offset-4">Remove</button></div>
    </article>;
  })}</div><p className="mt-5 text-xs text-black/60">Price and availability are checked again before payment.</p><aside aria-label="Order summary" className="mx-auto mt-16 w-full max-w-[660px] pb-16 md:mt-24">{lines ? <Link href={`/checkout/cart?items=${encodeURIComponent(JSON.stringify(items))}`} className="block rounded-md bg-[#f1e9eb] px-5 py-4 text-center text-sm uppercase hover:bg-[#e7d9df]">Proceed to check out</Link> : <p role="alert" className="bg-rose-50 p-4 text-center text-red-800">Review unavailable items before checkout.</p>}<dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="uppercase">Subtotal</dt><dd>{lines ? money(subtotal) : '—'}</dd></div><div className="flex justify-between text-black/60"><dt>Thailand shipping</dt><dd>{shipping === null ? 'At checkout' : money(shipping)}</dd></div></dl><Link href="/collections" className="mt-8 block text-center text-xs underline underline-offset-4">Continue shopping</Link></aside>{error && <p role="alert" className="mt-5 text-red-700">{error}</p>}</>;
}
