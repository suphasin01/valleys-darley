"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { copy, type Locale } from "../lib/i18n";

export function BrandLogo({ className = "" }: { className?: string }) {
  return <span className={`brand-script inline-block whitespace-nowrap ${className}`}><img src="/images/figma/brand-hd.png" alt="Valley's Darling" width={1291} height={259} className="block h-[1.2em] w-[8.2em] max-w-full object-contain" /></span>;
}

export function Header({ locale }: { locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const t = copy[locale];
  const menuItems = [
    { label: t.shop, href: "/collections" }, { label: t.newIn, href: "/collections#new-in" },
    { label: t.customMade, href: "/custom-made" }, { label: t.about, href: "/about" },
    { label: t.care, href: "/contact" }, { label: t.contact, href: "/contact" },
    { label: locale === 'th' ? 'คำสั่งซื้อของฉัน' : 'My orders', href: '/orders' },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    if (isOpen) menuPanel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      document.body.style.overflow = "";
      if (isOpen) menuButton.current?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <header className="editorial-page sticky top-0 z-50 h-[64px] border-b border-black/60 bg-white text-black md:h-[9.3vw] md:max-h-[134px]">
        <div className="relative mx-auto flex h-full max-w-[1480px] items-center justify-between gap-2 px-3 sm:px-5 md:px-9">
          <button ref={menuButton} type="button" onClick={() => setIsOpen(true)} aria-label={t.menu} aria-expanded={isOpen} aria-controls="store-navigation" className="grid h-11 min-w-11 place-items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 xl:ml-7 xl:justify-items-start">
            <span className="relative block h-3.5 w-5 border-y border-current before:absolute before:left-0 before:top-1/2 before:h-px before:w-3 before:-translate-y-1/2 before:bg-current xl:hidden" />
            <span className="hidden text-[clamp(1rem,2.5vw,2.25rem)] font-medium xl:block">{locale === 'th' ? 'เมนู' : 'menu'}</span>
          </button>
          <Link href={isAdmin ? "/admin" : "/"} className="min-w-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2" aria-label={isAdmin ? "Admin home" : "Valley's Darling home"}>
            <BrandLogo className="text-[16px] min-[375px]:text-[20px] sm:text-[25px] md:text-[clamp(2rem,4.44vw,4rem)]" />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 xl:gap-5"><Link href="/account" className="hidden text-[clamp(1rem,2.22vw,2rem)] font-medium lg:block">{locale === 'th' ? 'บัญชี' : 'account'}</Link><Link href="/account" aria-label={t.bag} className="grid h-11 w-11 place-items-center">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.35" aria-hidden="true"><path d="M6.5 8.5h11l-.7 11h-9.6l-.7-11Z" /><path d="M9 9V6.8a3 3 0 0 1 6 0V9" /></svg>
          </Link></div>
        </div>
      </header>

      <div ref={menuPanel} id="store-navigation" role="dialog" aria-modal={isOpen ? true : undefined} aria-label={t.menu} aria-hidden={!isOpen} onKeyDown={(event) => {
        if (event.key === 'Escape') setIsOpen(false);
        if (event.key !== 'Tab') return;
        const controls = menuPanel.current?.querySelectorAll<HTMLElement>('button, a[href]');
        const first = controls?.[0]; const last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }} className={`fixed inset-0 z-[80] overflow-y-auto bg-[#f4e7eb] text-[#17130f] transition duration-500 ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
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
