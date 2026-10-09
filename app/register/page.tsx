import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member, safeMemberNext } from '../lib/auth';
import { SocialSignIn, AuthDivider } from '../components/SocialSignIn';
import { PrivacyCheckbox } from '../components/PrivacyCheckbox';
import { customerStorageReady, getCustomerProfile, preferencesVersion } from '../lib/customer-profile';

export const dynamic = 'force-dynamic';
export const metadata = { title: "Sign up | Valley's Darling", robots: { index: false, follow: false } };
export default async function Register({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; edit?: string }> }) {
  const params = await searchParams;
  const next = safeMemberNext(params.next);
  const user = await member();
  const profile = user ? await getCustomerProfile(user) : null;
  if (profile && !params.edit && !params.error) redirect(next);
  const ready = customerStorageReady();
  const fields = [
    ['phone', 'Phone number', 'tel', profile?.phone || '', 20],
    ['address', 'House number / street / building', 'address-line1', profile?.address || '', 250],
    ['subdistrict', 'Subdistrict', 'address-level3', profile?.subdistrict || '', 100],
    ['district', 'District', 'address-level2', profile?.district || '', 100],
    ['province', 'Province', 'address-level1', profile?.province || '', 100],
    ['postalCode', 'Postal code', 'postal-code', profile?.postalCode || '', 5],
  ] as const;
  const input = 'mt-2 min-h-11 w-full rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 font-sans text-base outline-none focus:border-[#9c7674] focus:ring-1 focus:ring-[#9c7674]';
  const messages: Record<string, string> = {
    password: 'Use a password of 12–128 characters and matching confirmation.',
    validation: 'Please complete all fields with a valid email, Thai phone and 5-digit postal code.',
    privacy: 'Please acknowledge the Privacy Policy before continuing.',
    configuration: 'Registration is being prepared. Please check back shortly.',
    save: 'Unable to save. If this email is already registered, please sign in; otherwise try again later.',
  };
  return <main className="editorial-page signup-page bg-white px-5 pb-24 pt-16 text-black md:pb-40 md:pt-24"><div className="mx-auto max-w-[626px]">
    <header className="text-center"><h1 className="text-[32px] font-semibold">{user ? 'YOUR DETAILS' : 'SIGN UP'}</h1><p className="mt-4 text-[15px]">{user ? 'your contact information and delivery address' : 'please fill in the information below'}</p></header>
    {params.error && <p role="alert" className="mt-8 rounded-lg bg-rose-50 p-4 text-sm text-rose-800">{messages[params.error] || messages.save}</p>}
    {!ready && <p role="status" className="mt-8 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{messages.configuration}</p>}
    <form action="/api/customer/profile" method="post" className="mt-12 space-y-6">
      <input type="hidden" name="next" value={next} />
      {user ? <label className="block text-xl">Recipient full name<input className={input} name="name" autoComplete="name" defaultValue={profile?.name || user.name} maxLength={100} required /></label> : <>
        <label className="block text-xl">First name<input className={input} name="firstName" autoComplete="given-name" maxLength={50} required /></label>
        <label className="block text-xl">Last name<input className={input} name="lastName" autoComplete="family-name" maxLength={49} required /></label>
      </>}
      <label className="block text-xl">Email<input className={input} name="email" type="email" autoComplete="email" defaultValue={profile?.email || user?.email || ''} maxLength={254} required /></label>
      {!user && <>
        <label className="block text-xl">Password<input className={input} name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} aria-describedby="signup-password-hint" required /><span id="signup-password-hint" className="mt-2 block text-xs text-black/55">At least 12 characters.</span></label>
        <label className="block text-xl">Confirm password<input className={input} name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>
      </>}
      <label className="block pt-6 text-xl">Birth date<input className={input} name="birthDate" type="date" autoComplete="bday" min="1900-01-01" max={new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Bangkok'})} defaultValue={profile?.birthDate || ''} /><span className="sr-only">Optional</span></label>
      <input type="hidden" name="preferencesVersion" value={preferencesVersion} />
      <div className="mx-auto max-w-[500px] space-y-5 py-3 text-[13px] leading-[1.5]">
        <label className="flex cursor-pointer items-start gap-4"><input type="checkbox" name="marketingConsent" value="yes" defaultChecked={profile?.preferences?.marketing || false} className="mt-1 h-4 w-4 shrink-0 accent-[#9c7674]" /><span>I agree that Valley’s Darling may collect my personal information for marketing purposes (newsletters, updates and collection arrivals etc.).</span></label>
        <label className="flex cursor-pointer items-start gap-4"><input type="checkbox" name="personalizationConsent" value="yes" defaultChecked={profile?.preferences?.personalization || false} className="mt-1 h-4 w-4 shrink-0 accent-[#9c7674]" /><span>I consent to the processing of my personal data by Valley’s Darling for customer satisfaction purposes and for customizing my user experience to my interests or my shopping habits.</span></label>
        <p className="text-xs text-black/50">Both choices are optional. You can change them in your account.</p>
      </div>
      <fieldset className="border-t border-black/15 pt-8"><legend className="px-2 text-xl">Delivery address</legend><p className="mb-6 mt-2 text-sm text-black/55">For orders delivered within Thailand. You can update this later.</p><div className="grid gap-6 sm:grid-cols-2">{fields.map(([name,label,autocomplete,value,max]) => <label key={name} className={`block text-xl ${name === 'phone' || name === 'address' ? 'sm:col-span-2' : ''}`}>{label}<input className={input} name={name} type={name === 'phone' ? 'tel' : 'text'} autoComplete={autocomplete} defaultValue={value} maxLength={max} required inputMode={name === 'postalCode' ? 'numeric' : undefined} pattern={name === 'postalCode' ? '[0-9]{5}' : undefined} /></label>)}</div></fieldset>
      {!profile && <PrivacyCheckbox th={false} />}
      <button type="submit" disabled={!ready} className="min-h-14 w-full rounded-lg bg-[#f1e9eb] px-8 py-4 text-xl font-semibold text-[#272425] transition hover:bg-[#e6d6dd] disabled:opacity-40">{user ? 'SAVE & CONTINUE' : 'CREATE ACCOUNT'}</button>
    </form>
    {!user && <><AuthDivider th={false}/><SocialSignIn next={next} th={false}/><p className="mt-4 text-xs leading-6 text-black/50">Using Google or LINE? Complete your delivery details after sign-in.</p></>}
    <p className="mt-8 text-base">Already have an account? <Link href={`/login?next=${encodeURIComponent(next)}`} className="underline underline-offset-4">Log in</Link></p>
  </div></main>;
}
