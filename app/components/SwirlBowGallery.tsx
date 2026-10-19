import { swirlArtwork } from '../lib/swirl-artwork';

export function SwirlBowGallery({ plating, gemstone, finish }: { plating: string; gemstone: string; finish: string }) {
  const artwork = swirlArtwork({ plating, gemstone, finish });
  if (!artwork) return <p role="status" className="py-12 text-center text-sm">Artwork is unavailable for this combination. Please choose an available specification.</p>;
  return <>
    <div className="custom-swirl-gallery relative aspect-[1263/512] max-sm:aspect-[6/5]" role="region" aria-label="Swirl Bow design views">
      <div className="absolute left-[6.0174%] top-[7.2266%] w-[23.753%] max-sm:left-0 max-sm:w-[35%]">
        <p className="absolute -top-6 w-full text-center text-[clamp(8px,.833vw,12px)] uppercase">underneath</p>
        <img src={artwork.underneath} width={600} height={600} alt={`${artwork.description}, underneath`} className="block h-auto w-full" />
      </div>
      <div className="absolute left-[31.5123%] top-0 aspect-[518/512] w-[41.0135%] max-sm:left-[30%] max-sm:top-[10%] max-sm:w-[70%]"><img src={artwork.front} width={600} height={600} alt={`${artwork.description}, front`} className="block h-full w-full object-contain" /></div>
    </div>
    <p className="mt-8 text-center text-xs uppercase">Custom-made jewelry, crafted around your imagination.</p>
    <p className="mx-auto mt-4 max-w-xl text-center text-xs leading-relaxed text-black/55">Original design reference shown. Final specifications are confirmed by our team.</p>
  </>;
}
