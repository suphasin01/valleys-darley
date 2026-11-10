import { getCmsContent } from '../lib/cms';
import { studioPieces } from '../lib/custom-studio';
import { CustomSelection } from '../components/CustomSelection';

export const metadata = { title: "Custom Made — Valley’s Darling" };
export const dynamic = 'force-dynamic';
export default async function CustomMadePage() {
  const {products}=await getCmsContent();
  return <CustomSelection visible={studioPieces.filter(piece=>products.some(product=>product.id===piece.id && product.published)).map(piece=>piece.key)}/>;
}
