'use client';
import Link from 'next/link';
import { useRef, useState, type FormEvent } from 'react';
import type { TrackingEvent } from '../lib/thailand-post';
import { postalEventTime } from '../lib/shipping-state';

export function StoreTracking() {
  const [code,setCode]=useState(''),[busy,setBusy]=useState(false),[result,setResult]=useState<{error?:string;signIn?:boolean;barcode?:string;events?:TrackingEvent[]}|null>(null);
  const controller=useRef<AbortController|null>(null);
  async function submit(event:FormEvent) {
    event.preventDefault();controller.current?.abort();const current=new AbortController();controller.current=current;setBusy(true);setResult(null);
    try {const response=await fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({barcode:code}),signal:current.signal});const data=await response.json();if(!current.signal.aborted)setResult(data);}catch{if(!current.signal.aborted)setResult({error:'Unable to load tracking. Please try again.'});}finally{if(!current.signal.aborted)setBusy(false);}
  }
  const normalized=code.trim().toUpperCase();
  return <main className="supplied-ui"><section className="page narrow supplied-tracking"><h1 className="script-title">Track your order</h1><p className="center muted">Use the tracking number shown in your account.</p>
    <form onSubmit={submit} className="track-form"><label className="sr-only" htmlFor="parcel-code">Tracking number</label><input id="parcel-code" placeholder="tracking number (e.g. EE123456789TH)" value={code} onChange={event=>setCode(event.target.value)} maxLength={13} autoComplete="off" required pattern="[A-Za-z]{2}[0-9]{9}[A-Za-z]{2}"/><button className="btn" disabled={busy}>{busy?'tracking…':'track'}</button></form>
    <p className="center"><Link href="/orders" className="link">my orders</Link></p>
    {result?.error && <p role="alert" className="error center">{result.error}{result.signIn && <> <Link href="/login?next=%2Ftrack" className="link">sign in</Link></>}</p>}
    {result?.events && (result.events.length ? <ol className="track-list">{[...result.events].sort((a,b)=>postalEventTime(b.date)-postalEventTime(a.date)).map((event,index)=><li key={`${event.date}-${index}`}><strong>{event.description||event.status}</strong><br/><span className="small muted">{event.date}{event.location?` · ${event.location}`:''}</span>{event.detail && <p>{event.detail}</p>}</li>)}</ol> : <p role="status" className="center muted">No updates yet. Check again after the parcel has been accepted.</p>)}
    {/^[A-Z]{2}[0-9]{9}[A-Z]{2}$/.test(normalized) && <p className="center"><a className="link" target="_blank" rel="noopener noreferrer" href={`https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(normalized)}`}>open official Thailand Post tracking ↗</a></p>}
  </section></main>;
}
