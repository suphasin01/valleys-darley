import type { Locale } from './i18n';

export async function getLocale(): Promise<Locale> {
  // The storefront is English-only, including visits with a legacy Thai cookie.
  return 'en';
}
