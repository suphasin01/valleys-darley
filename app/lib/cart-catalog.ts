import type { CmsProduct } from './cms';

/** Explicit public DTO: never send drafts or unrelated stored fields to the browser. */
export function publicCartProducts(products: CmsProduct[]): CmsProduct[] {
  return products.filter(product => product.published).map(product => ({
    id: product.id, name: product.name, description: product.description, image: product.image,
    link: product.link, published: true, priceBaht: product.priceBaht,
    variants: product.variants?.map(variant => ({ id: variant.id, sku: variant.sku, label: variant.label, price: variant.price, available: variant.available })),
  }));
}
