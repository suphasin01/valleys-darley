import Image from "next/image";
import Link from "next/link";
import { getCmsContent, localizedContent } from "./lib/cms";
import { getLocale } from "./lib/locale";
import { ProductCards } from "./components/ProductCards";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const content = localizedContent(await getCmsContent(), locale);
  const th = locale === "th";
  const catalog = content.products.filter(product => product.published);
  const products = catalog.slice(0, 4);
  const earrings = catalog.find(product => product.id === "ribbon-earring");
  const ring = catalog.find(product => product.id === "pearl-ring");
  const hero = earrings?.images?.[1] || earrings?.image || "/images/collection-overview.png";
  const portraits = [ring?.images?.[1] || "/images/heartfelt-chronicles.png", ring?.images?.[3] || "/images/lifestyle-1.png"];
  return <main className="editorial-page overflow-hidden bg-[#fffefa] text-[#261e1c]">
    <section className="relative min-h-[65svh] bg-[#c3c9c9] md:aspect-[1440/900] md:min-h-0">
      <Image unoptimized={Boolean(earrings)} src={hero} alt="Valley's Darling jewelry collection" fill priority sizes="100vw" className="object-cover transition-transform duration-[1600ms] hover:scale-[1.035]" />
      <div className="relative flex min-h-[65svh] flex-col items-center justify-between px-5 py-10 text-center md:aspect-[1440/900] md:min-h-0 md:py-16">
        <h1 className="fade-in bg-white/65 px-4 py-2 text-xs tracking-[.1em] md:text-lg">{th ? "ยินดีต้อนรับสู่โลกใบเล็กของเรา" : "WELCOME TO OUR LITTLE WORLD"}</h1>
        <Link href="/about" className="editorial-button slide-up bg-white">{th ? "ค้นพบโลกของเรา" : "DISCOVER THE WORLD"}</Link>
      </div>
    </section>
    <section aria-label={th ? "ภาพเรื่องราวของแบรนด์" : "Our editorial story"} className="grid grid-cols-2 gap-1 pt-1 md:gap-2 md:pt-2">
      {portraits.map((src, index) => <Link key={index} href="/about" className="group relative aspect-[3/4] overflow-hidden bg-[#efe7e1]"><Image unoptimized={src.startsWith("https:")} src={src} alt={index === 0 ? "Valley's Darling editorial portrait" : "Handcrafted jewelry worn close"} fill sizes="50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /></Link>)}
    </section>
    <section id="story" className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
      <h2 className={th ? "text-3xl leading-relaxed md:text-5xl" : "brand-script text-[clamp(3rem,6vw,6rem)] leading-[1.15]"}>{content.home.heading} {content.home.emphasis}<br />{content.home.ending}</h2>
      <p className="mx-auto mt-8 max-w-xl text-xs uppercase leading-7 tracking-[.06em] md:text-sm">{content.home.storyBody}</p>
      <Link href="/collections" className="editorial-button mt-8">{th ? "ดูคอลเลกชัน" : "EXPLORE COLLECTION"}</Link>
    </section>
    <section className="bg-[#f1e9eb] px-5 py-10 md:px-[7vw] md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 border-b border-black/25 pb-5 md:flex-row md:items-center">
          <h2 className="text-3xl uppercase md:text-5xl">{content.customMade.heading}</h2>
          <p className="max-w-xs text-xs uppercase leading-6 tracking-[.05em]">{th ? "เครื่องประดับสั่งทำ ที่สร้างจากจินตนาการของคุณ" : "CUSTOM-MADE JEWELRY, CRAFTED AROUND YOUR IMAGINATION."}</p>
        </div>
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-3 gap-2 md:gap-6">{products.slice(0, 3).map(product => <Link key={product.id} href={`/products/${encodeURIComponent(product.id)}`} className="group relative aspect-square overflow-hidden rounded-sm bg-white/40"><Image unoptimized={product.image.startsWith("https:")} src={product.image} alt={product.name} fill sizes="(max-width: 768px) 28vw, 280px" className="object-cover transition-transform duration-700 group-hover:scale-105" /></Link>)}</div>
        <div className="mx-auto mt-6 max-w-2xl text-center"><p className="whitespace-pre-line text-sm leading-7">{content.customMade.body}</p><Link href="/custom-made" className="editorial-button mt-8 bg-[#261e1c] text-white hover:bg-white hover:text-black">{content.customMade.cta}</Link></div>
      </div>
    </section>
    <section className="mx-auto max-w-[1280px] px-5 py-14 md:px-12 md:py-20">
      <h2 className="text-center text-base uppercase tracking-[.06em] md:text-xl">{th ? "ค้นพบเครื่องประดับของเรา" : "DISCOVER OUR JEWELRY"}</h2>
      <ProductCards products={products} locale={locale} className="mt-10 grid grid-cols-2 gap-x-3 gap-y-9 md:mt-14 md:gap-x-10 md:gap-y-14" />
      <div className="mt-12 text-center"><Link href="/collections" className="editorial-button">{th ? "ดูสินค้าทั้งหมด" : "SHOP ALL JEWELRY"}</Link></div>
    </section>
  </main>;
}
