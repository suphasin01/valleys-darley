import Link from 'next/link';
import { FigmaImage } from './FigmaImage';

/** Only the selection artwork is verified; no configurable variants are published yet. */
export function GemstoneDesignReference({ name, left, top }: { name: string; left: string; top: string }) {
  return <section className="mx-auto mt-10 max-w-[760px] text-center">
    <FigmaImage src="/images/figma/preview-0.webp" alt={name} className="mx-auto aspect-[384/379] w-[min(80%,420px)]" crop={{left,top,width:'419.08%',height:'238.69%'}} />
    <p className="mx-auto mt-10 max-w-md text-sm leading-7">Design reference. Custom options for this piece are not available online yet. Please contact us to confirm materials, size and pricing.</p>
    <Link href="/contact?custom=gemstone-locket" className="mt-7 inline-flex min-h-11 items-center bg-[#f1e9eb] px-8 text-sm uppercase">Enquire about this design</Link>
    <p className="mt-5 text-xs text-black/55">No order or payment is created by viewing this design.</p>
  </section>;
}
