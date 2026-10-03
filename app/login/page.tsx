import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member, providerReady, safeMemberNext, type Provider } from '../lib/auth';
import { copy } from '../lib/i18n';
import { getLocale } from '../lib/locale';

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  if (params.next === 'admin') redirect('/admin/login');
  const next = safeMemberNext(params.next);
  if (await member()) redirect(next);
  const providers: { id: Provider; label: string; className: string }[] = [
    { id: 'google', label: 'Google', className: 'border border-black/15 bg-white text-[#2c2221]' },
    { id: 'facebook', label: 'Facebook', className: 'bg-[#1877f2] text-white' },
    { id: 'line', label: 'LINE', className: 'bg-[#06c755] text-white' },
  ];
  const locale = await getLocale();
  const t = copy[locale];
  return <section className="min-h-screen bg-[#f5f3ef] px-5 pb-20 pt-32">
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-black/5 bg-white shadow-xl md:grid-cols-2">
      <div className="flex min-h-64 flex-col justify-between bg-[#deddd8] p-10 md:min-h-[540px]">
        <span className="text-xs tracking-[0.3em]">VALLEY’S DARLEY · MEMBERS</span>
        <div><h1 className="font-serif text-5xl leading-tight">A little closer.<br /><i className="text-black/50">A little more you.</i></h1><p className="mt-6 text-sm leading-7 text-black/60">{t.memberLeft}</p></div>
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-400">{t.memberWelcome}</p>
        <h2 className="mt-4 text-3xl font-semibold">{t.memberTitle}</h2>
        <form action="/api/auth/email" method="post" className="mt-6 space-y-4"><input type="hidden" name="next" value={next} /><label className="block text-sm">{locale === 'th' ? 'อีเมล' : 'Email'}<input name="email" type="email" autoComplete="email" maxLength={254} required className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3" /></label><label className="block text-sm">{locale === 'th' ? 'รหัสผ่าน' : 'Password'}<input name="password" type="password" autoComplete="current-password" maxLength={128} required className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3" /></label><button disabled={!providerReady('email')} className="w-full rounded-xl bg-[#2c2221] px-6 py-4 text-sm text-white disabled:opacity-40">{locale === 'th' ? 'เข้าสู่ระบบด้วยอีเมล' : 'Sign in with email'}</button></form>
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="my-5 text-center text-sm underline">{locale === 'th' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'New here? Create an account'}</Link>
        <p className="mb-8 mt-4 text-sm leading-7 text-gray-500">{t.memberIntro}</p>
        {params.error && <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{params.error === 'configuration' ? t.memberUnavailable : t.memberFailed}</p>}
        <div className="space-y-3">{providers.map(provider => providerReady(provider.id) ? <a key={provider.id} href={`/api/auth/${provider.id}?next=${encodeURIComponent(next)}`} className={`block rounded-xl px-6 py-4 text-center text-sm font-semibold transition-opacity hover:opacity-80 ${provider.className}`}>{provider.id === 'line' ? t.lineSignIn : `${locale === 'th' ? 'ดำเนินการต่อด้วย' : 'Continue with'} ${provider.label}`}</a> : <div key={provider.id} className={`rounded-xl px-6 py-4 text-center text-sm font-semibold opacity-45 ${provider.className}`} aria-disabled="true">{provider.id === 'line' ? t.lineSignIn : `${locale === 'th' ? 'ดำเนินการต่อด้วย' : 'Continue with'} ${provider.label}`}</div>)}</div>
        <p role="status" className="mt-4 text-xs leading-6 text-gray-500">{locale === 'th' ? 'ช่องทางที่แสดงสีจางยังไม่ได้เชื่อมบัญชีผู้ให้บริการ จึงยังใช้งานไม่ได้' : 'Dimmed providers are not configured yet.'}</p>
        <p className="mt-3 text-xs leading-6 text-gray-400">{locale === 'th' ? 'การเข้าสู่ระบบครั้งแรกจะสร้างบัญชีสมาชิกโดยอัตโนมัติ ออเดอร์ผูกกับช่องทางที่ใช้เข้าสู่ระบบ' : 'Your first sign-in creates your account. Orders stay with the sign-in method you used.'}</p>
        <p className="mt-6 text-xs leading-6 text-gray-400">{t.memberPrivacy}</p>
        <Link href="/" className="mt-8 text-sm underline underline-offset-4">{t.backCollection}</Link>
      </div>
    </div>
  </section>;
}
