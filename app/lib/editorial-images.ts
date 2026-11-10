import type { CmsProduct } from "./cms";

// Replace only the original demo photographs; a CMS-uploaded photo always wins.
const photographs: Record<string, [string, string]> = {
  "ribbon-earring": ["/images/lifestyle-2.png", "/assets/products/pleated-gemstone-ribbon-earrings/light-pink/01.jpg"],
  "heart-locket": ["/images/product-closeup-2.png", "/assets/products/ruffle-heart-locket-necklace/01.jpg"],
  "swirl-bow": ["/images/product-closeup-5.png", "/assets/products/classic-swirl-bow-necklace/green-amethyst/01.jpg"],
  "pearl-ring": ["/images/ar-ring-silver-v2.png", "/assets/products/rosette-ribbon-mother-of-pearl-ring/default/01.jpg"],
};
export function editorialImage(product: CmsProduct) {
  const source = photographs[product.id];
  return source && source[0] === product.image ? source[1] : product.image;
}

export function editorialGallery(product: CmsProduct) {
  const original = photographs[product.id]?.[0] === product.image;
  const first = editorialImage(product);
  const folders: Record<string,string> = {
    'heart-locket':'ruffle-heart-locket-necklace',
    'swirl-bow':'classic-swirl-bow-necklace/green-amethyst',
    'ribbon-earring':'pleated-gemstone-ribbon-earrings/light-pink',
    'pearl-ring':'rosette-ribbon-mother-of-pearl-ring/shared',
  };
  const supplied = original && folders[product.id] ? Array.from({length:6},(_,index)=>`/assets/products/${folders[product.id]}/${String(index+2).padStart(2,'0')}.jpg`) : [];
  const extra = product.images?.length ? product.images : supplied;
  return Array.from(new Set([first, ...extra]));
}

const shopPhotographs: Record<string, [string, string]> = {
  'heart-locket': ['/images/product-closeup-2.png', '/assets/products/ruffle-heart-locket-necklace/card.jpg'],
  'ribbon-earring': ['/images/lifestyle-2.png', '/assets/products/pleated-gemstone-ribbon-earrings/card.jpg'],
  'pearl-ring': ['/images/ar-ring-silver-v2.png', '/assets/products/rosette-ribbon-mother-of-pearl-ring/card.jpg'],
  'swirl-bow': ['/images/product-closeup-5.png', '/assets/products/classic-swirl-bow-necklace/card.jpg'],
};
export function catalogArtwork(product: CmsProduct) {
  const original = shopPhotographs[product.id];
  const unchanged = original?.[0] === product.image;
  const primary = unchanged ? original[1] : editorialImage(product);
  const suppliedHover = product.images?.find(image => image !== primary && image !== product.image);
  // Only this original hover photograph has been verified against the live Preview.
  const hover = suppliedHover || (unchanged ? editorialGallery(product)[1] : undefined);
  return { primary, hover };
}
