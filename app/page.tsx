import Image from "next/image";
import Link from "next/link";
import { getCmsContent, localizedContent } from "./lib/cms";
import { copy } from "./lib/i18n";
import { getLocale } from "./lib/locale";

export const dynamic = "force-dynamic";
export default async function Home() {
  const locale = await getLocale();
  const t = copy[locale];
  const content = localizedContent(await getCmsContent(), locale);
  return (
    <div className="bg-[#f8f1e5] text-[#241c16]">
      <section className="grid min-h-[calc(100svh-58px)] md:min-h-[calc(100vh-72px)] md:grid-cols-[0.78fr_1.22fr]">
        <div className="flex flex-col justify-center px-7 py-16 md:px-[8vw] md:py-24">
          <h1 className="font-serif text-[clamp(2.9rem,6vw,6.5rem)] leading-[0.94] tracking-[-0.04em]">{content.home.heading}<br /><em className="font-normal">{content.home.emphasis}</em><br />{content.home.ending}</h1>
          <p className="mt-8 max-w-md text-xs leading-6 text-black/55 md:text-sm">{content.home.intro}</p>
          <div className="mt-8 flex items-center gap-4"><Link href="/collections" className="bg-[#2b1b0d] px-6 py-4 text-[9px] tracking-[0.2em] text-white">{t.exploreCollection}</Link><Link href="#story" className="text-[9px] tracking-[0.18em]">{t.ourStory} →</Link></div>
        </div>
        <div className="relative min-h-[54svh] overflow-hidden bg-[#d8e0df] md:min-h-0">
          <Image src="/images/collection-overview.png" alt="Valley's Darling pearl jewelry" fill priority className="object-cover opacity-95" sizes="(max-width: 768px) 100vw, 62vw" />
          <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(220,230,230,.1),rgba(255,247,237,.35))]" />
          <p className="absolute inset-x-0 top-8 text-center font-serif text-[9px] tracking-[0.15em] md:top-16 md:text-xs">{t.welcome}</p>
        </div>
      </section>

      <section id="story" className="grid bg-[#eadde0] md:min-h-screen md:grid-cols-[1.12fr_.88fr]">
        <div className="relative min-h-[620px] md:min-h-screen">
          <Image src="/images/fashion-model.png" alt="Valley's Darling story" fill className="object-cover grayscale" sizes="(max-width: 768px) 100vw, 56vw" />
          <div className="absolute inset-0 bg-black/10" />
          <p className="brand-script absolute inset-x-6 top-12 text-center text-5xl leading-[0.9] text-white md:top-16 md:text-7xl">{t.storyArt}</p>
          <p className="absolute inset-x-5 bottom-8 max-w-3xl text-[9px] uppercase leading-4 tracking-[0.06em] text-white md:left-8 md:right-auto md:text-[11px]">{t.storyCaption}</p>
        </div>
        <div className="flex flex-col justify-center px-8 py-16 md:px-16">
          <span className="text-[9px] uppercase tracking-[0.22em]">{t.ourStory}</span>
          <h2 className="mt-5 font-serif text-5xl leading-none md:text-7xl">{content.home.storyHeading}</h2>
          <p className="mt-8 max-w-md text-sm leading-7 text-black/60">{content.home.storyBody}</p>
          <Link href="/custom-made" className="mt-9 w-fit border-b border-black pb-1 text-[10px] tracking-[0.18em]">{t.discoverCustom}</Link>
        </div>
      </section>

      <section id="care" className="grid gap-px bg-black/10 md:grid-cols-3">
        {[[t.discover, t.collection, "/collections"], [t.create, t.customMade, "/custom-made"], [t.experience, t.tryOn, "/ar?product=1"]].map(([eyebrow, title, href], index) => (
          <Link key={title} href={href} className={`min-h-[280px] p-8 md:min-h-[360px] md:p-12 ${index === 1 ? "bg-[#f0d8dd]" : "bg-[#f8f1e5]"}`}><span className="text-[9px] tracking-[0.2em]">{eyebrow}</span><h2 className="mt-24 font-serif text-4xl md:mt-40 md:text-5xl">{title}</h2><span className="mt-5 block text-xs">{t.explore} →</span></Link>
        ))}
      </section>
    </div>
  );
}
