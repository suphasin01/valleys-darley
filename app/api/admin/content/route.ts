import { NextResponse } from "next/server";
import { getCmsContent, saveCmsContent, type CmsContent } from "../../../lib/cms";
import { isAdmin, member } from "../../../lib/auth";

async function authorize() {
  const user = await member();
  return user && isAdmin(user.sub) ? user : null;
}

export async function GET() {
  if (!await authorize()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getCmsContent());
}

export async function PUT(request: Request) {
  if (!await authorize()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  try {
    const content = await request.json() as CmsContent;
    if (!content?.home?.heading || !content?.site?.brand || !Array.isArray(content.products)) return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    return NextResponse.json(await saveCmsContent(content));
  } catch (error) {
    const message = error instanceof Error && error.message === "CMS_STORAGE_NOT_CONFIGURED" ? "Storage not configured" : "Unable to save";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
