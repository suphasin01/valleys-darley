import Link from 'next/link';
import { BePresentStorybook } from '../../components/BePresentStorybook';

export const metadata = { title: "Be Present Collection | Valley's Darling" };

export default function BePresentCollection() {
  return <main className="editorial-page be-present-page mx-auto max-w-[1440px] overflow-hidden bg-[#f1e9eb] text-black">
    <section className="be-present-hero relative">
      <img src="/images/figma/be-present-portrait.png" width={1440} height={2442} alt="Be Present jewelry worn with a black sweater and ivory skirt" className="be-present-portrait absolute left-0 top-0 h-auto w-full" fetchPriority="high" />
      <div className="be-present-copy relative">
        <h1><img src="/images/figma/be-present-title.webp" alt="Be present collection" className="block h-auto w-full" /></h1>
        <div className="mt-10 space-y-8 leading-[1.5]">
          <p>This collection is inspired by the ribbon, a symbol that has carried meaning for centuries: love, honor, remembrance and celebration. Here, the ribbon becomes rosettes and countless other forms. Each piece holds a treasured feeling and carries one message: every moment in life is a gift.</p>
          <p>The rosette has long been used to mark moments worth honoring, whether to celebrate or to recognize an achievement. In this collection, the ribbon becomes a reminder to honor yourself.</p>
          <p>To wear a piece from Be Present is to wrap yourself in love and to look inward and recognize your own worth. It is a gentle reminder that you are, and have always been, the greatest gift of all.</p>
        </div>
      </div>
      <img src="/images/figma/be-present-seal.webp" width={678} height={718} alt="The world of imagination lives within everyone’s heart — Valley’s Darling" className="be-present-seal" />
      <Link href="/collections?collection=be-present" className="be-present-shop editorial-button">SHOP BE PRESENT</Link>
      <div className="be-present-worlds"><p>Let the &apos;ribbon&apos; be the symbol that connects two worlds</p><p>The world of reality (the products you can wear) and the world of imagination</p></div>
      <div className="be-present-lily"><p>Lily (a unicorn) is not one who gives jewelry.</p><p>Lily is the one who bestows the &apos;ribbon of dreams,&apos; your guardian within the world of imagination.</p><p>She appears to every girl who holds a dream deep within the depths of her imagination and that ribbon transforms into jewelry — a symbol of the imagination that lives within everyone&apos;s heart.</p></div>
    </section>
    <section className="be-present-story" aria-labelledby="be-present-story-title">
      <div className="be-present-story-rule">Be Present Collection</div>
      <h2 id="be-present-story-title" className="be-present-story-label"><img src="/images/figma/be-present-story-label.webp" width={806} height={487} alt="Read the story behind the collection." /></h2>
      <BePresentStorybook />
      <p aria-hidden="true" className="py-16 text-center text-2xl">⋆౨ৎ˚⟡˖ ࣪</p>
    </section>
  </main>;
}
