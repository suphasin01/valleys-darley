import Link from 'next/link';
import type { CmsProduct } from '../lib/cms';
import { editorialGallery } from '../lib/editorial-images';
import { productAction } from '../lib/product-action';
import { cmsPriceLabel } from '../lib/supplied-catalog';
import { studioPiece } from '../lib/custom-studio';
import { AddToCart } from './Cart';
import { ProductGallery } from './ProductGallery';
import { ProductGuide } from './ProductGuide';
import { ProductCards } from './ProductCards';

export function SuppliedProduct({ product, related, checkout }: { product:CmsProduct; related:CmsProduct[]; checkout?:string }) {
  const action=productAction(product.link);
  const guide=/ring/i.test(`${product.id} ${product.name}`) ? 'ring' : /necklace|chain|locket/i.test(`${product.id} ${product.name}`) ? 'necklace' : null;
  return <main className="supplied-ui"><section className="page supplied-product pdp">
    <Link href="/shop" className="back">‹ back to shop</Link>
    <div className="pdp-grid"><div className="native-ui"><ProductGallery images={editorialGallery(product)} name={product.name} remote={product.image.startsWith('https:')} contain={false} th={false}/></div>
      <div className="pdp-info"><h1 className="pdp-name">{product.name}</h1><p className="price big">{cmsPriceLabel(product)}</p><div className="pdp-desc">{product.description.split(/\n\s*\n/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>
        {checkout && <p role="status" className="note">{checkout==='canceled' ? 'Payment was canceled. You have not been charged.' : 'Checkout is unavailable. Please review your selection or contact us.'}</p>}
        <div className="native-ui supplied-purchase">{guide && <div className="mb-5 flex items-center justify-between gap-4"><span className="text-sm uppercase">Size &amp; fit</span><ProductGuide kind={guide}/></div>}<AddToCart product={product}/></div>
        <div className="details"><Link href={studioPiece(product.id) ? `/custom-made/${product.id}` : action.href} className="link">{studioPiece(product.id) ? 'customize your piece' : 'enquire about this piece'} ↗</Link><p>handcrafted with love and intentions in Bangkok, Thailand.</p><div className="native-ui mt-5 flex flex-wrap items-center gap-3">{guide && <ProductGuide kind={guide} label="Size guide"/>}<ProductGuide kind="care" label="Care instruction"/></div></div>
      </div>
    </div>
    {related.length>0 && <section className="supplied-related"><h2>related products</h2><div className="native-ui"><ProductCards products={related} locale="en" className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-8"/></div></section>}
  </section></main>;
}
