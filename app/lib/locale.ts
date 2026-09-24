import { cookies } from 'next/headers';
import { localeCookie, type Locale } from './i18n';

export async function getLocale(): Promise<Locale> {
  return (await cookies()).get(localeCookie)?.value === 'en' ? 'en' : 'th';
}
