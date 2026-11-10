'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { studioPieces } from '../lib/custom-studio';
export function CustomSelection({visible}:{visible:string[]}) {
  const frame=useRef<HTMLIFrameElement>(null);
  const [height,setHeight]=useState(1100);
  useEffect(()=>{
    const node=frame.current;if(!node)return;let observer:ResizeObserver|undefined;
    const load=()=>{observer?.disconnect();const doc=node.contentDocument;if(!doc)return;doc.querySelectorAll<HTMLElement>('.slot').forEach(slot=>{if(!visible.includes(slot.dataset.key||'')){slot.hidden=true;slot.style.display='none';}});const fit=()=>setHeight(Math.min(1800,Math.max(650,doc.body.scrollHeight)));observer=new ResizeObserver(fit);observer.observe(doc.body);fit();};
    node.addEventListener('load',load);return()=>{node.removeEventListener('load',load);observer?.disconnect();};
  },[visible]);
  return <main className="supplied-ui"><section className="custom-made"><h1 className="sr-only">Custom made jewelry</h1><iframe ref={frame} src="/custom-made/index.html" title="Choose your custom made jewelry" className="cm-frame" style={{height}} sandbox="allow-scripts allow-same-origin allow-top-navigation-by-user-activation"/><nav className="studio-selection-links" aria-label="Custom jewelry designs">{studioPieces.filter(piece=>visible.includes(piece.key)).map(piece=><Link key={piece.key} href={`/custom-made/${piece.key}`}>{piece.name} ↗</Link>)}</nav></section></main>;
}
