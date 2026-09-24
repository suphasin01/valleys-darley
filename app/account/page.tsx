import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member } from '../lib/auth';
import { copy } from '../lib/i18n';
import { getLocale } from '../lib/locale';
export default async function Account() {
  const user = await member();
  if (!user) redirect('/login');
  const t = copy[await getLocale()];
  return <section className="mx-auto min-h-[70vh] max-w-3xl px-6 pb-20 pt-32"><p className="text-xs tracking-[0.3em] text-gray-400">{t.membership}</p><h1 className="mt-4 text-4xl">{t.hello} {user.name}</h1><div className="my-8 rounded-2xl bg-white p-8 shadow-sm"><p className="text-green-700">{t.lineConnected}</p><p className="mt-3 text-gray-500">{t.welcomeMember}</p><Link className="btn-primary mt-6" href="/ar">{t.tryOn}</Link></div><form action="/api/auth/logout" method="post" className="mt-6"><button className="btn-outline">{t.logOut}</button></form></section>;
}
