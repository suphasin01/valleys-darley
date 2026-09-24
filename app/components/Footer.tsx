import Link from "next/link";
import { BrandLogo } from "./Header";
import { copy, type Locale } from "../lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const groups = [
    { title: t.shop, links: [[t.newIn, "/collections#new-in"], [locale === 'th' ? 'เครื่องประดับ' : 'JEWELRY', "/collections"], [t.customMade, "/custom-made"]] },
    { title: t.help, links: [[t.contactUs, "/contact"], [t.orderShipping, "/account"], [t.care, "/#care"], [t.returns, "/contact"]] },
    { title: t.about, links: [[t.whereToFind, "/contact"], [t.ourStory, "/#story"], [t.journal, "/#story"]] },
  ];
  return (
    <footer className="bg-[#fffefa] px-6 py-12 text-[#211a16] md:px-12 md:py-16">
      <div className="mx-auto max-w-[1280px]">
        <BrandLogo className="text-4xl md:text-6xl" />
        <p className="mt-2 text-[9px] uppercase tracking-[0.12em]">{t.footerTagline}</p>
        <div className="mt-10 grid grid-cols-2 gap-8 text-[10px] md:grid-cols-4 md:text-xs">
          {groups.map((group) => <div key={group.title}><h3 className="mb-4 font-serif font-semibold">{group.title}</h3><ul className="space-y-2.5">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:underline">{label}</Link></li>)}</ul></div>)}
          <div><h3 className="mb-4 font-serif font-semibold">{t.legal}</h3><p>{t.privacy}</p><p className="mt-2">© {new Date().getFullYear()} VALLEY&apos;S DARLING</p></div>
        </div>
      </div>
    </footer>
  );
}
