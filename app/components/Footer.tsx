import Link from "next/link";
import { FigmaImage } from "./FigmaImage";
import { copy, type Locale } from "../lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const groups = [
    { title: t.shop, links: [[t.newIn, "/collections#new-in"], [locale === 'th' ? 'เครื่องประดับ' : 'JEWELRY', "/collections"], [t.customMade, "/custom-made"]] },
    { title: t.help, links: [[t.contactUs, "/contact"], [t.orderShipping, "/account"], [t.care, "/contact"], [t.returns, "/contact"]] },
    { title: t.about, links: [[t.whereToFind, "/contact"], [t.ourStory, "/about"], [t.journal, "/about"]] },
  ];
  return (
    <footer className="editorial-page bg-white px-[5.5%] pb-[3%] pt-[1%] text-black">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-2 gap-8 border-t border-black/20 pt-4 text-[11px] md:mx-auto md:max-w-[980px] md:grid-cols-4 md:text-[16px]">
          {groups.map((group) => <div key={group.title}><h3 className="mb-4 font-serif font-semibold">{group.title}</h3><ul className="space-y-2.5">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:underline">{label}</Link></li>)}</ul></div>)}
          <div><h3 className="mb-4 font-serif font-semibold">{t.legal}</h3><Link href="/privacy" className="block hover:underline">{t.privacy}</Link><Link href="/terms" className="mt-2 block hover:underline">{locale === 'th' ? 'ข้อกำหนดการใช้เว็บไซต์' : 'WEBSITE TERMS'}</Link><p className="mt-2">© {new Date().getFullYear()} VALLEY&apos;S DARLING</p></div>
        </div>
        <Link href="/" aria-label="Valley's Darling home" className="mt-[4%] block"><FigmaImage src="/images/figma/landing-13.webp" alt="Valley's Darling" className="aspect-[1304/299]" crop={{width:"113.67%",height:"618.73%",left:"-4.44%",top:"-29.91%"}} /></Link>
      </div>
    </footer>
  );
}
