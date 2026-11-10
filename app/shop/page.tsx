import { getCmsContent } from '../lib/cms';
import { SuppliedCatalog } from '../components/SuppliedCatalog';
export const dynamic = 'force-dynamic';
export const metadata = { title: "Shop All — Valley's Darling" };
export default async function Shop() { return <SuppliedCatalog products={(await getCmsContent()).products}/>; }
