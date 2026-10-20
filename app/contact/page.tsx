import Link from "next/link";
import { getCmsContent, localizedContent } from "../lib/cms";
import { copy } from "../lib/i18n";
import { getLocale } from "../lib/locale";
import { CustomQuoteSummary } from "../components/CustomQuoteSummary";

export const dynamic = "force-dynamic";
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ custom?: string }> }) {
  const locale = await getLocale();
  const t = copy[locale];
  const content = localizedContent(await getCmsContent(), locale);
  const { custom } = await searchParams;
  return (
    <div className="flex min-h-[calc(100svh-58px)] flex-col bg-[#f3e4e8] text-[#211815] md:min-h-[calc(100vh-72px)]">
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-[9px] uppercase tracking-[0.22em]">{t.beginHere}</p>
        <h1 className="brand-script mt-5 text-6xl leading-[0.9] md:text-9xl">{content.contact.heading}</h1>
        <p className="mt-10 max-w-md text-xs leading-6 text-black/55">{content.contact.body}</p>
        {custom && ["heart-locket", "swirl-bow"].includes(custom) && <CustomQuoteSummary design={custom} />}
        <a href="https://line.me/R/ti/p/@valleydarley" target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center justify-center bg-black px-9 py-4 text-xs uppercase tracking-[0.12em] text-white focus-visible:outline-2 focus-visible:outline-offset-4">Contact with LINE OA <span aria-hidden="true" className="ml-3">↗</span></a>
        <p className="mt-3 text-xs leading-6 text-black/55">Opens our LINE chat for enquiries. No order or message is sent automatically.</p>
        {!/^https:\/\/(?:line\.me|lin\.ee)(?:\/|$)/i.test(content.contact.url) && <a href={content.contact.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex min-h-11 items-center px-5 text-xs underline underline-offset-4">{content.contact.cta}</a>}
        <Link href="/custom-made" className="mt-5 text-[9px] tracking-[0.15em] underline underline-offset-4">{t.discoverCustom}</Link>
      </section>
    </div>
  );
}
