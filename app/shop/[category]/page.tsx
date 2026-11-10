import { notFound } from 'next/navigation';
import { getCmsContent } from '../../lib/cms';
import { catalogCategories } from '../../lib/supplied-catalog';
import { SuppliedCatalog } from '../../components/SuppliedCatalog';
export const dynamic = 'force-dynamic';
export default async function Category({ params }: { params: Promise<{category:string}> }) {
  const {category} = await params;
  if (!Object.prototype.hasOwnProperty.call(catalogCategories,category)) notFound();
  return <SuppliedCatalog products={(await getCmsContent()).products} category={category}/>;
}
