import Link from "next/link";
import { getCmsContent, localizedContent } from "../lib/cms";
import { copy } from "../lib/i18n";
import { getLocale } from "../lib/locale";

export const dynamic = "force-dynamic";
export default async function ContactPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const content = localizedContent(await getCmsContent(), locale);
  return (
    <div className="flex min-h-[calc(100svh-58px)] flex-col bg-[#f3e4e8] text-[#211815] md:min-h-[calc(100vh-72px)]">
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[9px] uppercase tracking-[0.22em]">{t.beginHere}</p>
        <h1 className="brand-script mt-5 text-6xl leading-[0.9] md:text-9xl">{content.contact.heading}</h1>
        <p className="mt-10 max-w-md text-xs leading-6 text-black/55">{content.contact.body}</p>
        <a href={content.contact.url} target="_blank" rel="noreferrer" className="mt-8 bg-black px-9 py-4 text-[10px] tracking-[0.18em] text-white">{content.contact.cta}</a>
        <Link href="/custom-made" className="mt-5 text-[9px] tracking-[0.15em] underline underline-offset-4">{t.discoverCustom}</Link>
      </section>
    </div>
  );
}
