'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { privacyVersion } from '../lib/privacy';

export function HelpContactForm() {
  const id = useId(), busy = useRef(false);
  const [token, setToken] = useState(''), [newsletter, setNewsletter] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'pending' | 'saved' | 'unavailable'>('loading');
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/inquiries', { cache: 'no-store', signal: controller.signal }).then(async result => {
      const data = await result.json();
      if (!result.ok || typeof data.token !== 'string') throw new Error();
      setToken(data.token); setState('ready');
    }).catch(() => { if (!controller.signal.aborted) setState('unavailable'); });
    return () => controller.abort();
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || !token || state === 'saved') return;
    busy.current = true; setState('pending'); setError('');
    const form = event.currentTarget, data = new FormData(form);
    try {
      const result = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        firstName: data.get('firstName'), lastName: data.get('lastName'), email: data.get('email'), message: data.get('message'),
        website: data.get('website'), newsletter: data.get('newsletter') === 'yes', privacyAcknowledged: data.get('privacyAcknowledged') === 'yes', privacyVersion, token,
      }) });
      const reply = await result.json();
      if (!result.ok || reply.saved !== true) {
        if (reply.error === 'expired') {
          const fresh = await fetch('/api/inquiries', { cache: 'no-store' });
          const freshData = await fresh.json();
          if (!fresh.ok || typeof freshData.token !== 'string') throw new Error();
          setToken(freshData.token);
          setError('Your form was refreshed. Please wait a moment and submit again.');
        } else setError(reply.error === 'limit' ? 'Please try again tomorrow, or email us directly.' : 'Your request was not saved. Please check your details and try again, or email us directly.');
        setState('ready'); return;
      }
      form.reset(); setNewsletter(false); setToken(''); setState('saved');
    } catch { setError('Your request could not be confirmed. Please try again or email us directly.'); setState('ready'); }
    finally { busy.current = false; }
  }
  return <div className="relative mx-auto max-w-[626px]">
    <h2 className="mb-12 text-center text-[26px] leading-tight md:text-[32px]">sign up for our newsletter</h2>
    <form onSubmit={submit} className="space-y-6" aria-busy={state === 'pending'}>
      <div className="grid grid-cols-2 gap-5 md:gap-8">
        <div><label htmlFor={`${id}-first`}>First name</label><input id={`${id}-first`} name="firstName" placeholder="Jane" autoComplete="given-name" maxLength={100} required /></div>
        <div><label htmlFor={`${id}-last`}>Last name</label><input id={`${id}-last`} name="lastName" placeholder="Smitherton" autoComplete="family-name" maxLength={100} required /></div>
      </div>
      <div><label htmlFor={`${id}-email`}>Email address</label><input id={`${id}-email`} name="email" type="email" placeholder="email@example.com" autoComplete="email" maxLength={254} required /></div>
      <div><label htmlFor={`${id}-message`}>Your message</label><textarea id={`${id}-message`} name="message" placeholder="Enter your question or message" maxLength={3000} required={!newsletter} rows={6} /></div>
      <div className="hidden" aria-hidden="true"><label htmlFor={`${id}-website`}>Leave this field empty</label><input id={`${id}-website`} name="website" autoComplete="off" tabIndex={-1} /></div>
      <div className="space-y-3 text-xs leading-relaxed">
        <label className="flex items-start gap-3"><input name="newsletter" type="checkbox" value="yes" checked={newsletter} onChange={event => setNewsletter(event.target.checked)} /><span>I would like to receive newsletters and collection updates. Optional; email us to withdraw.</span></label>
        <label className="flex items-start gap-3"><input name="privacyAcknowledged" type="checkbox" value="yes" required /><span>I have read and acknowledge the <Link href="/privacy" className="underline">Privacy Policy</Link>.</span></label>
      </div>
      <button type="submit" disabled={!token || state === 'pending' || state === 'saved'} className="min-h-14 w-full bg-[#f1e9eb] px-6 py-4 text-sm uppercase transition-colors hover:bg-[#e8dce0] disabled:cursor-not-allowed disabled:opacity-60">{state === 'pending' ? 'Submitting…' : state === 'saved' ? 'Received' : 'Submit'}</button>
      {state === 'saved' && <p role="status" className="text-sm leading-relaxed">Thank you. Your request and newsletter preference have been recorded for our team. This does not create a store account.</p>}
      {error && <p role="alert" className="text-sm leading-relaxed text-red-800">{error}</p>}
      {state === 'unavailable' && <p role="status" className="text-sm">The form is temporarily unavailable. Please email us directly.</p>}
      <p className="text-center text-xs">You can also reach us at <a href="mailto:valleydarley@gmail.com" className="underline">valleydarley@gmail.com</a>.</p>
    </form>
  </div>;
}
