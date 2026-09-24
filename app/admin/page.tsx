import Link from "next/link";
import { redirect } from "next/navigation";
import { cmsStorageReady, getCmsContent } from "../lib/cms";
import { isAdmin, member } from "../lib/auth";
import { CmsEditor } from "./CmsEditor";

export default async function Admin() {
  const user = await member();
  if (!user) redirect("/login?next=admin");
  if (!isAdmin(user.sub)) return <section className="min-h-[70vh] px-6 pt-32 text-center"><h1 className="text-3xl">บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ</h1><p className="my-6">กรุณาติดต่อผู้ดูแลเพื่อขอสิทธิ์</p><Link href="/account" className="underline">กลับบัญชีสมาชิก</Link></section>;
  return <CmsEditor initialContent={await getCmsContent()} storageReady={cmsStorageReady()} />;
}
