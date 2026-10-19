import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member, providerReady, safeMemberNext } from '../lib/auth';
import { SocialSignIn, AuthDivider } from '../components/SocialSignIn';
import { copy } from '../lib/i18n';
import { getLocale } from '../lib/locale';
import { AuthTitle } from '../components/AuthTitle';

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
        <AuthTitle>LOG IN</AuthTitle>
        <p className="mb-10 mt-6 text-center text-[15px]">please enter your email and password</p>
        <form action="/api/auth/email" method="post" className="email-sign-in space-y-6"><input type="hidden" name="next" value={next} /><label className="block text-sm">{locale === 'th' ? 'อีเมล' : 'Email'}<input name="email" type="email" autoComplete="email" maxLength={254} required className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3" /></label><label className="block text-sm">{locale === 'th' ? 'รหัสผ่าน' : 'Password'}<input name="password" type="password" autoComplete="current-password" maxLength={128} required className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3" /></label><button disabled={!providerReady('email')} className="min-h-16 w-full rounded-xl bg-[#2c2221] px-6 py-4 text-sm text-white disabled:opacity-40">{locale === 'th' ? 'เข้าสู่ระบบด้วยอีเมล' : 'Log in'}</button></form>
        <p className="mb-1 mt-4 text-sm">Don’t have an account? <Link href={`/register?next=${encodeURIComponent(next)}`} className="underline underline-offset-2">Sign up</Link></p>
        <details className="mb-3 text-sm"><summary className="w-fit cursor-pointer list-none underline underline-offset-2">Forgot password?</summary><div className="mt-3 border-l border-black/20 pl-4 text-xs leading-6 text-black/65"><p>For Google or LINE sign-in, continue with the same provider below. We never ask for your social password.</p><p>For help accessing an email account, <Link href="/help#contact" className="underline">contact the store</Link>. Do not send your password or payment details. No reset email is sent from this page.</p></div></details>
        {params.error && <p role="alert" className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{params.error === 'configuration' ? t.memberUnavailable : t.memberFailed}</p>}
        <AuthDivider th={locale === 'th'} />
        <SocialSignIn next={next} th={locale === 'th'} />
        {(!providerReady('google') || !providerReady('line')) && <p role="status" className="mt-4 text-xs leading-6 text-gray-500">{locale === 'th' ? 'ช่องทางที่แสดงสีจางยังไม่ได้เชื่อมบัญชีผู้ให้บริการ จึงยังใช้งานไม่ได้' : 'Dimmed providers are not configured yet.'}</p>}
        <p className="mt-3 text-xs leading-6 text-gray-400">{locale === 'th' ? 'การเข้าสู่ระบบครั้งแรกจะสร้างบัญชีสมาชิกโดยอัตโนมัติ ออเดอร์ผูกกับช่องทางที่ใช้เข้าสู่ระบบ' : 'Your first sign-in creates your account. Orders stay with the sign-in method you used.'}</p>
        <p className="mt-6 text-xs leading-6 text-gray-400">{t.memberPrivacy}</p>
        <Link href="/" className="mt-8 text-sm underline underline-offset-4">{t.backCollection}</Link>
      </div>
    </div>
  </section>;
}
