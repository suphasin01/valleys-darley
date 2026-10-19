import Link from 'next/link';
import { LegalDocument, LegalSection } from '../components/LegalDocument';

export const metadata = { title: "Privacy Policy | Valley's Darling" };
export default function Privacy() {
  return <LegalDocument title="Privacy Policy">
    <LegalSection title="Who we are"><p>Valley’s Darling is a jewellery brand based in Thailand. We are responsible for the personal information you share with us on this website, on LINE and Instagram, and when you order from us.</p></LegalSection>
    <LegalSection title="What we collect">
      <p>Account details: your name, email, website password (stored as a hash), and the birth date, telephone number and other profile details you choose to provide.</p>
      <p>Order details: your shipping and billing address, telephone number, the items you buy, order notes and payment status.</p>
      <p>Custom-made details: engraving text, sizes, design notes, and any photos or videos you send us for custom pieces, claims or repairs.</p>
      <p>Messages: what you send us by email, LINE, Instagram or our contact form.</p>
      <p>Social sign-in: the account identifier, name and email made available by Google or LINE. We do not request your social password, read Gmail messages, or access chats or friend lists.</p>
    </LegalSection>
    <LegalSection title="Order history"><p>We keep your order history in our customer system. This helps us check past orders, handle support, claims, repairs and length-extension requests, and help you when you shop with us again. Customer information is accessible only through authorised accounts.</p></LegalSection>
    <LegalSection title="How we use it">
      <p>To process, make and ship your order, including custom-made pieces.</p>
      <p>To calculate shipping and provide order and shipping updates, including your tracking number.</p>
      <p>To manage your account, saved delivery details and order history.</p>
      <p>To handle questions, claims, repairs, returns and refunds.</p>
      <p>To protect our website and meet applicable accounting and legal obligations.</p>
    </LegalSection>
    <LegalSection title="Your choices"><p>Birth date is optional. Marketing and personalization are separate optional choices, not requirements to register or order. We record your choices, the notice version and the time. You can change or withdraw them through Edit details in your account. Selecting a choice does not automatically start a newsletter or tracking service. We do not sell customer information or use Google user data for advertising.</p></LegalSection>
    <LegalSection title="Who we share it with">
      <p>Shipping companies, including Thailand Post, receive the information needed for delivery and tracking.</p>
      <p>Stripe processes payment information directly. We do not see or store your full card number or CVV.</p>
      <p>Vercel hosts our website and stored data. Service providers receive information only as needed to provide their service.</p>
      <p>Information may also be disclosed when required by law. We never sell or rent your information.</p>
    </LegalSection>
    <LegalSection title="International transfers"><p>Some service providers are based outside Thailand, so your information may be processed or stored abroad.</p></LegalSection>
    <LegalSection title="Cookies"><p>Necessary cookies support sign-in, request protection and site preferences. Your shopping bag and saved custom designs use browser storage. You can clear cookies and site data in your browser settings; this may sign you out or remove locally saved designs. We do not enable analytics or marketing tracking merely because you create an account.</p></LegalSection>
    <LegalSection title="How we keep it safe"><p>Our website uses encrypted connections (HTTPS). Stored customer profiles are encrypted and website passwords are hashed. We do not ask you to send passwords or card details by email or chat. Signing out clears the session cookie in your browser.</p></LegalSection>
    <LegalSection title="How long we keep it"><p>We retain information as needed for your account, orders, support and applicable obligations. Certain order records may need to be retained for accounting obligations or disputes, even after a deletion request.</p></LegalSection>
    <LegalSection title="Your rights"><p>You can contact us to request access, a copy, correction or deletion of your information, or to withdraw optional consent. We verify identity before acting. You can update delivery information and preferences in <Link href="/account">your account</Link>. Revoking Google or LINE access does not automatically delete order records held by the store; please contact us to request deletion.</p></LegalSection>
    <LegalSection title="Children"><p>If you are under 20, please ask a parent or guardian before creating an account or placing an order.</p></LegalSection>
    <LegalSection title="Contact us"><p><a href="mailto:valleydarley@gmail.com">valleydarley@gmail.com</a></p><p><Link href="/help#contact">Contact the store</Link></p><p>For privacy or deletion requests, include your sign-in method and contact email. Do not send your password or card details.</p></LegalSection>
    <LegalSection title="Updates to this policy"><p>We may update this policy from time to time. The latest version will be posted here.</p><p>Last updated: October 2026.</p></LegalSection>
    <p className="pt-4"><Link href="/register" className="underline underline-offset-4">Back to registration</Link></p>
  </LegalDocument>;
}
