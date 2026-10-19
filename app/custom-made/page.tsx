import Link from "next/link";
import { FigmaImage } from "../components/FigmaImage";
import { CustomMadeTitle } from "../components/CustomMadeTitle";

export const metadata = { title: "Custom Made — Valley’s Darling" };
const designs = [
  { id: "heart-locket", name: "The Ruffle Heart Locket Necklace", left: "-64.69%", top: "-112.81%" },
  { id: "swirl-bow", name: "The Swirl Bow Necklace", left: "-122.35%", top: "-19.43%" },
  { id: "gemstone-locket", name: "The Gemstone Locket Necklace", left: "-194.85%", top: "-104.46%" },
];
export default function CustomMadePage() {
  return <main className="editorial-page custom-made-page mx-auto max-w-[1440px] bg-[#f1e9eb] text-black">
    <section className="custom-made-selection text-center">
      <CustomMadeTitle />
      <p className="custom-made-intro uppercase">Custom-made jewelry, crafted around your imagination.</p>
      <div className="custom-made-designs mx-auto grid grid-cols-3">
        {designs.map(design => <Link key={design.id} href={`/custom-made/${design.id}`} aria-label={`Customize ${design.name}`} className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          <FigmaImage src="/images/figma/preview-0.webp" alt={design.name} className="aspect-[384/379] transition-transform duration-500 group-hover:scale-105" crop={{ width: "419.08%", height: "238.69%", left: design.left, top: design.top }} />
        </Link>)}
      </div>
      <p className="custom-made-note mx-auto uppercase">Choose your own colour, size, stone or have a name engraved on<br className="hidden sm:block" /> the piece. Each creation is made to order, especially for you.</p>
    </section>
  </main>;
}
