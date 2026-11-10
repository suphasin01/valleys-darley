import { notFound } from "next/navigation";
import { getCmsContent } from "../../lib/cms";
import { canonicalProductId } from "../../lib/supplied-catalog";
import { SuppliedProduct } from "../../components/SuppliedProduct";
export const dynamic = "force-dynamic";
export default async function ProductPage({ params, searchParams }: { params: Promise<{id:string}>; searchParams: Promise<{checkout?:string}> }) {
  const id=canonicalProductId((await params).id);
  const {products}=await getCmsContent();
  const product=products.find(item=>item.id===id && item.published);
  if (!product) notFound();
  return <SuppliedProduct product={product} related={products.filter(item=>item.published && item.id!==id).slice(0,3)} checkout={(await searchParams).checkout}/>;
}
