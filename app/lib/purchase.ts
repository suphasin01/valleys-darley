import type { CmsProduct } from './cms';

export function purchaseSelection(product: CmsProduct, variantId: string | undefined, quantity: number) {
  if (!product.published || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) return null;
  if (product.variants?.length) {
    const variant = product.variants?.find(v=>String(v.id)===variantId);
    if (!variant || !Number.isSafeInteger(variant.available) || variant.available < quantity) return null;
    const amount = Math.round(variant.price * 100);
    if (!Number.isFinite(variant.price) || Math.abs(amount / 100 - variant.price) > 0.00001 || !Number.isSafeInteger(amount) || amount < 1000 || amount > 99999900) return null;
    return { amount, variantId: String(variant.id), label: variant.label || variant.sku || String(variant.id), available: variant.available };
  }
  if (!Number.isSafeInteger(product.priceBaht) || product.priceBaht! < 10 || product.priceBaht! > 999999) return null;
  return { amount: product.priceBaht! * 100, variantId: '', label: '', available: 10 };
}
