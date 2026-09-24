import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member, ready } from '../lib/auth';
import { copy } from '../lib/i18n';
import { getLocale } from '../lib/locale';

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  if (params.next === 'admin') redirect('/admin/login');
  if (await member()) redirect('/account');
  const enabled = ready();
  const t = copy[await getLocale()];
  return <section className="min-h-screen bg-[#f5f3ef] px-5 pb-20 pt-32">
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-black/5 bg-white shadow-xl md:grid-cols-2">
      <div className="flex min-h-64 flex-col justify-between bg-[#deddd8] p-10 md:min-h-[540px]">
        <span className="text-xs tracking-[0.3em]">VALLEY’S DARLEY · MEMBERS</span>
        <div><h1 className="font-serif text-5xl leading-tight">A little closer.<br /><i className="text-black/50">A little more you.</i></h1><p className="mt-6 text-sm leading-7 text-black/60">{t.memberLeft}</p></div>
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">{t.memberWelcome}</p>
        <h2 className="mt-4 text-3xl font-semibold">{t.memberTitle}</h2>
        <p className="mb-8 mt-4 text-sm leading-7 text-gray-500">{t.memberIntro}</p>
        {params.error && <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{params.error === 'configuration' ? t.memberUnavailable : t.memberFailed}</p>}
        {enabled ? <a href="/api/auth/line" className="rounded-xl bg-[#06c755] px-6 py-4 text-center font-semibold text-white hover:bg-[#05b34c]">{t.lineSignIn}</a> : <><button disabled className="rounded-xl bg-[#06c755]/40 px-6 py-4 font-semibold text-white">{t.lineSignIn}</button><p role="status" className="mt-4 text-sm text-gray-500">{t.memberPreparing}</p></>}
        <p className="mt-6 text-xs leading-6 text-gray-400">{t.memberPrivacy}</p>
        <Link href="/" className="mt-8 text-sm underline underline-offset-4">{t.backCollection}</Link>
      </div>
    </div>
  </section>;
}
