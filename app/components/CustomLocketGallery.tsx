'use client';

import { useId, useState } from 'react';

type View = 'open' | 'closed' | 'inside';
export function CustomLocketGallery({ plating, gemstone, finish, star, engraving }: { plating: string; gemstone: string; finish: string; star: string; engraving: string }) {
  const [view, setView] = useState<View>('open');
  const panelId = useId();
  const metal = plating === 'Rhodium' ? 'rhodium' : 'gold';
  const exact = gemstone === 'Aquamarine' && finish === 'High polish' && star === 'Sapphire';
  const metalLabel = metal === 'gold' ? '18K gold plated' : 'Rhodium';
  const inside = <div className="relative aspect-square w-full">
    <img src={`/images/figma/heart-${metal}-inside.webp`} width={300} height={300} alt={`${metalLabel} locket inside the lid`} className="block h-auto w-full" />
    {engraving ? <p className="brand-script absolute left-[22%] top-[34%] flex h-[27%] w-[56%] items-center justify-center break-words text-center text-[clamp(10px,1.5vw,22px)] leading-tight text-[#514a3a]">{engraving}</p> : <img src={`/images/figma/heart-${metal}-engraving.webp`} width={120} height={87} alt="Be your own Present, wrapped with love always" className="absolute left-[30%] top-[33.527%] h-auto w-[40%]" />}
  </div>;
  return <>
    <div id={panelId} className="custom-locket-gallery mx-auto" role="region" aria-label="Locket design views">
      {view === 'inside' ? <div className="mx-auto w-[min(66%,420px)]"><p className="mb-3 text-center text-xs uppercase">inside the lid</p>{inside}</div> : <div className="relative aspect-[1263/512] max-sm:aspect-[6/5]">
        {view === 'open' && <div className="absolute left-[6.0174%] top-[7.2266%] w-[23.753%] max-sm:left-0 max-sm:w-[35%]"><p className="absolute -top-6 w-full text-center text-[clamp(8px,.833vw,12px)] uppercase">inside the lid</p>{inside}</div>}
        <img src={`/images/figma/heart-${metal}-front.webp`} width={518} height={512} alt={`${metalLabel} Aquamarine high polish locket with Sapphire stars, front and side reference`} className={`absolute top-0 h-auto w-[41.0135%] max-sm:top-[10%] max-sm:w-[70%] ${view === 'open' ? 'left-[31.5123%] max-sm:left-[30%]' : 'left-[29.4933%] max-sm:left-[15%]'}`} />
      </div>}
    </div>
    <p className="mt-8 text-center text-xs uppercase">Custom-made jewelry, crafted around your imagination.</p>
    <div className="mt-10 flex justify-center gap-2" role="group" aria-label="Choose locket view">
      {([['open', 'Open locket'], ['closed', 'Closed'], ['inside', 'Inside the lid']] as const).map(([value, label]) => <button key={value} type="button" aria-controls={panelId} aria-pressed={view === value} onClick={() => setView(value)} className={`min-h-11 border border-black px-3 py-2 text-[10px] uppercase sm:px-5 sm:text-xs ${view === value ? 'bg-[#f1e9eb]' : 'bg-white hover:bg-[#f8f4f5]'}`}>{label}</button>)}
    </div>
    <p role="status" className="mx-auto mt-4 max-w-xl text-center text-xs leading-relaxed text-black/55">{!exact ? 'Image reference: Aquamarine, high polish and Sapphire stars. Your selected stone and finish are recorded in the details below; their exact artwork is not shown yet.' : engraving ? 'Engraving placement preview; our team will confirm the final lettering with you.' : 'Original design reference shown. Final specifications are confirmed by our team.'}</p>
  </>;
}
