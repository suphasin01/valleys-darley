import Link from 'next/link';
import type { CmsProduct } from '../lib/cms';
import { catalogArtwork } from '../lib/editorial-images';
import { catalogCategories, cmsPriceLabel, productsForCategory } from '../lib/supplied-catalog';
import { CatalogPhoto } from './CatalogPhoto';

export function SuppliedCatalog({ products, category }: { products: CmsProduct[]; category?: string }) {
  const visible = productsForCategory(products, category);
  const title = catalogCategories[category as keyof typeof catalogCategories] || 'Shop All';
  return <main className="supplied-ui"><section className={`page shop-page${category === 'be-present' ? ' be-present' : ''}`}>
    {category === 'be-present' ? <><h1 className="script-title">{title}</h1><p className="bp-text">this collection is inspired by the ribbon reshaped into rosettes and countless other forms, each one a symbol of the feeling that every moment in life is a gift.<br/>to wear a piece from be present is to wrap yourself in love, gently looking back to acknowledge your own worth. it&apos;s a quiet reminder that you are, and have always been, the greatest gift you could ever receive.</p></> : category ? <><div className="frame-title shop-frame"><img src="/assets/ui/frame.png" alt=""/><h1 className="script-title">{title}</h1></div><p className="tagline">{category === 'new-in' ? 'check out our newest pieces.' : 'a few things we’ve already imagined.'}</p></> : <><h1 className="script-title shop-all-title">{title}</h1><p className="tagline">a few things we&apos;ve already imagined.</p></>}
    {visible.length ? <div className="grid">{visible.map(product => { const image = catalogArtwork(product); return <Link key={product.id} href={`/products/${product.id}`} className="card catalog-card"><div className="native-ui"><CatalogPhoto primary={image.primary} hover={image.hover} name={product.name}/></div><h2 className="card-name">{product.name}</h2><p className="price">{cmsPriceLabel(product)}</p></Link>; })}</div> : <p className="muted center">No pieces are available in this collection yet.</p>}
  </section></main>;
}
