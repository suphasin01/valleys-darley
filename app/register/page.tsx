import Link from 'next/link';
import { redirect } from 'next/navigation';
import { member, safeMemberNext } from '../lib/auth';
import { SocialSignIn, AuthDivider } from '../components/SocialSignIn';
import { PrivacyCheckbox } from '../components/PrivacyCheckbox';
import { customerStorageReady, getCustomerProfile } from '../lib/customer-profile';
import { getLocale } from '../lib/locale';

export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function Register({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; edit?: string }> }) {
  const params = await searchParams;
  const next = safeMemberNext(params.next);
  const user = await member();
  const profile = user ? await getCustomerProfile(user) : null;
  if (profile && !params.edit && !params.error) redirect(next);
  const th = await getLocale() === 'th';
  const ready = customerStorageReady();
  const fields = [
    ['name', th ? 'ชื่อ–นามสกุลผู้รับ' : 'Recipient full name', 'name', profile?.name || user?.name || '', 100],
    ['email', th ? 'อีเมลติดต่อ' : 'Contact email', 'email', profile?.email || user?.email || '', 254],
    ['phone', th ? 'เบอร์โทรศัพท์' : 'Phone number', 'tel', profile?.phone || '', 20],
    ['address', th ? 'บ้านเลขที่ / ถนน / หมู่บ้าน' : 'House number / street / building', 'address-line1', profile?.address || '', 250],
    ['subdistrict', th ? 'แขวง / ตำบล' : 'Subdistrict', 'address-level3', profile?.subdistrict || '', 100],
    ['district', th ? 'เขต / อำเภอ' : 'District', 'address-level2', profile?.district || '', 100],
    ['province', th ? 'จังหวัด' : 'Province', 'address-level1', profile?.province || '', 100],
    ['postalCode', th ? 'รหัสไปรษณีย์' : 'Postal code', 'postal-code', profile?.postalCode || '', 5],
  ] as const;
  const input = 'mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#9c7674]';
  return <main className="editorial-page bg-white px-5 py-16 text-black md:py-24"><div className="auth-design mx-auto max-w-[626px]">
    <h1 className="text-center text-[32px] font-bold">{user ? 'Your details & delivery address' : 'SIGN UP'}</h1>
    <p className="mt-4 text-sm leading-7 text-black/55">{th ? 'สมัครผ่านช่องทางที่คุณสะดวก แล้วกรอกข้อมูลผู้รับและที่อยู่ให้ครบ เพื่อใช้ในการสั่งซื้อและจัดส่งสินค้าในประเทศไทย' : 'Choose how to sign up, then complete your recipient details and Thailand delivery address.'}</p>
    {!user && <div className="mt-7"><SocialSignIn next={next} th={th} /><AuthDivider th={th} /><p className="text-center text-sm text-black/55">{th ? 'สมัครด้วยอีเมลและกรอกที่อยู่ด้านล่าง' : 'Register with email and complete your address below'}</p></div>}
    {params.error && <p role="alert" className="mt-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{params.error === 'password' ? th ? 'รหัสผ่านต้องมีอย่างน้อย 12 ตัวอักษร และตรงกันทั้งสองช่อง' : 'Use a password of 12–128 characters and matching confirmation.' : params.error === 'validation' ? th ? 'กรุณากรอกข้อมูลให้ครบ ตรวจอีเมล เบอร์โทรศัพท์ และรหัสไปรษณีย์ 5 หลัก' : 'Please complete all fields with a valid email, Thai phone and 5-digit postal code.' : th ? 'ยังบันทึกไม่ได้ หากใช้อีเมลนี้สมัครแล้วให้เข้าสู่ระบบ หรือลองใหม่ภายหลัง' : 'Unable to save. If this email is already registered, please sign in; otherwise try again later.'}</p>}
    {!ready && <p role="status" className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{th ? 'ระบบลงทะเบียนกำลังเตรียมเปิดให้บริการ' : 'Registration is being prepared. Please check back shortly.'}</p>}
    {params.error === 'privacy' && <p role="alert" className="mt-4 text-sm text-rose-700">{th ? 'กรุณาอ่านและติ๊กรับทราบนโยบายความเป็นส่วนตัวก่อนดำเนินการต่อ' : 'Please read and acknowledge the Privacy Policy before continuing.'}</p>}
    <form action="/api/customer/profile" method="post" className="mt-8"><input type="hidden" name="next" value={next} /><div className="grid gap-5 sm:grid-cols-2">{fields.map(([name, label, autocomplete, value, max]) => <label key={name} className={`text-sm ${name === 'address' ? 'sm:col-span-2' : ''}`}>{label}<input className={input} name={name} type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'} autoComplete={autocomplete} defaultValue={value} maxLength={max} required inputMode={name === 'postalCode' ? 'numeric' : undefined} pattern={name === 'postalCode' ? '[0-9]{5}' : undefined} /></label>)}
    {!user && <><label className="text-sm">{th ? 'รหัสผ่าน (อย่างน้อย 12 ตัวอักษร)' : 'Password (at least 12 characters)'}<input className={input} name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><label className="text-sm">{th ? 'ยืนยันรหัสผ่าน' : 'Confirm password'}<input className={input} name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label></>}
    </div><p className="mt-6 text-xs leading-6 text-black/50">{th ? 'ข้อมูลนี้ใช้เพื่อติดต่อเรื่องคำสั่งซื้อและจัดส่งสินค้า คุณแก้ไขที่อยู่ได้ภายหลังในหน้าบัญชี' : 'These details are used to contact you about orders and arrange delivery. You can update your address in your account.'}</p>{!profile && <PrivacyCheckbox th={th}/>}<button disabled={!ready} className="mt-6 w-full rounded-full bg-[#2c2221] px-6 py-4 text-sm text-white disabled:opacity-40">{th ? user ? 'บันทึกข้อมูลและดำเนินการต่อ' : 'สมัครสมาชิก' : user ? 'Save & continue' : 'Create account'}</button></form>
    <Link href={`/login?next=${encodeURIComponent(next)}`} className="mt-6 block text-center text-sm underline">{th ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'Already a member? Sign in'}</Link>
  </div></main>;
}
