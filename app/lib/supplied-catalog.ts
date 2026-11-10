import type { CmsProduct } from './cms';

/** Stable CMS IDs are the contract; imported source slugs are aliases only. */
export const suppliedProducts = {
  'heart-locket': { slug: 'ruffle-heart-locket-necklace', category: 'necklace' },
  'ribbon-earring': { slug: 'pleated-gemstone-ribbon-earrings', category: 'earrings' },
  'pearl-ring': { slug: 'rosette-ribbon-mother-of-pearl-ring', category: 'ring' },
  'swirl-bow': { slug: 'classic-swirl-bow-necklace', category: 'necklace' },
} as const;
export const catalogCategories = {
  necklace: 'Necklace', ring: 'Ring', earrings: 'Earrings', bracelet: 'Bracelet', 'new-in': 'New Arrival', 'be-present': 'Be Present Collection',
} as const;
export function canonicalProductId(id: string) {
  return Object.entries(suppliedProducts).find(([, item]) => item.slug === id)?.[0] || id;
}
export function productCategory(product: CmsProduct) {
  const known = suppliedProducts[product.id as keyof typeof suppliedProducts];
  if (known) return known.category;
  const name = `${product.id} ${product.name}`.toLowerCase();
  if (/earring/.test(name)) return 'earrings';
  if (/bracelet|bangle/.test(name)) return 'bracelet';
  if (/ring/.test(name)) return 'ring';
  if (/necklace|locket|chain/.test(name)) return 'necklace';
  return '';
}
export function productsForCategory(products: CmsProduct[], category?: string) {
  return products.filter(product => product.published && (!category || category === 'new-in' || (category === 'be-present' ? product.id in suppliedProducts : productCategory(product) === category)));
}
export function cmsPriceLabel(product: CmsProduct) {
  const prices = product.variants?.length ? product.variants.filter(variant => Number.isSafeInteger(variant.available) && variant.available > 0 && Number.isFinite(variant.price) && variant.price >= 10 && variant.price <= 999999 && Math.abs(Math.round(variant.price*100)/100-variant.price)<0.00001).map(variant => variant.price) : Number.isSafeInteger(product.priceBaht) && product.priceBaht! >= 10 && product.priceBaht! <= 999999 ? [product.priceBaht!] : [];
  if (!prices.length) return product.variants?.length ? 'Currently unavailable' : 'Enquire about this piece';
  const min = Math.min(...prices), max = Math.max(...prices);
  const format = (amount: number) => `฿${amount.toLocaleString('en-US', {minimumFractionDigits:2,maximumFractionDigits:2})}`;
  return min === max ? format(min) : `${format(min)} – ${format(max)}`;
}
