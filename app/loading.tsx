import { BrandLoading } from './components/BrandLoading';
import { StorefrontOnly } from './components/StorefrontOnly';
export default function Loading() {
  return <StorefrontOnly><BrandLoading /></StorefrontOnly>;
}
