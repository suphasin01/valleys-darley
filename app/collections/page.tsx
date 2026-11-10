import { getCmsContent } from "../lib/cms";
import { SuppliedCatalog } from '../components/SuppliedCatalog';

export const dynamic = "force-dynamic";
export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ collection?: string }> }) {
  const bePresent = (await searchParams).collection === 'be-present';
  return <SuppliedCatalog products={(await getCmsContent()).products} category={bePresent ? 'be-present' : undefined}/>;
}
