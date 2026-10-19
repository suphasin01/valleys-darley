'use client';

import { useEffect, useState } from 'react';
import { BrandLoading } from './BrandLoading';

/** Figma 149:191 → 296:2136: 4s linear fill, 400ms hold, 300ms dissolve. */
export function HomeEntrance() {
  const [phase, setPhase] = useState<'loading' | 'leaving' | 'done'>('loading');

  useEffect(() => {
    const key = 'valleys-entrance-seen-v1';
    try {
      if (sessionStorage.getItem(key)) { setPhase('done'); return; }
    } catch { /* Private browsing must not prevent entry. */ }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const leave = window.setTimeout(() => setPhase('leaving'), reduced ? 0 : 4400);
    const finish = window.setTimeout(() => {
      setPhase('done');
      try { sessionStorage.setItem(key, '1'); } catch { /* Storage is optional. */ }
    }, reduced ? 0 : 4700);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(finish);
    };
  }, []);

  const active = phase !== 'done';
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [active]);

  if (phase === 'done') return null;
  return <BrandLoading entrance leaving={phase === 'leaving'} />;
}
