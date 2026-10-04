import type { LineProduct } from './line-shopping';

export function mapLineCatalog(products: LineProduct[], visibility: Record<string, boolean> = {}) {
  return products.map(p => {
    const id = `line-${p.id}`;
    const variants = p.variants.map(v => ({ id: v.id, sku: v.sku || '', label: v.options?.map(o=>`${o.name}: ${o.value}`).join(' · ') || v.sku || `#${v.id}`, price: Number.isFinite(v.discountedPrice) ? v.discountedPrice : v.price, available: v.availableNumber }));
    const prices = variants.map(v => v.price).filter(v => Number.isFinite(v) && v >= 0);
    const image = p.imageUrls.find(value => { try { return new URL(value).protocol === 'https:'; } catch { return false; } }) || '/images/collection-overview.png';
    return { id, name: p.name, description: p.description.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(), image, link: '/contact', published: p.isDisplay && visibility[id] !== false,
      lineProductId: p.id, linePublished: p.isDisplay, variants, priceMin: prices.length ? Math.min(...prices) : undefined, priceMax: prices.length ? Math.max(...prices) : undefined,
    };
  });
}
