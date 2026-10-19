import { ProductGallery } from "../../components/ProductGallery";
import { AddToCart } from '../../components/Cart';
import { ProductCards } from "../../components/ProductCards";
import Link from "next/link";
import { editorialGallery, editorialImage } from "../../lib/editorial-images";
import { ProductGuide } from '../../components/ProductGuide';
import { notFound } from "next/navigation";
import { getCmsContent, localizedContent } from "../../lib/cms";
import { getLocale } from "../../lib/locale";
import { productAction } from '../../lib/product-action';

export const dynamic = "force-dynamic";

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ checkout?: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const { products } = localizedContent(await getCmsContent(), locale);
  const product = products.find(item => item.id === id && item.published);
  if (!product) notFound();
  const isAr = product.link.startsWith("/ar");
  const action = productAction(product.link);
  const photo = editorialImage(product);
  const { checkout } = await searchParams;
  const hasPrice = Number.isSafeInteger(product.priceBaht) && (product.priceBaht || 0) >= 10;
  const related = products.filter(item => item.published && item.id !== product.id).slice(0, 3);
  const guideKind = /ring/i.test(`${product.id} ${product.name}`) ? 'ring' : /necklace|chain|locket/i.test(`${product.id} ${product.name}`) ? 'necklace' : null;
  return <main className="editorial-page min-h-screen bg-white px-5 pb-12 pt-2 text-[#211815] md:px-16">
    <div className="mx-auto mb-2 max-w-[1280px]"><Link href="/collections" className="inline-flex min-h-6 items-center text-xs uppercase underline underline-offset-4">‹ Back to shop</Link></div>
    <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-[611fr_515fr] md:gap-[10vw]">
      <ProductGallery images={editorialGallery(product)} name={product.name} remote={product.image.startsWith("https:")} contain={isAr && photo === product.image} th={locale === "th"} />
      <div className="flex min-w-0 flex-col items-start">
        <h1 className="break-words text-xl uppercase leading-snug md:text-[clamp(18px,1.6667vw,24px)]">{product.name}</h1>
        {hasPrice && !product.variants?.length && <p className="mt-4 text-xl">฿{product.priceBaht!.toLocaleString("th-TH")}</p>}
        <p className="mt-6 line-clamp-6 max-w-lg whitespace-pre-line text-base leading-[1.5] text-black/75 md:text-[clamp(16px,1.3889vw,20px)]">{product.description}</p>
        {product.description.length > 400 && <details className="mt-3 w-full text-sm"><summary className="cursor-pointer underline underline-offset-4">{locale === "th" ? "อ่านรายละเอียดทั้งหมด" : "READ FULL DETAILS"}</summary><p className="mt-4 whitespace-pre-line leading-7 text-black/75">{product.description}</p></details>}
        {checkout === "unavailable" && <p role="alert" className="mt-5 text-sm text-red-700">{locale === "th" ? "ยังไม่สามารถเริ่มชำระเงินได้ กรุณาลองอีกครั้งหรือติดต่อเรา" : "Checkout is unavailable. Please try again or contact us."}</p>}
        {checkout === "canceled" && <p role="status" className="mt-5 text-sm text-black/60">{locale === "th" ? "ยกเลิกการชำระเงินแล้ว ยังไม่มีการเรียกเก็บเงิน" : "Checkout was canceled. You have not been charged."}</p>}
        {guideKind && <div className="mt-6 flex w-full items-center justify-between gap-4"><span className="text-sm uppercase">Size &amp; fit</span><ProductGuide kind={guideKind} /></div>}
        <AddToCart product={product} />
        <Link href={action.href} className="mt-6 inline-flex min-h-11 items-center text-xs tracking-[.08em] underline underline-offset-4">{action.chooseDesign ? locale === "th" ? "เลือกแบบเครื่องประดับ" : "CHOOSE YOUR DESIGN" : locale === "th" ? "สอบถามเกี่ยวกับชิ้นนี้" : "ENQUIRE ABOUT THIS PIECE"} ↗</Link>
        <div className="mt-8 flex flex-wrap items-center gap-2">{guideKind ? <ProductGuide kind={guideKind} label="Size guide" /> : <Link href="/help#size-guide" className="inline-flex min-h-11 items-center text-xs uppercase underline underline-offset-4">Size guide</Link>}<span className="text-xs uppercase">and</span><ProductGuide kind="care" label="Care instruction" /></div>
      </div>
    </div>
    {related.length > 0 && <section className="mx-auto max-w-[1280px] pb-8 pt-16 md:pt-40"><h2 className="text-lg uppercase">{locale === "th" ? "สินค้าที่เกี่ยวข้อง" : "RELATED PRODUCTS"}</h2><ProductCards products={related} locale={locale} className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-8" /></section>}
  </main>;
}
