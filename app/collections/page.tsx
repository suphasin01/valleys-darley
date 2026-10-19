import Link from "next/link";
import { getCmsContent, localizedContent } from "../lib/cms";
import { getLocale } from "../lib/locale";
import { catalogArtwork } from '../lib/editorial-images';
import { CatalogPhoto } from '../components/CatalogPhoto';

export const dynamic = "force-dynamic";
export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const bePresent = (await searchParams).collection === 'be-present';
  const locale = await getLocale();
  const { products } = localizedContent(await getCmsContent(), locale);
  const order = ['heart-locket', 'ribbon-earring', 'pearl-ring', 'swirl-bow'];
  const rank = (id: string) => order.includes(id) ? order.indexOf(id) : order.length;
  const visible = products.filter(p => p.published && (!bePresent || order.includes(p.id))).sort((a, b) => rank(a.id) - rank(b.id));
  return (
    <div className="editorial-page min-h-screen bg-white px-5 pb-24 pt-12 text-black md:px-[5.5%] md:pb-40 md:pt-16">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center">
          <h1 className="brand-script text-[72px] leading-[1.2] md:text-[clamp(5rem,8.9vw,8rem)]">{bePresent ? 'Be Present Collection' : 'Shop All'}</h1>
          {bePresent ? <p className="mx-auto mt-8 max-w-[900px] text-sm leading-relaxed md:mt-12 md:text-base">This collection is inspired by the ribbon, reshaped into rosettes and countless other forms, each one a symbol of the feeling that every moment in life is a gift.<br/>To wear a piece from Be Present is to wrap yourself in love, gently looking back to acknowledge your own worth. It&apos;s a quiet reminder that you are, and have always been, the greatest gift one could ever receive.</p> : <p className="mt-8 text-xl md:mt-12 md:text-[32px]">a few things we&apos;ve already imagined.</p>}
        </div>
        <div id="new-in" className="mx-auto mt-12 grid max-w-[1227px] grid-cols-2 gap-x-4 gap-y-12 md:mt-20 md:gap-x-[6.6%] md:gap-y-28">
          {visible.map((product) => { const artwork = catalogArtwork(product); return (
            <Link href={`/products/${encodeURIComponent(product.id)}`} key={product.id} className="catalog-card group">
              <CatalogPhoto primary={artwork.primary} hover={artwork.hover} name={product.name} />
              <h2 className="mt-4 text-base leading-snug md:mt-6 md:text-[24px]">{product.name}</h2>
              <p className="mt-2 text-sm md:text-2xl">{product.priceBaht !== undefined ? `฿${product.priceBaht.toLocaleString('en-US')}` : 'Enquire about this piece'}</p>
            </Link>
          ); })}
        </div>
      </div>
    </div>
  );
}
