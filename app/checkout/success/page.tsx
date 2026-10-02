import Link from "next/link";
import { stripeClient } from "../../lib/stripe";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  let paid = false;
  let pending = false;
  let productName = "";
  let total = 0;
  if (sessionId && /^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId) && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await stripeClient().checkout.sessions.retrieve(sessionId);
      if (session.metadata?.source === "valleys-darley") {
        paid = session.payment_status === "paid";
        pending = !paid && session.status === "complete";
        productName = session.metadata.productName || "";
        total = session.amount_total || 0;
      }
    } catch { /* Invalid or unavailable sessions do not imply payment. */ }
  }
  return <main className="flex min-h-[70svh] items-center justify-center bg-[#f1e9eb] px-6 py-20 text-[#261e1c]"><div className="w-full max-w-xl bg-white p-8 text-center shadow-sm md:p-14">
    <p className="text-[10px] uppercase tracking-[.25em]">VALLEY&apos;S DARLING · CHECKOUT</p>
    <h1 className="mt-7 font-serif text-4xl">{paid ? "ชำระเงินสำเร็จ" : pending ? "กำลังยืนยันการชำระเงิน" : "ยังไม่ยืนยันการชำระเงิน"}</h1>
    <p className="mt-5 text-sm leading-7 text-black/60">{paid ? `${productName} · ฿${(total / 100).toLocaleString("th-TH")}` : pending ? "ระบบชำระเงินกำลังประมวลผล กรุณาตรวจอีกครั้งภายหลัง" : "ไม่พบรายการที่ชำระสำเร็จ หากคุณถูกตัดเงินแล้ว โปรดติดต่อเราโดยแจ้งหมายเลขรายการจาก Stripe"}</p>
    {paid && <p className="mt-4 text-xs leading-6 text-black/50">เราจะใช้ข้อมูลจัดส่งที่คุณกรอกใน Stripe Checkout เพื่อติดต่อและดำเนินการคำสั่งซื้อ</p>}
    <div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/collections" className="bg-[#261e1c] px-6 py-3 text-xs text-white">ดูสินค้าอื่น</Link><Link href="/contact" className="border border-[#261e1c] px-6 py-3 text-xs">ติดต่อเรา</Link></div>
  </div></main>;
}
