import Image from "next/image";
import Link from "next/link";
import { getCmsContent, localizedContent } from "./lib/cms";
import { getLocale } from "./lib/locale";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getLocale();
  const content = localizedContent(await getCmsContent(), locale);
  const th = locale === "th";
  const products = content.products.filter((product) => product.published).slice(0, 4);

  return <main className="overflow-hidden bg-[#f1e9eb] text-[#261e1c]">
    <section className="relative min-h-[75svh] overflow-hidden border-t-[12px] border-[#84694f] bg-[#b8c0c1] md:min-h-[calc(100svh-72px)]">
      <Image src="/images/collection-overview.png" alt="Valley's Darling jewelry" fill priority sizes="100vw" className="object-cover object-center transition-transform duration-[1600ms] hover:scale-[1.035]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,25,26,.24),transparent_42%,rgba(20,20,20,.26))]" />
      <div className="relative flex min-h-[75svh] flex-col items-center justify-between px-6 pb-10 pt-12 text-center text-white md:min-h-[calc(100svh-72px)] md:pb-16 md:pt-20">
        <p className="fade-in text-[10px] uppercase tracking-[.32em] md:text-xs">{th ? "ยินดีต้อนรับสู่โลกใบเล็กของเรา" : "WELCOME TO OUR LITTLE WORLD"}</p>
        <div className="slide-up max-w-3xl">
          <h1 className="brand-script text-[clamp(4.5rem,10vw,10rem)] leading-[.85] drop-shadow-md">Valley&apos;s Darling</h1>
          <p className="mx-auto mt-8 max-w-lg font-serif text-sm leading-7 tracking-[.06em] md:text-lg">{content.home.intro}</p>
          <Link href="#story" className="mt-9 inline-flex min-h-12 items-center justify-center border border-white bg-white px-8 text-[10px] uppercase tracking-[.2em] text-[#2f2925] transition-all duration-300 hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{th ? "ค้นพบโลกของเรา" : "DISCOVER THE WORLD"} <span aria-hidden className="ml-5">↗</span></Link>
        </div>
        <span aria-hidden className="text-xl">↓</span>
      </div>
    </section>

    <section id="story" className="relative mx-auto grid max-w-[1440px] gap-10 px-6 pb-24 pt-16 md:grid-cols-[1.05fr_.95fr] md:items-center md:gap-[8vw] md:px-[7vw] md:pb-36 md:pt-28">
      <div className="relative aspect-[4/5] w-full max-w-[660px] overflow-hidden bg-[#d6dad9] md:-mt-40 md:shadow-[24px_24px_0_#e7dadd]">
        <Image src="/images/lifestyle-1.png" alt="Valley's Darling editorial jewelry story" fill sizes="(max-width: 768px) 100vw, 48vw" className="object-cover transition-transform duration-700 hover:scale-105" />
      </div>
      <div className="max-w-xl py-3 md:py-20">
        <p className="text-[10px] uppercase tracking-[.28em]">{th ? "เรื่องราวของเรา" : "OUR STORY"}</p>
        <h2 className="mt-7 font-serif text-[clamp(2.4rem,4.3vw,5.4rem)] leading-[1.1]">{content.home.storyHeading}</h2>
        <p className="mt-7 max-w-md text-sm leading-8 text-[#5c4c4a] md:text-base">{content.home.storyBody}</p>
        <p className="mt-5 max-w-md text-sm leading-8 text-[#5c4c4a]">{th ? "เราเชื่อว่าเครื่องประดับแต่ละชิ้นควรเป็นส่วนหนึ่งของเรื่องราวที่มีเพียงคุณเท่านั้นที่เล่าได้" : "A place for the pieces you imagine, the stories you carry, and the little things you keep close."}</p>
        <Link href="/collections" className="mt-9 inline-flex min-h-12 items-center border border-[#342922] bg-white px-8 text-[10px] uppercase tracking-[.2em] transition-colors hover:bg-[#342922] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4">{th ? "ดูคอลเลกชัน" : "EXPLORE COLLECTION"} <span aria-hidden className="ml-5">↗</span></Link>
      </div>
    </section>

    <section className="bg-[#84694f] px-6 py-20 text-[#fffaf4] md:px-[7vw] md:py-28">
      <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-[.9fr_1.1fr] md:items-center">
        <div>
          <p className="text-[10px] uppercase tracking-[.28em]">{th ? "ชิ้นเดียวในโลกของคุณ" : "MADE JUST FOR YOU"}</p>
          <h2 className="brand-script mt-6 max-w-lg text-[clamp(4.5rem,8vw,9rem)] leading-[.85]">Your very own Valley</h2>
          <p className="mt-10 max-w-sm text-xs uppercase leading-7 tracking-[.16em]">{th ? "เครื่องประดับสั่งทำ ที่สร้างจากจินตนาการของคุณ" : "CUSTOM-MADE JEWELRY, CRAFTED AROUND YOUR IMAGINATION."}</p>
          <p className="mt-5 max-w-md whitespace-pre-line text-sm leading-8 text-white/80">{content.customMade.body}</p>
          <Link href="/custom-made" className="mt-8 inline-flex min-h-12 items-center border border-white bg-white px-8 text-[10px] uppercase tracking-[.2em] text-[#654d3b] transition-colors hover:bg-transparent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{content.customMade.cta} <span aria-hidden className="ml-5">↗</span></Link>
        </div>
        <div className="grid grid-cols-2 items-center gap-4 md:gap-8">
          <Link href="/custom-made" aria-label={th ? "ดูเครื่องประดับสั่งทำ" : "Explore custom-made jewelry"} className="relative aspect-[3/4] overflow-hidden bg-[#d9c8bc] transition-transform duration-500 hover:-translate-y-2"><Image src="/images/collection-overview.png" alt="Pearl jewelry detail" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" /></Link>
          <Link href="/ar?product=1" aria-label={th ? "ลองสวมแหวนด้วย AR" : "Try on the ring with AR"} className="relative mt-16 aspect-[3/4] overflow-hidden bg-[#d2b4af] transition-transform duration-500 hover:-translate-y-2"><Image src="/images/ar-ring-silver-v2.png" alt="Mother of pearl ring available for AR try-on" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-3 md:p-6" /></Link>
        </div>
      </div>
    </section>

    <section className="bg-[#fffefa] px-6 py-20 md:px-[7vw] md:py-28">
      <div className="mx-auto max-w-[1280px]">
        <p className="text-center text-[10px] uppercase tracking-[.3em]">{th ? "ค้นพบเครื่องประดับของเรา" : "DISCOVER OUR JEWELRY"}</p>
        <h2 className="mx-auto mt-5 max-w-2xl text-center font-serif text-[clamp(2.1rem,4vw,4.4rem)] uppercase leading-[1.1] tracking-[-.035em]">{th ? "บางสิ่งที่เราจินตนาการไว้แล้ว" : "A few things we’ve already imagined."}</h2>
        <div className="mt-14 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-7 md:mt-20 md:gap-y-20">
          {products.map((product) => <Link key={product.id} href={`/products/${encodeURIComponent(product.id)}`} className="group block">
            <div className="relative aspect-[1.12] overflow-hidden bg-[#e4dfe0]"><Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.055]" /></div>
            <div className="mt-4 flex items-start justify-between gap-4 text-[10px] uppercase leading-5 tracking-[.12em] md:text-xs"><h3>{product.name}</h3><span aria-hidden className="transition-transform group-hover:translate-x-1">↗</span></div>
          </Link>)}
        </div>
        <div className="mt-16 text-center"><Link href="/collections" className="inline-flex min-h-12 items-center border border-[#342922] px-9 text-[10px] uppercase tracking-[.2em] transition-colors hover:bg-[#342922] hover:text-white">{th ? "ดูสินค้าทั้งหมด" : "SHOP ALL JEWELRY"} <span aria-hidden className="ml-5">↗</span></Link></div>
      </div>
    </section>
  </main>;
}
