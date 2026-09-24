import { redirect } from "next/navigation";
import { cmsStorageReady, getCmsContent } from "../lib/cms";
import { adminSession } from "../lib/admin-auth";
import { CmsEditor } from "./CmsEditor";

export default async function Admin() {
  if (!await adminSession()) redirect("/admin/login");
  return <CmsEditor initialContent={await getCmsContent()} storageReady={cmsStorageReady()} />;
}
