import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCmsContent, localizedContent } from "../../lib/cms";
import { getLocale } from "../../lib/locale";
import { stripeCheckoutReady } from "../../lib/stripe";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ checkout?: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const { products } = localizedContent(await getCmsContent(), locale);
  const product = products.find(item => item.id === id && item.published);
  if (!product) notFound();
  const isAr = product.link.startsWith("/ar");
  const { checkout } = await searchParams;
  const hasPrice = Number.isSafeInteger(product.priceBaht) && (product.priceBaht || 0) >= 10;
  return <section className="min-h-screen bg-[#f6ecec] px-5 py-10 text-[#211815] md:px-10 md:py-20">
    <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:gap-16">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#eee4da]"><Image src={product.image} alt={product.name} fill priority className={isAr ? "object-contain p-10" : "object-cover"} sizes="(max-width: 768px) 100vw, 50vw" /></div>
      <div className="flex flex-col justify-center">
        <Link href="/collections" className="text-xs tracking-[.15em] text-black/50 hover:underline">← {locale === "th" ? "กลับไปคอลเลกชัน" : "BACK TO COLLECTION"}</Link>
        <p className="mt-10 text-[10px] uppercase tracking-[.25em] text-black/45">VALLEY&apos;S DARLING · JEWELRY</p>
        <h1 className="mt-5 font-serif text-4xl leading-tight md:text-6xl">{product.name}</h1>
        <p className="mt-8 max-w-lg whitespace-pre-line text-sm leading-8 text-black/65">{product.description}</p>
        {hasPrice && <p className="mt-7 font-serif text-3xl">฿{product.priceBaht!.toLocaleString("th-TH")}</p>}
        {checkout === "unavailable" && <p role="alert" className="mt-5 text-sm text-red-700">{locale === "th" ? "ยังไม่สามารถเริ่มชำระเงินได้ กรุณาลองอีกครั้งหรือติดต่อเรา" : "Checkout is unavailable. Please try again or contact us."}</p>}
        {checkout === "canceled" && <p role="status" className="mt-5 text-sm text-black/60">{locale === "th" ? "ยกเลิกการชำระเงินแล้ว ยังไม่มีการเรียกเก็บเงิน" : "Checkout was canceled. You have not been charged."}</p>}
        {hasPrice && stripeCheckoutReady() && <form action="/api/checkout" method="post" className="mt-8"><input type="hidden" name="productId" value={product.id} /><button className="bg-[#211815] px-8 py-4 text-xs tracking-[.16em] text-white transition-colors hover:bg-[#84694f]">{locale === "th" ? "ชำระเงินด้วย Stripe" : "BUY SECURELY WITH STRIPE"} ↗</button><p className="mt-3 text-xs text-black/45">{locale === "th" ? `ค่าจัดส่ง ฿${Number(process.env.STRIPE_SHIPPING_FEE_THB).toLocaleString("th-TH")} · แสดงยอดรวมก่อนยืนยัน` : `Shipping ฿${Number(process.env.STRIPE_SHIPPING_FEE_THB).toLocaleString("en-US")} · Total shown before payment`}</p></form>}
        {hasPrice && !stripeCheckoutReady() && <p className="mt-5 text-xs text-black/50">{locale === "th" ? "ระบบชำระเงินกำลังเตรียมเปิดให้บริการ" : "Secure checkout is coming soon."}</p>}
        <Link href={product.link} className="mt-10 w-fit bg-[#211815] px-8 py-4 text-xs tracking-[.16em] text-white">{isAr ? locale === "th" ? "ลองสวมด้วย AR" : "TRY ON WITH AR" : locale === "th" ? "สอบถามเกี่ยวกับชิ้นนี้" : "ENQUIRE ABOUT THIS PIECE"} ↗</Link>
      </div>
    </div>
  </section>;
}
