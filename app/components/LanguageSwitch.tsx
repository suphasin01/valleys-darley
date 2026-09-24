'use client';

import type { Locale } from '../lib/i18n';

export function LanguageSwitch({ locale, light = false }: { locale: Locale; light?: boolean }) {
  const select = (next: Locale) => {
    if (next === locale) return;
    document.cookie = `vd_locale=${next}; path=/; max-age=31536000; samesite=lax${location.protocol === 'https:' ? '; secure' : ''}`;
    window.location.reload();
  };
  return <div role="group" aria-label="Language / ภาษา" className={`inline-flex shrink-0 items-center rounded-full border p-0.5 text-[10px] font-semibold tracking-[0.12em] ${light ? 'border-white/30' : 'border-black/15'}`}>
    {(['en', 'th'] as const).map(option => <button key={option} type="button" onClick={() => select(option)} aria-pressed={locale === option} className={`min-w-6 rounded-full px-1 py-1.5 transition sm:min-w-9 sm:px-2 ${locale === option ? light ? 'bg-white text-black' : 'bg-[#211a16] text-white' : light ? 'text-white/75 hover:text-white' : 'text-black/50 hover:text-black'}`}>{option.toUpperCase()}</button>)}
  </div>;
}
