import Link from 'next/link';
import { getLocale } from '../lib/locale';

export const metadata = { title: "Privacy Policy | Valley's Darling" };
export default async function Privacy() {
  const th = await getLocale() === 'th';
  const sections = th ? [
    ['ข้อมูลที่เราเก็บ', 'Valley’s Darling เก็บชื่อ อีเมล เบอร์โทร ที่อยู่จัดส่ง และข้อมูลคำสั่งซื้อ เมื่อสมัครผ่าน Google, LINE หรือ Facebook เราใช้รหัสบัญชี ชื่อ และอีเมลที่บริการนั้นอนุญาตให้ส่ง เพื่อยืนยันตัวตน เราไม่ขอรหัสผ่านบัญชีโซเชียล ไม่อ่านอีเมล Gmail และไม่เข้าถึงแชทหรือรายชื่อเพื่อน'],
    ['การใช้ข้อมูล', 'ใช้เพื่อสร้างบัญชี ยืนยันตัวตน จัดการคำสั่งซื้อ ชำระเงิน จัดส่ง ติดตามพัสดุ และตอบคำถามเรื่องการสั่งซื้อ ที่อยู่ต้องกรอกเองแม้สมัครผ่านโซเชียล เราไม่ขายข้อมูลลูกค้าและไม่ใช้ข้อมูล Google เพื่อโฆษณา'],
    ['ผู้ให้บริการที่เกี่ยวข้อง', 'เว็บไซต์และข้อมูลจัดเก็บผ่าน Vercel การชำระเงินดำเนินการผ่าน Stripe ซึ่งรับข้อมูลการชำระเงินโดยตรง ร้านไม่จัดเก็บหมายเลขบัตรเต็มหรือรหัส CVV ข้อมูลที่จำเป็นต่อการจัดส่งอาจส่งให้ผู้ให้บริการขนส่ง ผู้ให้บริการเหล่านี้อาจประมวลผลข้อมูลนอกประเทศไทย'],
    ['ความปลอดภัยและคุกกี้', 'ข้อมูลโปรไฟล์จัดเก็บแบบเข้ารหัส รหัสผ่านเว็บเก็บเป็นค่าแฮช คุกกี้ใช้เพื่อเข้าสู่ระบบ ป้องกันการปลอมคำขอ และจำภาษาที่เลือก การออกจากระบบจะยกเลิกคุกกี้เซสชันในเบราว์เซอร์'],
    ['การเก็บรักษาและสิทธิของคุณ', 'เก็บข้อมูลเท่าที่จำเป็นสำหรับบัญชี คำสั่งซื้อ การช่วยเหลือ และข้อผูกพันที่เกี่ยวข้อง คุณแก้ไขที่อยู่ในหน้าบัญชี และติดต่อร้านเพื่อขอเข้าถึง แก้ไข หรือลบข้อมูลได้ เราจะตรวจสอบตัวตนก่อนดำเนินการ ข้อมูลคำสั่งซื้อบางส่วนอาจต้องเก็บเพื่อข้อผูกพันทางบัญชีหรือข้อพิพาท'],
    ['ติดต่อและขอลบข้อมูล', 'ส่งคำขอไปที่ valleydarley@gmail.com โดยระบุช่องทางที่ใช้สมัครและอีเมลติดต่อ ไม่ต้องส่งรหัสผ่านหรือข้อมูลบัตร การยกเลิกสิทธิใน Google/LINE/Facebook ไม่ได้ลบข้อมูลคำสั่งซื้อที่ร้านเก็บไว้โดยอัตโนมัติ โปรดติดต่อร้านเพื่อดำเนินการ'],
  ] : [
    ['Information collected', 'Valley’s Darling collects your name, email, telephone, delivery address and order information. Social sign-in uses the account identifier, name and email made available by Google, LINE or Facebook. We do not request your social password or read Gmail messages, chats or friend lists.'],
    ['How information is used', 'Information supports accounts, authentication, orders, payment, shipping, parcel tracking and customer support. You must supply a delivery address even with social sign-in. We do not sell customer information or use Google user data for advertising.'],
    ['Service providers', 'Vercel hosts the website and stored data. Stripe processes payment details directly; the store does not retain full card numbers or CVV. Necessary delivery information may be shared with shipping providers. These services may process information outside Thailand.'],
    ['Security and cookies', 'Stored profiles are encrypted and website passwords are hashed. Cookies support sign-in, request protection and your language preference. Signing out clears the browser session cookie.'],
    ['Retention and your choices', 'Information is retained as needed for your account, orders, support and applicable obligations. Edit delivery details in your account or contact us to request access, correction or deletion. We verify identity before acting. Certain order records may need to be retained for accounting obligations or disputes.'],
    ['Contact and deletion requests', 'Email valleydarley@gmail.com with your sign-in method and contact email. Do not send passwords or card details. Revoking Google, LINE or Facebook access does not automatically delete order records retained by the store; contact us to request deletion.'],
  ];
  return <main className="bg-[#f5f0ed] px-6 py-16 text-[#2c2221]"><article className="mx-auto max-w-3xl rounded-3xl bg-white p-7 md:p-12"><p className="text-xs tracking-widest">VALLEY’S DARLING</p><h1 className="mt-4 font-serif text-4xl">{th ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}</h1><p className="mt-4 text-sm text-black/50">{th ? 'ปรับปรุงล่าสุด 3 ตุลาคม 2569' : 'Last updated 3 October 2026'}</p>{sections.map(([title, body]) => <section key={title} className="mt-8"><h2 className="text-xl">{title}</h2><p className="mt-3 text-sm leading-7 text-black/65">{body}</p></section>)}<Link href="/register" className="mt-10 inline-block underline">{th ? 'กลับไปสมัครสมาชิก' : 'Back to registration'}</Link></article></main>;
}
