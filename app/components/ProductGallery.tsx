"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name, remote, contain, th }: { images: string[]; name: string; remote: boolean; contain: boolean; th: boolean }) {
  const [selected, setSelected] = useState(0);
  const active = images[selected] || images[0];
  return <div className="min-w-0">
    <div className="relative aspect-[611/692] overflow-hidden rounded-sm bg-[#f0edef]"><Image unoptimized={remote} src={active} alt={name} fill priority sizes="(max-width: 768px) 90vw, 45vw" className={contain ? "object-contain p-8" : "object-cover"} /></div>
    {images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label={th ? "รูปสินค้า" : "Product images"}>{images.map((src, index) => <button key={`${src}-${index}`} type="button" onClick={() => setSelected(index)} aria-label={`${th ? "ดูภาพที่" : "View image"} ${index + 1}`} aria-pressed={selected === index} className={`relative h-16 w-16 shrink-0 overflow-hidden border ${selected === index ? "border-black" : "border-transparent"}`}><Image unoptimized={remote} src={src} alt="" fill sizes="64px" className="object-cover" /></button>)}</div>}
  </div>;
}
