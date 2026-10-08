import Image from "next/image";
import Link from "next/link";
import { getCmsContent, localizedContent } from "../lib/cms";
import { getLocale } from "../lib/locale";
import { editorialImage } from '../lib/editorial-images';

const originals: Record<string, [string, string]> = {
  'heart-locket': ['/images/product-closeup-2.png', '/images/figma/shop-heart.png'],
  'ribbon-earring': ['/images/lifestyle-2.png', '/images/figma/shop-earring.png'],
  'pearl-ring': ['/images/ar-ring-silver-v2.png', '/images/figma/shop-ring.png'],
  'swirl-bow': ['/images/product-closeup-5.png', '/images/figma/shop-necklace.png'],
};

export const dynamic = "force-dynamic";
export default async function CollectionsPage() {
  const locale = await getLocale();
  const { products } = localizedContent(await getCmsContent(), locale);
  const order = ['heart-locket', 'ribbon-earring', 'pearl-ring', 'swirl-bow'];
  const rank = (id: string) => order.includes(id) ? order.indexOf(id) : order.length;
  const visible = products.filter(p => p.published).sort((a, b) => rank(a.id) - rank(b.id));
  return (
    <div className="editorial-page min-h-screen bg-white px-5 pb-24 pt-12 text-black md:px-[5.5%] md:pb-40 md:pt-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <h1 className="brand-script text-[72px] leading-[1.2] md:text-[clamp(5rem,8.9vw,8rem)]">Shop All</h1>
          <p className="mt-8 text-xl md:mt-12 md:text-[40px]">a few things we&apos;ve already imagined.</p>
        </div>
        <div id="new-in" className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:gap-x-[6%] md:gap-y-28">
          {visible.map((product) => (
            <Link href={`/products/${encodeURIComponent(product.id)}`} key={product.id} className="group">
              <div className="relative aspect-[573/643] overflow-hidden rounded-lg bg-[#f7f7f7]"><Image unoptimized src={originals[product.id]?.[0] === product.image ? originals[product.id][1] : editorialImage(product)} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-[1.025]" sizes="(max-width: 768px) 45vw, 44vw" /></div>
              <h2 className="mt-4 text-base leading-snug md:mt-6 md:text-[32px]">{product.name}</h2>
              <p className="mt-2 text-sm md:text-2xl">{product.priceBaht !== undefined ? `฿${product.priceBaht.toLocaleString('en-US')}` : 'Enquire about this piece'}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
