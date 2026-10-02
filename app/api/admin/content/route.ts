import { NextResponse } from "next/server";
import { getCmsContent, saveCmsContent, type CmsContent } from "../../../lib/cms";
import { adminSession } from "../../../lib/admin-auth";

export async function GET() {
  if (!await adminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getCmsContent());
}

export async function PUT(request: Request) {
  if (!await adminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const content = await request.json() as CmsContent;
    if (!content?.home?.heading || !content?.site?.brand || !Array.isArray(content.products) || content.products.length > 100) return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    if (content.products.some(product => {
      if (!/^[a-z0-9-]{1,80}$/.test(product.id) || !product.name?.trim() || typeof product.description !== "string" || typeof product.image !== "string" || typeof product.link !== "string" || (product.priceBaht !== undefined && (!Number.isSafeInteger(product.priceBaht) || product.priceBaht < 10 || product.priceBaht > 999999))) return true;
      const image = product.image;
      const remote = (() => { try { const url = new URL(image); return url.protocol === "https:" && (url.hostname.endsWith(".public.blob.vercel-storage.com") || url.hostname === "images.unsplash.com" || url.hostname.endsWith(".cdninstagram.com")); } catch { return false; } })();
      return !(image.startsWith("/images/") && !image.includes("..") || remote) || !product.link.startsWith("/") || product.link.startsWith("//");
    }) || new Set(content.products.map(product => product.id)).size !== content.products.length) return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    return NextResponse.json(await saveCmsContent(content));
  } catch (error) {
    const message = error instanceof Error && error.message === "CMS_STORAGE_NOT_CONFIGURED" ? "Storage not configured" : "Unable to save";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
