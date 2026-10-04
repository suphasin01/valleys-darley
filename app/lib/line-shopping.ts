import 'server-only';

export type LineProduct = { id: number; name: string; description: string; imageUrls: string[]; isDisplay: boolean; variants: { id: number; price: number; discountedPrice: number; availableNumber: number; sku: string }[] };
export type LineOrder = {
  orderNumber: string; orderStatus: string; paymentStatus: string; shipmentStatus: string;
  totalPrice: number; checkoutAt: string; lastUpdatedAt: string;
  shippingAddress?: { recipientName?: string; address?: string; district?: string; subDistrict?: string; province?: string; postalCode?: string; phoneNumber?: string; email?: string };
  shipmentDetail?: { name?: string; shipmentCompanyNameTh?: string; trackingNumber?: string; trackingUrl?: string; isAutoTracking?: boolean };
};
export type LinePage<T> = { data: T[]; currentPage: number; totalPage: number; totalRow: number };
export function lineShoppingReady() { return Boolean(process.env.LINE_SHOPPING_API_KEY); }

export async function getLinePage<T>(resource: 'products' | 'orders', page = 1, search = ''): Promise<LinePage<T>> {
  if (!lineShoppingReady()) throw new Error('LINE_NOT_CONFIGURED');
  const url = new URL(`https://developers-oaplus.line.biz/myshop/v1/${resource}`);
  url.searchParams.set('page', String(Math.max(1, Math.min(10000, Math.trunc(page) || 1))));
  url.searchParams.set('perPage', '25');
  if (resource === 'orders') {
    url.searchParams.set('sortBy', 'UPDATED_AT');
    url.searchParams.set('orderBy', 'DESC');
    if (search.trim()) url.searchParams.set('search', search.trim().slice(0, 100));
  }
  const response = await fetch(url, { headers: { 'X-API-KEY': process.env.LINE_SHOPPING_API_KEY! }, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`LINE_HTTP_${response.status}`);
  const result = await response.json();
  if (!Array.isArray(result.data) || !Number.isInteger(result.totalRow) || !Number.isInteger(result.totalPage) || !Number.isInteger(result.currentPage)) throw new Error('LINE_INVALID_RESPONSE');
  return { data: result.data.slice(0, 25), currentPage: result.currentPage, totalPage: result.totalPage, totalRow: result.totalRow };
}

export function lineTrackingUrl(value?: string): string | null {
  if (!value) return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
