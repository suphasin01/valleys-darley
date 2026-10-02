import { list, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Locale } from "./i18n";

export type CmsProduct = { id: string; name: string; description: string; image: string; link: string; published: boolean };
export type CmsContent = {
  site: { brand: string; description: string };
  home: { heading: string; emphasis: string; ending: string; intro: string; storyHeading: string; storyBody: string };
  customMade: { heading: string; body: string; cta: string };
  contact: { heading: string; body: string; cta: string; url: string };
  products: CmsProduct[];
  th: {
    home: { heading: string; emphasis: string; ending: string; intro: string; storyHeading: string; storyBody: string };
    customMade: { heading: string; body: string; cta: string };
    contact: { heading: string; body: string; cta: string };
    products: Record<string, string>;
    productDescriptions: Record<string, string>;
  };
  updatedAt: string;
};

export const defaultCmsContent: CmsContent = {
  site: { brand: "Valley's Darling", description: "Handcrafted jewelry made with love in Bangkok" },
  home: {
    heading: "Keepsakes of",
    emphasis: "wonder",
    ending: "and romance.",
    intro: "Valley's Darling is a piece of your imagination — a valley beloved by us, and by someone like you. In that world, anything is possible.",
    storyHeading: "A little world, made for you.",
    storyBody: "Jewelry crafted by hand in Bangkok. Every piece begins with a feeling, then becomes an object you can keep close.",
  },
  customMade: {
    heading: "Custom Made",
    body: "Our jewelry is available custom made to order, crafted to suit your individual taste rather than a one-size-fits-all approach.\n\nChoose your own colour, size, or add a name engraved on the piece.",
    cta: "CREATE YOURS",
  },
  contact: {
    heading: "Find your Darling.",
    body: "Tell us about the piece you are looking for, your size, material, and the story you want it to carry.",
    cta: "GET IN TOUCH",
    url: "https://www.instagram.com/valleydarley",
  },
  products: [
    { id: "ribbon-earring", name: "Pleated Gemstone Ribbon Earring", description: "A playful ribbon silhouette, finished by hand for the moments you want to remember.", image: "/images/lifestyle-2.png", link: "/contact", published: true },
    { id: "heart-locket", name: "The Ruffle Heart Locket Necklace", description: "A romantic heart locket with delicate ruffled details, made to keep a story close.", image: "/images/product-closeup-2.png", link: "/contact", published: true },
    { id: "swirl-bow", name: "Classic Swirl Bow Necklace", description: "A graceful bow necklace with soft curves and a timeless, personal charm.", image: "/images/product-closeup-5.png", link: "/contact", published: true },
    { id: "pearl-ring", name: "Rosette Ribbon Mother of Pearl Ring", description: "A luminous mother-of-pearl ring framed by a sculptural ribbon setting. Try it on virtually before choosing your piece.", image: "/images/ar-ring-silver-v2.png", link: "/ar?product=1", published: true },
    { id: "pearl-chain", name: "Pink Infusion Pearl Chain", description: "Pearls and gentle pink tones come together in a piece for everyday wonder.", image: "/images/product-closeup-4.png", link: "/contact", published: true },
    { id: "pearl-keepsake", name: "Darling Pearl Keepsake", description: "A cherished pearl-inspired keepsake, thoughtfully made to stay with you.", image: "/images/collection-overview.png", link: "/contact", published: true },
  ],
  th: {
    home: {
      heading: "ของแทนใจแห่ง", emphasis: "ความมหัศจรรย์", ending: "และความรัก",
      intro: "Valley’s Darling คือส่วนหนึ่งของจินตนาการ เป็นโลกใบเล็กที่เรารักและอยากแบ่งปันให้คุณ ที่นี่ทุกความเป็นไปได้เริ่มต้นได้เสมอ",
      storyHeading: "โลกใบเล็กที่สร้างมาเพื่อคุณ", storyBody: "เครื่องประดับทำมือจากกรุงเทพฯ ทุกชิ้นเริ่มจากความรู้สึก ก่อนกลายเป็นสิ่งที่คุณเก็บไว้ใกล้ตัว",
    },
    customMade: { heading: "สั่งทำพิเศษ", body: "เครื่องประดับที่ออกแบบตามความชอบของคุณ ไม่จำกัดอยู่กับรูปแบบสำเร็จรูป\n\nเลือกสี ขนาด หรือสลักชื่อบนชิ้นงานได้", cta: "เริ่มออกแบบ" },
    contact: { heading: "พบชิ้นที่ใช่สำหรับคุณ", body: "บอกเราเกี่ยวกับเครื่องประดับที่คุณตามหา ขนาด วัสดุ และเรื่องราวที่อยากให้ชิ้นงานถ่ายทอด", cta: "ติดต่อเรา" },
    products: {
      "ribbon-earring": "ต่างหูริบบิ้นประดับอัญมณี", "heart-locket": "สร้อยล็อกเก็ตหัวใจระบาย",
      "swirl-bow": "สร้อยโบว์เกลียวคลาสสิก", "pearl-ring": "แหวนมุกโรเซ็ตริบบิ้น",
      "pearl-chain": "สร้อยมุกพิงก์อินฟิวชัน", "pearl-keepsake": "เครื่องประดับมุกดาร์ลิง",
    },
    productDescriptions: {
      "ribbon-earring": "ต่างหูรูปริบบิ้นแสนสดใส เก็บรายละเอียดด้วยมือสำหรับช่วงเวลาที่อยากจดจำ",
      "heart-locket": "ล็อกเก็ตหัวใจแต่งระบายละเอียดอ่อน สำหรับเก็บเรื่องราวไว้ใกล้ตัว",
      "swirl-bow": "สร้อยโบว์โค้งพลิ้วที่เติมเสน่ห์คลาสสิกให้ทุกวัน",
      "pearl-ring": "แหวนมุกเปล่งประกายในตัวเรือนริบบิ้น ลองสวมแบบ AR ก่อนเลือกชิ้นที่ใช่",
      "pearl-chain": "มุกและโทนชมพูอ่อนรวมกันเป็นเครื่องประดับที่ใส่ได้ทุกวัน",
      "pearl-keepsake": "ของแทนใจที่ได้รับแรงบันดาลใจจากมุก สร้างอย่างตั้งใจให้คุณเก็บไว้ใกล้ตัว",
    },
  },
  updatedAt: "",
};

export function localizedContent(content: CmsContent, locale: Locale) {
  return locale === 'th' ? {
    ...content,
    home: { ...content.home, ...content.th.home },
    customMade: { ...content.customMade, ...content.th.customMade },
    contact: { ...content.contact, ...content.th.contact },
    products: content.products.map(product => ({ ...product, name: content.th.products[product.id] || product.name, description: content.th.productDescriptions[product.id] || product.description })),
  } : content;
}

const localFile = path.join(process.cwd(), "data", "cms-content.json");

function normalize(value: Partial<CmsContent>): CmsContent {
  return {
    ...defaultCmsContent,
    ...value,
    site: { ...defaultCmsContent.site, ...value.site },
    home: { ...defaultCmsContent.home, ...value.home },
    customMade: { ...defaultCmsContent.customMade, ...value.customMade },
    contact: { ...defaultCmsContent.contact, ...value.contact },
    products: Array.isArray(value.products) ? value.products.slice(0, 100).map(product => ({ ...product, description: typeof product.description === "string" ? product.description : defaultCmsContent.products.find(item => item.id === product.id)?.description || "" })) : defaultCmsContent.products,
    th: {
      home: { ...defaultCmsContent.th.home, ...value.th?.home },
      customMade: { ...defaultCmsContent.th.customMade, ...value.th?.customMade },
      contact: { ...defaultCmsContent.th.contact, ...value.th?.contact },
      products: { ...defaultCmsContent.th.products, ...value.th?.products },
      productDescriptions: { ...defaultCmsContent.th.productDescriptions, ...value.th?.productDescriptions },
    },
  };
}

export function cmsStorageReady() { return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN); }

export async function getCmsContent(): Promise<CmsContent> {
  try {
    if (cmsStorageReady()) {
      const { blobs } = await list({ prefix: "cms/content.json", limit: 1 });
      if (blobs[0]) {
        const response = await fetch(blobs[0].url, { cache: "no-store" });
        if (response.ok) return normalize(await response.json());
      }
    } else if (process.env.NODE_ENV !== "production") {
      return normalize(JSON.parse(await fs.readFile(localFile, "utf8")));
    }
  } catch { /* Start safely from the checked-in defaults. */ }
  return defaultCmsContent;
}

export async function saveCmsContent(value: CmsContent): Promise<CmsContent> {
  const content = normalize({ ...value, updatedAt: new Date().toISOString() });
  const serialized = JSON.stringify(content, null, 2);
  if (cmsStorageReady()) {
    await put("cms/content.json", serialized, { access: "public", allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 });
  } else if (process.env.NODE_ENV !== "production") {
    await fs.mkdir(path.dirname(localFile), { recursive: true });
    await fs.writeFile(localFile, serialized);
  } else {
    throw new Error("CMS_STORAGE_NOT_CONFIGURED");
  }
  return content;
}
