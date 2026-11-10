"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { copy, type Locale } from "../lib/i18n";
import { readCart, requestCartOpen } from '../lib/cart-storage';
import { StoreSearch } from './StoreSearch';
import { shopMenuLinks, toggleMenuSection, type MenuSection } from '../lib/store-menu';

export function BrandLogo({ className = "" }: { className?: string }) {
  return <span className={`brand-script supplied-brand inline-block whitespace-nowrap ${className}`}>Valley&apos;s Darling</span>;
}

export function Header({ locale }: { locale: Locale }) {
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    const update = () => setCartCount(readCart().reduce((sum,item)=>sum+item.quantity,0));
    update(); window.addEventListener('valleys-cart-change',update); window.addEventListener('storage',update);
    return () => {window.removeEventListener('valleys-cart-change',update);window.removeEventListener('storage',update);};
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [menuSection, setMenuSection] = useState<MenuSection>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const t = copy[locale];
  const menuItems = [
    { label: t.customMade, href: "/custom-made" }, { label: t.about, href: "/about" },
    { label: t.help, href: "/help" },
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
      <header className="editorial-page supplied-header sticky top-0 z-50 border-b border-black/60 bg-white text-black">
        <div className="supplied-header-inner">
          <div className="supplied-header-left">
          <button ref={menuButton} type="button" onClick={() => { setMenuSection(null); setIsOpen(true); }} aria-label={t.menu} aria-expanded={isOpen} aria-controls="store-navigation" className="grid h-11 min-w-11 place-items-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 xl:ml-7 xl:justify-items-start">
            <span className="relative block h-3.5 w-5 border-y border-current before:absolute before:left-0 before:top-1/2 before:h-px before:w-3 before:-translate-y-1/2 before:bg-current xl:hidden" />
            <span className="hidden text-[clamp(1rem,2.5vw,2.25rem)] font-medium xl:block">{locale === 'th' ? 'เมนู' : 'menu'}</span>
          </button>
          <StoreSearch />
          </div>
          <Link href={isAdmin ? "/admin" : "/"} className="supplied-header-brand min-w-0" aria-label={isAdmin ? "Admin home" : "Valley's Darling home"}>
            <BrandLogo className="text-[16px] min-[375px]:text-[20px] sm:text-[25px] md:text-[clamp(2rem,4.44vw,4rem)]" />
          </Link>
          <div className="supplied-header-right"><Link href="/account">{locale === 'th' ? 'บัญชี' : 'account'}</Link><Link href="/cart" aria-label={`Shopping bag (${cartCount} items)`} aria-haspopup="dialog" aria-controls="store-shopping-bag" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return; if (requestCartOpen()) event.preventDefault(); }} className="supplied-cart-button">
            <span>cart ({cartCount})</span>
          </Link></div>
        </div>
      </header>

      <div ref={menuPanel} id="store-navigation" role="dialog" aria-modal={isOpen ? true : undefined} aria-label={t.menu} aria-hidden={!isOpen} onKeyDown={(event) => {
        if (event.key === 'Escape') setIsOpen(false);
        if (event.key !== 'Tab') return;
        const controls = Array.from(menuPanel.current?.querySelectorAll<HTMLElement>('button, a[href]') || []).filter(el => el.getClientRects().length > 0);
        const first = controls?.[0]; const last = controls?.[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }} className={`editorial-page store-navigation fixed inset-0 z-[80] text-black transition-opacity duration-300 ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <button type="button" onClick={() => setIsOpen(false)} aria-label={t.closeMenu} className="absolute inset-0 h-full w-full bg-black/25" />
        <div className={`store-navigation-panel absolute bottom-0 left-0 flex flex-col overflow-y-auto bg-[#f1e9eb] transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <nav aria-label="Main navigation" className="py-10 text-2xl leading-[1.5]">
            <button type="button" aria-expanded={menuSection === 'shop'} aria-controls="shop-navigation" onClick={() => setMenuSection(current => toggleMenuSection(current, 'shop'))} className={`block min-h-11 w-full border-y px-10 py-1.5 text-left hover:bg-white focus-visible:bg-white ${menuSection === 'shop' ? 'border-black/50 bg-white font-semibold' : 'border-transparent'}`}>{t.shop}</button>
            <div id="shop-navigation" hidden={menuSection !== 'shop'}>{shopMenuLinks.map(([label, href]) => <Link key={label} href={href} onClick={() => setIsOpen(false)} className="block min-h-10 px-10 py-1 text-lg hover:bg-white focus-visible:bg-white">{label}</Link>)}</div>
            <button type="button" aria-expanded={menuSection === 'collection'} aria-controls="collection-navigation" onClick={() => setMenuSection(current => toggleMenuSection(current, 'collection'))} className={`block min-h-11 w-full border-y px-10 py-1.5 text-left hover:bg-white focus-visible:bg-white ${menuSection === 'collection' ? 'border-black/50 bg-white font-semibold' : 'border-transparent'}`}>COLLECTION</button>
            <div id="collection-navigation" hidden={menuSection !== 'collection'}><Link href="/collections/be-present" onClick={() => setIsOpen(false)} className="block min-h-10 px-10 py-1 text-lg hover:bg-white focus-visible:bg-white">BE PRESENT</Link></div>
            {menuItems.map(item => <div key={item.href}>
              <Link href={item.href} onClick={() => setIsOpen(false)} className="block px-10 py-1.5 hover:bg-white focus-visible:bg-white">{item.label}</Link>
            </div>)}
          </nav>
          <div className="mt-auto px-4 pb-3 pt-10 text-base">
            <Link href="/login" onClick={() => setIsOpen(false)} className="block w-fit underline underline-offset-4">LOG IN</Link>
            <p className="mt-2 text-sm">CURRENCY : THB</p>
            <Link href="/" aria-label="Valley's Darling home" onClick={() => setIsOpen(false)} className="mt-3 block"><BrandLogo className="bg-[#f1e9eb] text-[clamp(24px,3.4vw,54px)]" /></Link>
          </div>
        </div>
      </div>
    </>
  );
}
