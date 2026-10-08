'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CmsProduct } from '../lib/cms';
import { parseCart, resolveCart, type CartItem } from '../lib/cart';

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
  if (!items.length) return <section className="py-20 text-center"><h1 className="text-3xl">Your bag is empty</h1><Link href="/collections" className="editorial-button mt-8">Continue shopping</Link></section>;
  return <><h1 className="text-center text-[32px]">Your shopping bag</h1><div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]"><div className="space-y-8">{items.map((item, index) => {
    const product = products.find(p => p.id === item.productId);
    const line = resolveCart([item], products)?.[0];
    return <article key={`${item.productId}:${item.variantId}`} className="flex gap-4 border-b border-black/15 pb-8"><div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-lg bg-[#f7f7f7]">{product && <img src={product.image} alt={product.name} className="h-full w-full object-cover" />}</div><div className="min-w-0 flex-1"><Link href={`/products/${item.productId}`} className="text-xl">{product?.name || 'Unavailable product'}</Link><p className="mt-2 text-sm">{line?.selection.label}</p><p className="mt-2">{line ? money(line.selection.amount * item.quantity) : 'Unavailable. Please remove or reselect this item.'}</p><label className="mt-4 block text-sm">Quantity<select aria-label={`Quantity for ${product?.name || item.productId}`} value={item.quantity} onChange={e => update(items.map((row, i) => i === index ? {...row,quantity:Number(e.target.value)} : row))} className="ml-3 rounded border border-black/20 p-2">{Array.from({length:10}, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></label><button onClick={() => update(items.filter((_, i) => i !== index))} className="mt-3 min-h-11 text-sm underline">Remove</button></div></article>;
  })}</div><aside className="h-fit rounded-lg bg-[#f1e9eb] p-6"><h2 className="text-2xl">Order summary</h2><dl className="mt-6 space-y-5"><div className="flex justify-between"><dt>Subtotal</dt><dd>{lines ? money(subtotal) : '—'}</dd></div><div className="flex justify-between"><dt>Thailand shipping</dt><dd>{shipping === null ? 'At checkout' : money(shipping)}</dd></div><div className="flex justify-between border-t border-black/20 pt-5 text-xl"><dt>Total</dt><dd>{lines && shipping !== null ? money(subtotal + shipping) : '—'}</dd></div></dl><p className="mt-5 text-sm">Price and availability are checked again before payment.</p>{lines ? <Link href={`/checkout/cart?items=${encodeURIComponent(JSON.stringify(items))}`} className="mt-6 block rounded-lg bg-white p-4 text-center">CHECK OUT →</Link> : <p role="alert" className="mt-6 text-red-800">Review unavailable items before checkout.</p>}<Link href="/collections" className="mt-5 block text-center text-sm underline">Continue shopping</Link></aside></div>{error && <p role="alert" className="mt-5 text-red-700">{error}</p>}</>;
}
