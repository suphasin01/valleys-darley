import Link from 'next/link';
import { HelpContactForm } from '../components/HelpContactForm';
import { JewelryCareCopy } from '../components/JewelryCareCopy';

export const metadata = { title: "Help – Valley's Darling" };

// Text from Figma frame "help" (1:2145)
export default function Page() {
  return (
    <main className="supplied-ui"><section className="help-page text-page">
      <div className="help-top">
        <div id="contact" className="help-contact">
          <h2>contact us</h2>
          <p><a href="https://line.me/R/ti/p/@valleydarley" target="_blank" rel="noopener noreferrer">line @valleydarley ↗</a></p>
          <p>email <a href="mailto:valleydarley@gmail.com">valleydarley@gmail.com</a></p>
          <p>instagram <a href="https://instagram.com/valleydarley" target="_blank" rel="noreferrer">@valleydarley</a></p>
        </div>
        <h1 className="script-title help-title">Help</h1>
      </div>

      <div id="after-sales" className="help-th">
      <h3 className="help-u">after-sales service (for customers in thailand only)</h3>
      <dl>
        <dt>damaged on arrival</dt>
        <dd>please record a video while unboxing your order. if your item arrives damaged, send us the video within 1–2 days of delivery and we&apos;ll fix or replace it free of charge.</dd>
        <dt>repairs</dt>
        <dd>if your item breaks or a part is lost after use, we can repair it. you only pay for materials and return shipping.</dd>
        <dt>length extension</dt>
        <dd>we can make your piece longer. prices start from 100 THB (materials + return shipping), depending on the material and length you need.</dd>
      </dl>
      </div>
      <div className="help-intl">
      <h3 className="help-u">for international customers</h3>
      <dl>
        <dt>damaged on arrival</dt>
        <dd>please record a video while unboxing your order. if your item arrives damaged, contact us within 3 days of delivery with your video — valleydarley@gmail.com or DM us on instagram @valleydarley. we will review your case and get back to you.</dd>
        <dt>repairs</dt>
        <dd>please contact us before sending any item for repair. customers pay for shipping both ways, materials, and any import taxes or fees. please use tracked shipping and mark the parcel as &quot;returned for repair.&quot; repairs take about 7–14 days after we receive your item.</dd>
        <dt>please note</dt>
        <dd>we are not responsible for lost or delayed parcels, or customs fees charged by your country.</dd>
      </dl>

      </div>

      <div id="shipping" className="help-ship">
      <h2 className="script-title help-ship-title">Shipping &amp;<br />Return</h2>
      <h3 className="center">shipping policy</h3>
      <dl>
        <dt>processing time</dt>
        <dd>ready-to-ship items are sent within 1–3 business days after payment. length-adjusted items take 5–7 business days. made-to-order items take 4–7 weeks, depending on the design. we do not ship on weekends or public holidays.</dd>
        <dt>delivery time</dt>
        <dd>orders within thailand take about 1–3 days. international orders take about 1–2 weeks, depending on your country and customs.</dd>
        <dt>shipping fees</dt>
        <dd>are shown at checkout. Online checkout currently supports Thailand delivery. For international delivery, please contact us for a quote.</dd>
        <dt>tracking</dt>
        <dd>Your tracking details appear in <Link href="/orders" className="link">My orders</Link> after shipment. You can also use our <Link href="/track" className="link">track your order</Link> page.</dd>
        <dt>address</dt>
        <dd>please check your address carefully before ordering. if a parcel is returned because of a wrong address or no one is available to receive it, you pay for reshipping.</dd>
        <dt>customs and import taxes</dt>
        <dd>your country may charge import taxes or fees. these are paid by the customer and are not included in the item price or shipping fee.</dd>
        <dt>lost or delayed parcels</dt>
        <dd>if your parcel is late or missing, please contact us at valleydarley@gmail.com or DM @valleydarley. we will help you check with the carrier, but we are not responsible for delays or losses caused by the carrier or customs.</dd>
      </dl>
      <h3 id="returns" className="center">returns</h3>
      <ul>
        <li>returns are accepted within 7 days of delivery. please contact us before sending anything back.</li>
        <li>items must be unworn, undamaged and in their original packaging.</li>
        <li>customers pay for return shipping and any import taxes or fees. refunds will be made to your original payment method within 7 days after we receive and check your item. original shipping fees, bank fees and exchange rate differences are non-refundable.</li>
        <li>we cannot accept returns on custom-made or length-adjusted items, earrings (for hygiene reasons), and sale items.</li>
      </ul>

      </div>

      <h2 id="care" className="help-bar">care instruction</h2>
      <img className="care-icons" src="/assets/ui/care-icons.png" alt="keep away from moisture and water · avoid direct contact with perfume, lotions or other chemicals · store in a closed pouch or box · clean the pieces after use with a silver polishing sheet · handle with care" />
      <div className="help-care native-ui space-y-8"><JewelryCareCopy /></div>

      <h2 id="size-guide" className="help-bar">size guide</h2>
      <img className="size-guide-img" src="/assets/ui/size-guide-necklace.png" alt="A guide for necklace, bracelet and anklet – how to measure your necklace size" />

      <section id="ring-size"><h2 className="script-title center">A guide for the Ring</h2><img className="size-guide-img" src="/assets/ui/size-guide-ring.png" alt="Ring size chart and measuring instructions" /></section>
      <div id="newsletter" className="help-news"><div className="native-ui supplied-contact-form"><HelpContactForm /></div>
      </div>
    </section></main>
  );
}
