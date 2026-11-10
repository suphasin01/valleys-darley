'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { CmsProduct } from '../lib/cms';
import { editorialImage } from '../lib/editorial-images';
import { cmsPriceLabel } from '../lib/supplied-catalog';

export function StoreSearch() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query,setQuery] = useState(''), [products,setProducts] = useState<CmsProduct[]>([]), [status,setStatus] = useState<'idle'|'loading'|'ready'|'error'>('idle');
  useEffect(()=>{
    const node=dialog.current;
    if (!node) return;
    const unlock=()=>{ document.body.style.overflow=previous; };
    let previous='';
    const observer=new MutationObserver(()=>{
      if (node.open) { previous=document.body.style.overflow; document.body.style.overflow='hidden'; }
      else unlock();
    });
    observer.observe(node,{attributes:true,attributeFilter:['open']});
    return ()=>{observer.disconnect();if(node.open)unlock();};
  },[]);
  async function open() {
    dialog.current?.showModal();
    if (status === 'ready' || status === 'loading') return;
    setStatus('loading');
    try {
      const result=await fetch('/api/cart/catalog',{cache:'no-store'});
      const body=await result.json();
      if (!result.ok || !Array.isArray(body.products)) throw new Error();
      setProducts(body.products); setStatus('ready');
    } catch { setStatus('error'); }
  }
  const results=query.trim() ? products.filter(product=>product.published && `${product.name} ${product.description}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0,12) : [];
  return <>
    <button type="button" onClick={open} className="store-search-trigger" aria-haspopup="dialog" aria-controls="store-search">search</button>
    <dialog id="store-search" ref={dialog} className="store-search-dialog" onClick={event=>{if(event.target===event.currentTarget)dialog.current?.close();}} aria-labelledby="store-search-title">
      <div className="store-search-inner"><div className="flex items-center justify-between gap-6"><h2 id="store-search-title">Search our jewelry</h2><button type="button" onClick={()=>dialog.current?.close()} className="min-h-11 px-3" aria-label="Close search">close ×</button></div>
      <label className="sr-only" htmlFor="store-search-query">Product name</label><input id="store-search-query" autoFocus type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="What are you looking for?" maxLength={100}/>
      {status==='loading' ? <p role="status">Loading products…</p> : status==='error' ? <p role="alert">Search is temporarily unavailable. <Link href="/shop" onClick={()=>dialog.current?.close()} className="underline">Browse the shop</Link>.</p> : query.trim() ? <><p aria-live="polite" className="my-5 text-sm">{results.length ? `${results.length} matching pieces` : 'No pieces found.'}</p><div className="store-search-results">{results.map(product=><Link key={product.id} href={`/products/${product.id}`} onClick={()=>dialog.current?.close()}><img src={editorialImage(product)} alt=""/><span>{product.name}</span><span className="font-sans text-xs">{cmsPriceLabel(product)}</span></Link>)}</div></> : <p className="my-5 text-sm text-black/60">Enter a product name to search the current collection.</p>}</div>
    </dialog>
  </>;
}
