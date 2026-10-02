import { randomUUID } from "node:crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { adminSession } from "../../../lib/admin-auth";
import { cmsStorageReady } from "../../../lib/cms";

const allowedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function validSignature(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte);
  if (type === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function POST(request: Request) {
  if (!await adminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (!cmsStorageReady()) return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File) || !allowedTypes[file.type] || file.size === 0 || file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "Choose a JPG, PNG or WebP image under 4 MB" }, { status: 400 });
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validSignature(bytes, file.type)) return NextResponse.json({ error: "Invalid image file" }, { status: 400 });
    const blob = await put(`products/${randomUUID()}.${allowedTypes[file.type]}`, Buffer.from(bytes), { access: "public", contentType: file.type, addRandomSuffix: false });
    return NextResponse.json({ url: blob.url });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 503 });
  }
}
