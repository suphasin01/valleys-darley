import Image from "next/image";
import Link from "next/link";

const products = [
  ["Pleated Gemstone Ribbon Earring", "/images/lifestyle-2.png"],
  ["The Ruffle Heart Locket Necklace", "/images/product-closeup-2.png"],
  ["Classic Swirl Bow Necklace", "/images/product-closeup-5.png"],
  ["Rosette Ribbon Mother of Pearl Ring", "/images/ar-ring-silver-v2.png"],
  ["Pink Infusion Pearl Chain", "/images/product-closeup-4.png"],
  ["Darling Pearl Keepsake", "/images/collection-overview.png"],
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-[#f5e7ea] px-5 pb-20 pt-12 text-[#211815] md:px-10 md:pb-28 md:pt-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <h1 className="inline-block rounded-[18px] border-4 border-double border-black px-6 py-4 font-serif text-xl md:px-12 md:text-3xl">DISCOVER OUR COLLECTION</h1>
          <p className="mx-auto mt-6 max-w-xl text-xs leading-5 text-black/55">Treasures made for daily rituals, special moments, and every darling in between.</p>
        </div>
        <div id="new-in" className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-16 md:grid-cols-3 md:gap-x-5 md:gap-y-14">
          {products.map(([name, image], index) => (
            <Link href={index === 3 ? "/ar?product=1" : "/contact"} key={name} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#eee4da]"><Image src={image} alt={name} fill className={`${index === 3 ? "object-contain p-8 md:p-16" : "object-cover"} transition duration-700 group-hover:scale-[1.04]`} sizes="(max-width: 768px) 50vw, 33vw" /></div>
              <h2 className="mt-3 min-h-8 font-serif text-[10px] uppercase leading-4 md:text-sm">{name}</h2><p className="mt-1 text-[9px] tracking-[0.12em]">VIEW PIECE →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
