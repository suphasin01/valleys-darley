'use client';

import { useEffect, useId, useRef } from 'react';
import { FigmaImage } from './FigmaImage';
import { JewelryCareCopy } from './JewelryCareCopy';

export function ProductGuide({ kind, label = 'Size chart' }: { kind: 'ring' | 'necklace' | 'care'; label?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const previousOverflow = useRef<string | null>(null);
  const titleId = useId();
  const title = kind === 'ring' ? 'A guide for the Ring' : kind === 'necklace' ? 'Necklace size guide' : 'Care instruction';
  function restoreScroll() {
    if (previousOverflow.current !== null) { document.body.style.overflow = previousOverflow.current; previousOverflow.current = null; }
  }
  useEffect(() => restoreScroll, []);
  function open() {
    if (!dialog.current || dialog.current.open) return;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
  }
  return <>
    <button type="button" onClick={open} className="min-h-11 text-xs uppercase underline underline-offset-4">{label}</button>
    <dialog ref={dialog} aria-labelledby={titleId} onClose={restoreScroll} onClick={event => {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.target === event.currentTarget && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) event.currentTarget.close();
    }} style={kind === 'care' ? undefined : { width: 'min(94vw,704px,72svh)' }} className={`product-guide editorial-page m-auto max-h-[90svh] w-[94vw] overflow-y-auto overscroll-contain border-0 bg-white p-5 text-black shadow-xl backdrop:bg-black/30 md:p-8 ${kind === 'care' ? 'max-w-[1000px]' : 'max-w-[704px]'}`}>
      <form method="dialog" className="sticky top-0 z-10 ml-auto h-0 w-9"><button aria-label={`Close ${title.toLowerCase()}`} className="absolute -right-3 -top-3 grid h-9 w-9 place-items-center bg-white text-2xl">×</button></form>
      <h2 id={titleId} className={kind === 'care' ? 'mb-8 border border-black/50 px-12 py-4 text-center text-sm uppercase' : 'sr-only'}>{title}</h2>
      {kind === 'care' ? <>
        <FigmaImage src="/images/figma/help-care.png" alt="Keep dry; avoid cosmetics and chemicals; store in a pouch; polish gently; handle with care" className="mx-auto mb-10 aspect-[946/372] w-[80%] max-w-[650px]" crop={{ width: '154.44%', height: '490.62%', left: '-30.55%', top: '-98.79%' }} />
        <div className="mx-auto max-w-[820px] space-y-5 text-sm leading-[1.7]">
          <JewelryCareCopy />
        </div>
      </> : <>
        <img src={kind === 'ring' ? '/images/figma/product-ring-guide.webp' : '/images/figma/product-necklace-guide.webp'} width={3277} height={4096} alt={kind === 'ring' ? 'How to measure your ring size, with the original size table' : 'Necklace length and fit illustration'} loading="lazy" className="block h-auto w-full" />
        {kind === 'ring' && <div className="sr-only"><p>Wrap a thin strip of paper or string around the finger, mark where the ends meet, and measure the length. If between two sizes, choose the larger size and measure a few times to be sure.</p><table><caption>Ring size table</caption><thead><tr><th>Ring size</th><th>Circumference in cm</th><th>Diameter in mm</th><th>USA size</th></tr></thead><tbody>{[[49, 4.93, 15.7, 5], [52, 5.19, 16.5, 6], [54, 5.44, 17.3, 7], [57, 5.70, 18.2, 8], [60, 5.95, 19, 9]].map(row => <tr key={row[0]}>{row.map((value, index) => <td key={index}>{value}</td>)}</tr>)}</tbody></table></div>}
      </>}
    </dialog>
  </>;
}
