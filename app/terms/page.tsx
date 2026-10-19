import Link from 'next/link';
import { LegalDocument } from '../components/LegalDocument';

export const metadata = { title: "Website Terms | Valley's Darling" };
export default function Terms() {
  return <LegalDocument title="Terms of Service"><div className="space-y-9">
    <p>The Valley’s Darling website lets you browse jewelry, create an account and view orders. Provide accurate contact and delivery information, protect your password and use your own account.</p>
    <p>Check the product, price, quantity, delivery charge and displayed details before paying. Payment status is confirmed by the payment provider. A checkout labelled test mode does not take a real payment.</p>
    <p>Contact the store about orders, delivery, returns or custom-made items before proceeding. Order-specific terms communicated by the store apply to the relevant arrangement.</p>
    <p>Do not access other customers’ information, disrupt the service or misuse the website. Contact the store at <a href="mailto:valleydarley@gmail.com" className="underline">valleydarley@gmail.com</a>.</p>
  </div><Link href="/privacy" className="mt-8 inline-block underline">Privacy and data deletion requests</Link></LegalDocument>;
}
