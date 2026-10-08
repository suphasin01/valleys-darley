import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member, providerReady, safeMemberNext } from '../lib/auth';
import { SocialSignIn, AuthDivider } from '../components/SocialSignIn';
import { copy } from '../lib/i18n';
import { getLocale } from '../lib/locale';

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams;
  if (params.next === 'admin') redirect('/admin/login');
  const next = safeMemberNext(params.next);
  if (await member()) redirect(next);
  const locale = await getLocale();
  const t = copy[locale];
  return <section className="editorial-page bg-white px-5 pb-24 pt-16 text-black md:pb-40 md:pt-32">
    <div className="mx-auto max-w-[626px]">
      <div className="auth-design flex flex-col">
        <h1 className="text-center text-[32px] font-bold">LOG IN</h1>
        <p className="mb-12 mt-8 text-center text-[15px]">please enter your email and password</p>
        <form action="/api/auth/email" method="post" className="mt-6 space-y-4"><input type="hidden" name="next" value={next} /><label className="block text-sm">{locale === 'th' ? 'อีเมล' : 'Email'}<input name="email" type="email" autoComplete="email" maxLength={254} required className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3" /></label><label className="block text-sm">{locale === 'th' ? 'รหัสผ่าน' : 'Password'}<input name="password" type="password" autoComplete="current-password" maxLength={128} required className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3" /></label><button disabled={!providerReady('email')} className="w-full rounded-xl bg-[#2c2221] px-6 py-4 text-sm text-white disabled:opacity-40">{locale === 'th' ? 'เข้าสู่ระบบด้วยอีเมล' : 'Sign in with email'}</button></form>
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="my-5 text-center text-sm underline">{locale === 'th' ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'New here? Create an account'}</Link>
        {params.error && <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{params.error === 'configuration' ? t.memberUnavailable : t.memberFailed}</p>}
        <AuthDivider th={locale === 'th'} />
        <SocialSignIn next={next} th={locale === 'th'} />
        <p role="status" className="mt-4 text-xs leading-6 text-gray-500">{locale === 'th' ? 'ช่องทางที่แสดงสีจางยังไม่ได้เชื่อมบัญชีผู้ให้บริการ จึงยังใช้งานไม่ได้' : 'Dimmed providers are not configured yet.'}</p>
        <p className="mt-3 text-xs leading-6 text-gray-400">{locale === 'th' ? 'การเข้าสู่ระบบครั้งแรกจะสร้างบัญชีสมาชิกโดยอัตโนมัติ ออเดอร์ผูกกับช่องทางที่ใช้เข้าสู่ระบบ' : 'Your first sign-in creates your account. Orders stay with the sign-in method you used.'}</p>
        <p className="mt-6 text-xs leading-6 text-gray-400">{t.memberPrivacy}</p>
        <Link href="/" className="mt-8 text-sm underline underline-offset-4">{t.backCollection}</Link>
      </div>
    </div>
  </section>;
}
