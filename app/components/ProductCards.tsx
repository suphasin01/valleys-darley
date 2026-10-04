import Image from "next/image";
import Link from "next/link";
import type { CmsProduct } from "../lib/cms";
import type { Locale } from "../lib/i18n";

export function ProductCards({ products, locale, className }: { products: CmsProduct[]; locale: Locale; className: string }) {
  return <div className={className}>{products.filter(product => product.published).map(product => {
    const price = product.priceBaht;
    return <Link key={product.id} href={`/products/${encodeURIComponent(product.id)}`} className="group min-w-0">
      <div className="relative aspect-[1.12] overflow-hidden rounded-sm bg-[#ebe7e8]"><Image unoptimized={product.image.startsWith("https:")} src={product.image} alt={product.name} fill sizes="(max-width: 768px) 46vw, 40vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.045]" /></div>
      <h3 className="mt-3 break-words text-[11px] uppercase leading-5 tracking-[.03em] md:text-sm">{product.name}</h3>
      {price !== undefined && <p className="mt-1 text-xs">฿{price.toLocaleString(locale === "th" ? "th-TH" : "en-US")}</p>}
    </Link>;
  })}</div>;
}
