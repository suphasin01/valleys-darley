'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { studioPiece, studioSummary, validateStudioSelection } from '../lib/custom-studio';
import { HelpContactForm } from './HelpContactForm';

export function CustomStudio({pieceKey}:{pieceKey:string}) {
  const piece=studioPiece(pieceKey)!;
  const frame=useRef<HTMLIFrameElement>(null), quote=useRef<HTMLDivElement>(null);
  const [height,setHeight]=useState(1500),[summary,setSummary]=useState(''),[error,setError]=useState(''),[saved,setSaved]=useState('');
  useEffect(()=>{
    const keys:Record<string,string>={locket:'vd-locket-sheet',swirl:'vd-swirlbow-sheet',earrings:'vd-pleated-earrings-sheet',ring:'vd-ring-sheet'};
    const read=()=>{try{const value=JSON.parse(localStorage.getItem(keys[piece.key])||'null');setSaved(typeof value?.text==='string'?value.text.slice(0,2800):'');}catch{setSaved('');}};
    read();window.addEventListener('storage',read);return()=>window.removeEventListener('storage',read);
  },[piece.key]);
  useEffect(()=>{
    const receive=(event:MessageEvent)=>{
      if(event.origin!==window.location.origin || event.source!==frame.current?.contentWindow || event.data?.type!=='vd-custom-add' || event.data.key!==piece.key) return;
      const selection=validateStudioSelection(piece,event.data.options);
      if(!selection){setError('Please complete the design options before requesting a quote.');return;}
      setError('');setSummary(studioSummary(piece,selection));
      requestAnimationFrame(()=>quote.current?.scrollIntoView({behavior:'smooth',block:'start'}));
    };
    window.addEventListener('message',receive);return ()=>window.removeEventListener('message',receive);
  },[piece]);
  useEffect(()=>{
    const node=frame.current; if(!node)return;
    let observer:ResizeObserver|undefined;
    const loaded=()=>{
      observer?.disconnect();
      const doc=node.contentDocument;if(!doc)return;
      const fit=()=>setHeight(Math.max(600,Math.min(5000,doc.body.scrollHeight)));
      observer=new ResizeObserver(fit);observer.observe(doc.body);fit();
      node.contentWindow?.postMessage({type:'vd-currency',price:'Quote required',prices:null},window.location.origin);
    };
    node.addEventListener('load',loaded);return ()=>{node.removeEventListener('load',loaded);observer?.disconnect();};
  },[piece.file]);
  return <main className="supplied-ui"><section className="custom-builder"><Link href="/custom-made" className="back">‹ back to custom made</Link><h1 className="sr-only">{piece.name}</h1><p className="center small">Design your piece below. Custom specifications are sent to our team for a quote; no order or payment is created automatically.</p>
    <iframe ref={frame} src={`/custom-made/builder/${piece.file}`} title={piece.name} className="cb-frame" style={{height}} sandbox="allow-scripts allow-same-origin allow-downloads"/>
    {error && <p role="alert" className="error center">{error}</p>}
    <div className="native-ui mx-auto max-w-2xl px-5 py-8">{saved && <details className="border border-black/20 p-5 text-sm"><summary className="cursor-pointer">View your saved design sheet</summary><p className="mt-3 text-xs text-black/60">Saved in this browser only. Not an order or a price confirmation.</p><pre className="my-5 whitespace-pre-wrap break-words font-sans text-xs leading-6">{saved}</pre><button type="button" onClick={()=>{setSummary(`${saved}\n\nSaved design enquiry. Please confirm price and availability.`);requestAnimationFrame(()=>quote.current?.scrollIntoView({behavior:'smooth',block:'start'}));}} className="min-h-11 bg-[#efe7e8] px-5">Enquire about this saved design</button></details>}{['heart-locket','swirl-bow'].includes(piece.id) && <Link href={`/custom-made/${piece.id}?legacy=1`} className="mt-6 inline-block text-xs underline">Open previously saved designs from the earlier designer</Link>}</div>
    <div ref={quote} className="native-ui studio-enquiry">{summary && <HelpContactForm key={summary} title="Request your custom design" defaultMessage={summary} showNewsletter={false}/>}</div>
  </section></main>;
}
