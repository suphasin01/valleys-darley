import Image from "next/image";
import Link from "next/link";
import { getCmsContent, localizedContent } from "../lib/cms";
import { getLocale } from "../lib/locale";

export const dynamic = "force-dynamic";
export const metadata = { title: "Our World — Valley's Darling" };

export default async function AboutPage() {
  const locale = await getLocale();
  const th = locale === "th";
  const content = localizedContent(await getCmsContent(), locale);
  return <main className="editorial-page mx-auto max-w-[1440px] bg-[#fffefa] px-5 py-10 text-[#261e1c] md:px-16 md:py-16">
    <h1 className={`mb-8 text-right ${th ? "text-3xl md:text-5xl" : "brand-script text-5xl md:text-7xl"}`}>{th ? "เข้าสู่โลกของเรา" : "Enter our World"}</h1>
    <div className="relative aspect-[16/10] overflow-hidden md:aspect-[2.2]"><Image src="/images/heartfelt-chronicles.png" alt="Valley's Darling handcrafted jewelry editorial" fill priority sizes="(max-width: 768px) 100vw, 1280px" className="object-cover object-[center_42%] transition-transform duration-1000 hover:scale-[1.025]" /></div>
    <section className="grid gap-8 py-16 md:grid-cols-2 md:gap-20 md:py-24">
      <div className="flex flex-col justify-center"><h2 className="max-w-lg text-4xl leading-tight md:text-6xl">{content.home.heading}<br />{content.home.emphasis}<br />{content.home.ending}</h2><p className="mt-8 max-w-md text-sm leading-8">{content.home.storyBody}</p><Link href="/collections" className="editorial-button mt-8 self-start">{th ? "ค้นพบคอลเลกชัน" : "EXPLORE COLLECTION"}</Link></div>
      <div className="relative aspect-[4/5] overflow-hidden"><Image src="/images/collection-overview.png" alt="Pearls and gemstones from our little world" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" /></div>
    </section>
    <section className="mx-auto max-w-2xl pb-16 text-center md:pb-24"><h2 className={th ? "text-3xl" : "brand-script text-5xl md:text-6xl"}>{th ? "เรื่องราวเบื้องหลังชื่อของเรา" : "The story behind our name"}</h2><p className="mt-8 text-sm leading-8">{content.home.intro}</p><p className="mt-6 text-sm leading-8">{th ? "จินตนาการนำทาง งานฝีมือค่อย ๆ ตามมา ทุกชิ้นที่มาถึงมือคุณเริ่มต้นจากความรู้สึก และกลายเป็นเรื่องราวที่คุณเก็บไว้ใกล้ตัว" : "Imagination leads. Craft follows. Every piece that arrives in your hands begins with a feeling, then becomes a story you can keep close."}</p><Link href="/custom-made" className="editorial-button mt-10">{th ? "สร้างชิ้นงานของคุณ" : "CREATE YOUR OWN STORY"}</Link></section>
  </main>;
}
