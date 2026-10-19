"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function ProductGallery({ images, name, remote, contain, th }: { images: string[]; name: string; remote: boolean; contain: boolean; th: boolean }) {
  const [selected, setSelected] = useState(0);
  useEffect(() => { setSelected(0); }, [images]);
  const active = images[selected] || images[0];
  const step = (direction: number) => setSelected(value => (value + direction + images.length) % images.length);
  return <div className="min-w-0" role="region" aria-label="Product gallery" onKeyDown={event => {
    if (images.length < 2) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  }}>
    <div className="relative aspect-[611/692] overflow-hidden rounded-[8px] bg-[#f7f7f7]"><Image unoptimized={remote || active.startsWith("/images/figma/")} src={active} alt={`${name} — image ${selected + 1} of ${images.length}`} fill priority sizes="(max-width: 768px) 90vw, 45vw" className={contain ? "object-contain p-8" : "object-cover"} style={active === "/images/figma/product-0.webp" ? { width: "109.49%", height: "131.68%", left: "-6.13%", top: "-16.07%", right: "auto", bottom: "auto" } : undefined} />
      {images.length > 1 && <><button type="button" onClick={() => step(-1)} aria-label="Previous product image" className="absolute inset-y-0 left-0 z-10 flex w-12 items-center justify-center text-white drop-shadow-[0_1px_2px_#0008] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px]"><svg viewBox="0 0 20 40" width="16" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M18 2 2 20l16 18" /></svg></button><button type="button" onClick={() => step(1)} aria-label="Next product image" className="absolute inset-y-0 right-0 z-10 flex w-12 items-center justify-center text-white drop-shadow-[0_1px_2px_#0008] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px]"><svg viewBox="0 0 20 40" width="16" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m2 2 16 18L2 38" /></svg></button><span className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5" aria-hidden="true">{images.map((_, index) => <span key={index} className={`h-1.5 w-1.5 rounded-full ${selected === index ? 'bg-white' : 'bg-white/40'}`} />)}</span></>}
    </div>
    {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label={th ? "รูปสินค้า" : "Product images"}>{images.map((src, index) => <button key={`${src}-${index}`} type="button" onClick={() => setSelected(index)} aria-label={`${th ? "ดูภาพที่" : "View image"} ${index + 1}`} aria-pressed={selected === index} className={`relative h-16 w-16 shrink-0 overflow-hidden border ${selected === index ? "border-black" : "border-transparent"}`}><Image unoptimized={remote} src={src} alt="" fill sizes="64px" className="object-cover" /></button>)}</div>}
  </div>;
}
