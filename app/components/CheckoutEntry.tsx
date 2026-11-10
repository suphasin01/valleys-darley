'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { readCart } from '../lib/cart-storage';
export function CheckoutEntry() {
  const router=useRouter();
  useEffect(()=>{const items=readCart();router.replace(items.length?`/checkout/cart?items=${encodeURIComponent(JSON.stringify(items))}`:'/cart');},[router]);
  return <main className="editorial-page min-h-[60svh] px-5 py-24 text-center"><p role="status">Opening your checkout…</p><Link href="/cart" className="mt-6 inline-block underline">Back to your bag</Link></main>;
}
