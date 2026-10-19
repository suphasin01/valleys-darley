'use client';

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from 'react';
import { BrandLogo } from './Header';

type Artwork = { front: string; reverse: string; reverseLabel: string };
type Props = { name: string; specifications: string[][]; note: string; artwork: Artwork | null };

/** Native Preview's 560px saved-design sheet, populated from the live selection. */
export const SavedDesignDialog = forwardRef<HTMLDialogElement, Props>(function SavedDesignDialog({ name, specifications, note, artwork }, forwardedRef) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useImperativeHandle(forwardedRef, () => dialog.current!, []);
  const previousOverflow = useRef<string | null>(null);
  function restoreScroll() {
    if (previousOverflow.current !== null) { document.body.style.overflow = previousOverflow.current; previousOverflow.current = null; }
  }
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const observer = new MutationObserver(() => {
      if (element.open && previousOverflow.current === null) { previousOverflow.current = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
      else if (!element.open) restoreScroll();
    });
    observer.observe(element, { attributes: true, attributeFilter: ['open'] });
    return () => { observer.disconnect(); restoreScroll(); };
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId} className="saved-design-dialog editorial-page m-auto max-h-[90svh] w-[calc(100vw-32px)] max-w-[560px] overflow-y-auto overscroll-contain rounded-sm bg-white px-6 py-7 text-black shadow-xl backdrop:bg-black/20 sm:px-10" onClose={restoreScroll} onClick={event => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) event.currentTarget.close();
  }}>
    <form method="dialog" className="saved-design-controls absolute right-3 top-3"><button aria-label="Close saved design" className="grid h-9 w-9 place-items-center text-2xl">×</button></form>
    <div className="mb-8 text-center"><BrandLogo className="text-[28px]" /></div>
    <h2 id={titleId} className="mb-6 text-base uppercase">Your custom design</h2>
    {artwork && <div className="mx-auto mb-6 grid max-w-[340px] grid-cols-2 gap-10 text-center text-[10px] uppercase text-black/50">
      {[{ src: artwork.front, label: 'Front' }, { src: artwork.reverse, label: artwork.reverseLabel }].map(image => <figure key={image.label}><img src={image.src} alt={`${name} — ${image.label}`} width={600} height={600} className="mb-3 aspect-square w-full rounded-sm bg-[#faf8fa] object-contain" /><figcaption>{image.label}</figcaption></figure>)}
    </div>}
    <dl className="text-[10px] uppercase leading-relaxed">{specifications.map(([label, value]) => <div key={label} className="grid grid-cols-[1fr_2fr] gap-4 border-b border-black/10 py-2"><dt className="text-black/50">{label}</dt><dd className="break-words text-right">{value}</dd></div>)}</dl>
    {note && <div className="mt-4 border border-black/10 p-3 text-xs"><h3 className="mb-2 text-[10px] uppercase text-black/50">Notes for the workshop</h3><p className="whitespace-pre-wrap break-words">{note}</p></div>}
    <p className="mt-5 text-[10px] uppercase leading-relaxed text-black/50">Your design is saved on this device. Restore it from the custom-made page anytime.</p>
    <button type="button" onClick={() => window.print()} className="saved-design-controls mt-5 min-h-11 w-full rounded bg-[#f1e9eb] text-sm uppercase">Save as PDF</button>
  </dialog>;
});
