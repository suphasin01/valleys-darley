import Image from "next/image";
import Link from "next/link";
import { getCmsContent } from "../lib/cms";

const customPieces = ["/images/ar-ring-silver-v2.png", "/images/product-closeup-2.png", "/images/collection-overview.png"];

export const dynamic = "force-dynamic";
export default async function CustomMadePage() {
  const content = await getCmsContent();
  return (
    <div className="min-h-screen bg-[#f4e5e9] text-[#211815]">
      <section className="mx-auto max-w-[1320px] px-6 pb-20 pt-16 text-center md:px-12 md:pb-28 md:pt-24">
        <h1 className="brand-script text-5xl md:text-8xl">{content.customMade.heading}</h1>
        <p className="mx-auto mt-10 max-w-2xl whitespace-pre-line font-serif text-xs uppercase leading-6 tracking-[0.06em] md:text-sm md:leading-7">{content.customMade.body}</p>
        <Link href="/contact" className="mt-10 inline-block bg-black px-8 py-4 text-[10px] tracking-[0.18em] text-white">{content.customMade.cta}</Link>
        <div className="mt-14 flex snap-x gap-4 overflow-x-auto pb-5 md:mt-20 md:grid md:grid-cols-3 md:overflow-visible">
          {customPieces.map((image, index) => <article key={image} className="relative aspect-[4/5] w-[82vw] shrink-0 snap-center overflow-hidden bg-[#eee4da] md:w-auto"><Image src={image} alt={`Custom jewelry inspiration ${index + 1}`} fill className={index === 0 ? "object-contain p-10" : "object-cover"} sizes="(max-width: 768px) 82vw, 33vw" /><span className="absolute bottom-4 left-4 bg-white/85 px-3 py-2 text-[9px] tracking-[0.14em]">0{index + 1} — MADE FOR YOU</span></article>)}
        </div>
        <p className="mt-2 text-[9px] uppercase tracking-[0.17em] md:hidden">Swipe to choose a piece</p>
      </section>
    </div>
  );
}
