"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitch } from "./LanguageSwitch";
import { copy, type Locale } from "../lib/i18n";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <span className={`brand-script whitespace-nowrap ${className}`}>Valley&apos;s Darling</span>;
}

export function Header({ locale }: { locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const t = copy[locale];
  const menuItems = [
    { label: t.shop, href: "/collections" }, { label: t.newIn, href: "/collections#new-in" },
    { label: t.customMade, href: "/custom-made" }, { label: t.about, href: "/#story" },
    { label: t.care, href: "/#care" }, { label: t.contact, href: "/contact" },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 h-[58px] border-b border-black/10 bg-[#fffefa]/95 text-[#17130f] backdrop-blur-md md:h-[72px]">
        <div className="relative mx-auto flex h-full max-w-[1480px] items-center justify-between px-5 md:px-9">
          <button type="button" onClick={() => setIsOpen(true)} aria-label={t.menu} aria-expanded={isOpen} className="grid h-10 w-10 place-items-center">
            <span className="relative block h-3.5 w-5 border-y border-current before:absolute before:left-0 before:top-1/2 before:h-px before:w-3 before:-translate-y-1/2 before:bg-current" />
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2" aria-label="Valley's Darling home">
            <BrandLogo className="text-[20px] sm:text-[25px] md:text-[36px]" />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2"><LanguageSwitch locale={locale} /><Link href="/account" aria-label={t.bag} className="grid h-10 w-10 place-items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.35" aria-hidden="true"><path d="M6.5 8.5h11l-.7 11h-9.6l-.7-11Z" /><path d="M9 9V6.8a3 3 0 0 1 6 0V9" /></svg>
          </Link></div>
        </div>
      </header>

      <div className={`fixed inset-0 z-[80] bg-[#f4e7eb] text-[#17130f] transition duration-500 ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div className={`mx-auto flex h-full max-w-[1480px] flex-col px-6 py-5 transition-transform duration-500 md:px-12 md:py-8 ${isOpen ? "translate-x-0" : "-translate-x-8"}`}>
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setIsOpen(false)} aria-label={t.closeMenu} className="grid h-11 w-11 place-items-center text-3xl font-light">×</button>
            <BrandLogo className="text-[28px] md:text-[42px]" />
            <span className="w-11" />
          </div>
          <nav className="mt-14 flex flex-col items-start gap-4 font-serif text-xl tracking-[0.04em] md:mt-20 md:gap-5 md:text-4xl">
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href} onClick={() => setIsOpen(false)} className="group relative py-1">
                {item.label}<span className="absolute bottom-0 left-0 h-px w-0 bg-current transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>
          <div className="mt-auto border-t border-black/20 pt-5 font-serif text-sm tracking-wide md:flex md:justify-between md:text-lg">
            <div className="flex gap-6"><Link href="/login" onClick={() => setIsOpen(false)}>{t.signIn}</Link><Link href="/account" onClick={() => setIsOpen(false)}>{t.myAccount}</Link></div>
            <Link href="/ar?product=1" onClick={() => setIsOpen(false)} className="mt-4 inline-block md:mt-0">{t.tryOn} ↗</Link>
          </div>
        </div>
      </div>
    </>
  );
}
