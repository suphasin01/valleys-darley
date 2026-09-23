import Link from "next/link";
import { BrandLogo } from "./Header";

const groups = [
  { title: "SHOP", links: [["NEW IN", "/collections#new-in"], ["JEWELRY", "/collections"], ["CUSTOM MADE", "/custom-made"], ["ARCHIVE", "/collections#archive"]] },
  { title: "HELP", links: [["CONTACT US", "/contact"], ["ORDER & SHIPPING", "/account"], ["MATERIALS & CARE", "/#care"], ["RETURNS", "/contact"]] },
  { title: "ABOUT US", links: [["WHERE TO FIND US", "/contact"], ["OUR STORY", "/#story"], ["JOURNAL", "/#story"]] },
];

export function Footer() {
  return (
    <footer className="bg-[#fffefa] px-6 py-12 text-[#211a16] md:px-12 md:py-16">
      <div className="mx-auto max-w-[1280px]">
        <BrandLogo className="text-4xl md:text-6xl" />
        <p className="mt-2 text-[9px] uppercase tracking-[0.12em]">Handcrafted with love and devotion based in Bangkok, Thailand</p>
        <div className="mt-10 grid grid-cols-2 gap-8 text-[10px] md:grid-cols-4 md:text-xs">
          {groups.map((group) => <div key={group.title}><h3 className="mb-4 font-serif font-semibold">{group.title}</h3><ul className="space-y-2.5">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:underline">{label}</Link></li>)}</ul></div>)}
          <div><h3 className="mb-4 font-serif font-semibold">LEGAL</h3><p>PRIVACY POLICY</p><p className="mt-2">© {new Date().getFullYear()} VALLEY&apos;S DARLING</p></div>
        </div>
      </div>
    </footer>
  );
}
