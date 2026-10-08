import type { CmsProduct } from './cms';
import { purchaseSelection } from './purchase';

export type CartItem = { productId: string; variantId: string; quantity: number };
export function parseCart(value: unknown): CartItem[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) return null;
  const keys = new Set<string>();
  const result: CartItem[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || typeof item.productId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(item.productId)
      || typeof item.variantId !== 'string' || !/^(?:[0-9]{1,20})?$/.test(item.variantId)
      || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) return null;
    const key = `${item.productId}:${item.variantId}`;
    if (keys.has(key)) return null;
    keys.add(key);
    result.push({ productId: item.productId, variantId: item.variantId, quantity: item.quantity });
  }
  return result;
}
export function resolveCart(items: CartItem[], products: CmsProduct[]) {
  const lines = items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (product && !product.variants?.length && item.variantId !== '') return null;
    const selection = product && purchaseSelection(product, item.variantId || undefined, item.quantity);
    if (!product || !selection) return null;
    return { ...item, product, selection };
  });
  if (lines.some(line => line === null)) return null;
  return lines as NonNullable<(typeof lines)[number]>[];
}
