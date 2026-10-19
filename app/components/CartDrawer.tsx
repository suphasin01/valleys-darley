'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { CmsProduct } from '../lib/cms';
import type { CartItem } from '../lib/cart';
import { readCart, saveCart } from '../lib/cart-storage';
import { CartDrawerContents } from './CartDrawerContents';

export function CartDrawer() {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousOverflow = useRef<string | null>(null);
  const request = useRef<AbortController | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [catalog, setCatalog] = useState<{ products: CmsProduct[]; shipping: number | null }>({ products: [], shipping: null });
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const pathname = usePathname();
  function restore() {
    request.current?.abort();
    if (previousOverflow.current !== null) { document.body.style.overflow = previousOverflow.current; previousOverflow.current = null; }
  }
  useEffect(() => {
    const refresh = () => setItems(readCart());
    const open = async () => {
      if (!dialog.current || dialog.current.open) return;
      refresh(); setStatus('loading'); setError('');
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.current.showModal();
      const controller = new AbortController(); request.current?.abort(); request.current = controller;
      try {
        const response = await fetch('/api/cart/catalog', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error('CATALOG_UNAVAILABLE');
        const data = await response.json();
        if (!Array.isArray(data.products) || !(data.shipping === null || Number.isSafeInteger(data.shipping) && data.shipping >= 0)) throw new Error('INVALID_CATALOG');
        if (!controller.signal.aborted) { setCatalog(data); setStatus('ready'); }
      } catch { if (!controller.signal.aborted) setStatus('error'); }
    };
    window.addEventListener('valleys-cart-open', open);
    window.addEventListener('valleys-cart-change', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('valleys-cart-open', open); window.removeEventListener('valleys-cart-change', refresh); window.removeEventListener('storage', refresh); restore(); };
  }, []);
  useEffect(() => { dialog.current?.close(); }, [pathname]);
  function update(next: CartItem[]) {
    try { saveCart(next); setError(''); } catch { setError('Unable to save your bag. Please enable site storage.'); }
  }
  return <dialog id="store-shopping-bag" ref={dialog} aria-labelledby="shopping-bag-title" onClose={restore} onClick={event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) event.currentTarget.close();
  }} className="editorial-page fixed inset-y-0 left-auto right-0 m-0 h-[100svh] max-h-none w-full max-w-[610px] overflow-y-auto overscroll-contain border-0 bg-white p-0 text-black shadow-xl backdrop:bg-black/25">
    <CartDrawerContents items={items} products={catalog.products} shipping={catalog.shipping} status={status} error={error} update={update} close={() => dialog.current?.close()} />
  </dialog>;
}
