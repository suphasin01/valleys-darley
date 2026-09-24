import Image from "next/image";
import Link from "next/link";
import { getCmsContent, localizedContent } from "../lib/cms";
import { copy } from "../lib/i18n";
import { getLocale } from "../lib/locale";

export const dynamic = "force-dynamic";
export default async function CollectionsPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const { products } = localizedContent(await getCmsContent(), locale);
  return (
    <div className="min-h-screen bg-[#f5e7ea] px-5 pb-20 pt-12 text-[#211815] md:px-10 md:pb-28 md:pt-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <h1 className="inline-block rounded-[18px] border-4 border-double border-black px-6 py-4 font-serif text-xl md:px-12 md:text-3xl">{t.collectionHeading}</h1>
          <p className="mx-auto mt-6 max-w-xl text-xs leading-5 text-black/55">{t.collectionIntro}</p>
        </div>
        <div id="new-in" className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-16 md:grid-cols-3 md:gap-x-5 md:gap-y-14">
          {products.filter(product => product.published).map((product) => (
            <Link href={product.link} key={product.id} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#eee4da]"><Image src={product.image} alt={product.name} fill className={`${product.link.startsWith("/ar") ? "object-contain p-8 md:p-16" : "object-cover"} transition duration-700 group-hover:scale-[1.04]`} sizes="(max-width: 768px) 50vw, 33vw" /></div>
              <h2 className="mt-3 min-h-8 font-serif text-[10px] uppercase leading-4 md:text-sm">{product.name}</h2><p className="mt-1 text-[9px] tracking-[0.12em]">{t.viewPiece} →</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
