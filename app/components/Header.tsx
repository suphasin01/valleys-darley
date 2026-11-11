"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { copy, type Locale } from "../lib/i18n";
import { readCart, requestCartOpen } from '../lib/cart-storage';
import { StoreSearch } from './StoreSearch';
import styles from './Header.module.css';
import { BrandLogo } from './BrandLogo';
import { shopMenuLinks, toggleMenuSection, type MenuSection } from '../lib/store-menu';

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
      <header className={styles.header}>
        <div className={styles.inner}>
          <div className={styles.left}>
          <button ref={menuButton} type="button" onClick={() => { setMenuSection(null); setIsOpen(true); }} aria-label={t.menu} aria-expanded={isOpen} aria-controls="store-navigation" className={styles.control}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            <span className={styles.label}>Menu</span>
          </button>
          <StoreSearch className={styles.control}/>
          </div>
          <Link href={isAdmin ? "/admin" : "/"} className={styles.brand} aria-label={isAdmin ? "Admin home" : "Valley's Darling home"}>
            <BrandLogo className={styles.wordmark} />
          </Link>
          <div className={styles.right}><Link href="/account" className={styles.control} aria-label="My account"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg><span className={styles.label}>Account</span></Link><Link href="/cart" aria-label={`Shopping bag (${cartCount} items)`} aria-haspopup="dialog" aria-controls="store-shopping-bag" onClick={event => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return; if (requestCartOpen()) event.preventDefault(); }} className={styles.control}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg><span className={styles.label}>Bag</span>{cartCount > 0 && <span className={styles.count} aria-hidden="true">{cartCount}</span>}
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
        <div className={`${styles.menuPanel} store-navigation-panel absolute bottom-0 left-0 flex flex-col overflow-y-auto bg-[#f1e9eb] transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
