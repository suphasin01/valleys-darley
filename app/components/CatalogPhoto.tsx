'use client';
import { useState } from 'react';

export function CatalogPhoto({ primary, hover, name }: { primary: string; hover?: string; name: string }) {
  const [loadedHover, setLoadedHover] = useState<string | null>(null);
  return <div className="relative aspect-[573/643] overflow-hidden rounded-lg bg-[#f7f7f7]">
    <img src={primary} alt={name} width={573} height={643} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
    {hover && <img key={hover} src={hover} alt="" aria-hidden="true" width={573} height={643} loading="lazy" decoding="async" onLoad={() => setLoadedHover(hover)} onError={() => setLoadedHover(null)} data-ready={loadedHover === hover} className="catalog-photo-hover absolute inset-0 h-full w-full object-cover opacity-0" />}
  </div>;
}
