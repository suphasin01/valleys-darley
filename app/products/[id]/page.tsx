import { ProductGallery } from "../../components/ProductGallery";
import { ProductCards } from "../../components/ProductCards";
import Link from "next/link";
import { editorialImage } from "../../lib/editorial-images";
import { notFound } from "next/navigation";
import { getCmsContent, localizedContent } from "../../lib/cms";
import { getLocale } from "../../lib/locale";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ checkout?: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const { products } = localizedContent(await getCmsContent(), locale);
  const product = products.find(item => item.id === id && item.published);
  if (!product) notFound();
  const isAr = product.link.startsWith("/ar");
  const photo = editorialImage(product);
  const { checkout } = await searchParams;
  const hasPrice = Number.isSafeInteger(product.priceBaht) && (product.priceBaht || 0) >= 10;
  const related = products.filter(item => item.published && item.id !== product.id).slice(0, 3);
  return <main className="editorial-page min-h-screen bg-white px-5 py-8 text-[#211815] md:px-16 md:py-12">
    <div className="mx-auto grid max-w-[1280px] gap-8 md:grid-cols-[611fr_515fr] md:gap-[10vw]">
      <ProductGallery images={Array.from(new Set([photo, ...(product.images || [])]))} name={product.name} remote={product.image.startsWith("https:")} contain={isAr && photo === product.image} th={locale === "th"} />
      <div className="flex min-w-0 flex-col items-start">
        <Link href="/collections" className="text-xs tracking-[.15em] text-black/50 hover:underline">← {locale === "th" ? "กลับไปคอลเลกชัน" : "BACK TO COLLECTION"}</Link>
        <h1 className="mt-6 break-words text-2xl leading-snug md:text-3xl">{product.name}</h1>
        {hasPrice && <p className="mt-4 text-xl">฿{product.priceBaht!.toLocaleString("th-TH")}</p>}
        <p className="mt-6 line-clamp-6 max-w-lg whitespace-pre-line text-base leading-[1.5] text-black/75 md:text-xl">{product.description}</p>
        {product.description.length > 400 && <details className="mt-3 w-full text-sm"><summary className="cursor-pointer underline underline-offset-4">{locale === "th" ? "อ่านรายละเอียดทั้งหมด" : "READ FULL DETAILS"}</summary><p className="mt-4 whitespace-pre-line leading-7 text-black/75">{product.description}</p></details>}
        {checkout === "unavailable" && <p role="alert" className="mt-5 text-sm text-red-700">{locale === "th" ? "ยังไม่สามารถเริ่มชำระเงินได้ กรุณาลองอีกครั้งหรือติดต่อเรา" : "Checkout is unavailable. Please try again or contact us."}</p>}
        {checkout === "canceled" && <p role="status" className="mt-5 text-sm text-black/60">{locale === "th" ? "ยกเลิกการชำระเงินแล้ว ยังไม่มีการเรียกเก็บเงิน" : "Checkout was canceled. You have not been charged."}</p>}
        {product.variants?.length ? <form action="/checkout" method="get" className="mt-8 w-full space-y-4"><input type="hidden" name="product" value={product.id}/><label className="block text-sm">{locale==='th'?'เลือกสี / ขนาด':'Choose color / size'}<select name="variant" className="mt-2 w-full border border-black/20 bg-white p-3" defaultValue={product.variants?.find(v=>v.available>0)?.id}>{product.variants?.map(v=><option key={v.id} value={v.id} disabled={v.available<1}>{v.label||v.sku||v.id} · ฿{v.price.toLocaleString('th-TH')}{v.available<1?' · Sold out':''}</option>)}</select></label><button disabled={!product.variants?.some(v=>v.available>0)} className="w-full rounded-[8px] bg-[#f1e9eb] px-8 py-3 text-xl text-black disabled:opacity-40">{product.variants?.some(v=>v.available>0)?locale==='th'?'สั่งซื้อสินค้านี้':'ORDER THIS PIECE':locale==='th'?'สินค้าหมด':'SOLD OUT'} ↗</button></form> : <Link href={`/checkout?product=${encodeURIComponent(product.id)}`} className="mt-8 flex w-full items-center justify-center rounded-[8px] bg-[#f1e9eb] px-8 py-3 text-xl text-black hover:bg-[#e6d6dd]">{hasPrice ? locale === "th" ? "สั่งซื้อสินค้านี้" : "ORDER THIS PIECE" : locale === "th" ? "สอบถามเพื่อสั่งซื้อ" : "ENQUIRE TO ORDER"} ↗</Link>}
        <Link href={product.link} className="mt-6 inline-flex min-h-11 items-center text-xs tracking-[.08em] underline underline-offset-4">{isAr ? locale === "th" ? "ลองสวมด้วย AR" : "TRY ON WITH AR" : locale === "th" ? "สอบถามเกี่ยวกับชิ้นนี้" : "ENQUIRE ABOUT THIS PIECE"} ↗</Link>
        <details className="mt-8 w-full border-y border-black/15 py-4"><summary className="cursor-pointer text-xs uppercase tracking-wide">{locale === "th" ? "ขนาดและการดูแลเครื่องประดับ" : "SIZE GUIDE AND CARE INSTRUCTION"}</summary><p className="mt-4 text-sm leading-7">{locale === "th" ? "เลือกขนาดจากตัวเลือกสินค้าด้านบน หากไม่แน่ใจกรุณาติดต่อเรา เก็บเครื่องประดับในที่แห้ง และหลีกเลี่ยงน้ำหอมและสารเคมี" : "Choose from the available size options above. Contact us if you need help finding your fit. Store jewelry in a dry place and avoid perfume and chemicals."}</p><Link href="/contact" className="mt-3 inline-block underline">{locale === "th" ? "ติดต่อเรา" : "CONTACT US"}</Link></details>
      </div>
    </div>
    {related.length > 0 && <section className="mx-auto max-w-[1280px] pb-8 pt-16 md:pt-40"><h2 className="text-lg uppercase">{locale === "th" ? "สินค้าที่เกี่ยวข้อง" : "RELATED PRODUCTS"}</h2><ProductCards products={related} locale={locale} className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-8" /></section>}
  </main>;
}
