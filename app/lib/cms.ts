import { list, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";

export type CmsProduct = { id: string; name: string; image: string; link: string; published: boolean };
export type CmsContent = {
  site: { brand: string; description: string };
  home: { heading: string; emphasis: string; ending: string; intro: string; storyHeading: string; storyBody: string };
  customMade: { heading: string; body: string; cta: string };
  contact: { heading: string; body: string; cta: string; url: string };
  products: CmsProduct[];
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
    { id: "ribbon-earring", name: "Pleated Gemstone Ribbon Earring", image: "/images/lifestyle-2.png", link: "/contact", published: true },
    { id: "heart-locket", name: "The Ruffle Heart Locket Necklace", image: "/images/product-closeup-2.png", link: "/contact", published: true },
    { id: "swirl-bow", name: "Classic Swirl Bow Necklace", image: "/images/product-closeup-5.png", link: "/contact", published: true },
    { id: "pearl-ring", name: "Rosette Ribbon Mother of Pearl Ring", image: "/images/ar-ring-silver-v2.png", link: "/ar?product=1", published: true },
    { id: "pearl-chain", name: "Pink Infusion Pearl Chain", image: "/images/product-closeup-4.png", link: "/contact", published: true },
    { id: "pearl-keepsake", name: "Darling Pearl Keepsake", image: "/images/collection-overview.png", link: "/contact", published: true },
  ],
  updatedAt: "",
};

const localFile = path.join(process.cwd(), "data", "cms-content.json");

function normalize(value: Partial<CmsContent>): CmsContent {
  return {
    ...defaultCmsContent,
    ...value,
    site: { ...defaultCmsContent.site, ...value.site },
    home: { ...defaultCmsContent.home, ...value.home },
    customMade: { ...defaultCmsContent.customMade, ...value.customMade },
    contact: { ...defaultCmsContent.contact, ...value.contact },
    products: Array.isArray(value.products) ? value.products.slice(0, 100) : defaultCmsContent.products,
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
