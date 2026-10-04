import type { CmsProduct } from "./cms";

// Replace only the original demo photographs; a CMS-uploaded photo always wins.
const photographs: Record<string, [string, string]> = {
  "ribbon-earring": ["/images/lifestyle-2.png", "/images/figma/product-2.webp"],
  "heart-locket": ["/images/product-closeup-2.png", "/images/figma/product-1.webp"],
  "swirl-bow": ["/images/product-closeup-5.png", "/images/figma/product-3.webp"],
  "pearl-ring": ["/images/ar-ring-silver-v2.png", "/images/figma/product-0.webp"],
};
export function editorialImage(product: CmsProduct) {
  const source = photographs[product.id];
  return source && source[0] === product.image ? source[1] : product.image;
}
