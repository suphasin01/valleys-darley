import Link from "next/link";
import { FigmaImage } from "./FigmaImage";
import { copy, type Locale } from "../lib/i18n";

export function Footer({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const groups = [
    { title: t.shop, links: [[t.newIn, "/collections#new-in"], [locale === 'th' ? 'เครื่องประดับ' : 'JEWELRY', "/collections"], [t.customMade, "/custom-made"]] },
    { title: t.help, links: [[t.contactUs, "/help#contact"], ['after sale services', '/help#after-sales'], [t.care, "/help#care"], [t.returns, "/help#shipping"], ['size guide', '/help#size-guide'], ['ring size guide', '/help#ring-size']] },
    { title: t.about, links: [[locale === 'th' ? 'เรื่องราว' : 'stories', "/about"], [t.whereToFind, "/contact"], [t.journal, "/about"]] },
  ];
  return (
    <footer className="editorial-page bg-white px-[5.5%] pb-[3%] pt-[1%] text-black">
      <div className="mx-auto max-w-[1280px]">
        <div className="border-t border-black/20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 px-[2%] pt-4 text-[12px] leading-[1.6875] md:max-w-[920px] md:grid-cols-4 md:gap-x-[4%] md:text-[16px]">
          {groups.map((group) => <div key={group.title}><h3 className="mb-3 text-[14px] font-medium md:text-[20px]">{group.title}</h3><ul className="space-y-1">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:underline focus-visible:underline">{label}</Link></li>)}</ul></div>)}
          <div><h3 className="mb-3 text-[14px] font-medium md:text-[20px]"><Link href="/privacy" className="hover:underline">{t.privacy}</Link></h3><Link href="/terms" className="block hover:underline">{locale === 'th' ? 'ข้อกำหนดการใช้เว็บไซต์' : 'term of service'}</Link><Link href="/orders" className="mt-1 block hover:underline">{locale === 'th' ? 'คำสั่งซื้อของฉัน' : 'my orders'}</Link><p className="mt-3 text-[11px] text-black/50">© {new Date().getFullYear()} VALLEY&apos;S DARLING</p></div>
        </div>
        </div>
        <Link href="/" aria-label="Valley's Darling home" className="mt-[6.3%] block"><FigmaImage src="/images/figma/landing-13.webp" alt="Valley's Darling" className="aspect-[1304/299]" crop={{width:"113.67%",height:"618.73%",left:"-4.44%",top:"-29.91%"}} /></Link>
      </div>
    </footer>
  );
}
