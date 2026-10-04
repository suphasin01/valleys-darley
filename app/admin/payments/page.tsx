import AdminOrders from '../orders/page';
export const dynamic = 'force-dynamic';
export default async function Payments({ searchParams }: { searchParams: Promise<{ after?: string; updated?: string }> }) {
  return <AdminOrders searchParams={searchParams.then(params => ({ ...params, view: 'payments' }))}/>;
}
