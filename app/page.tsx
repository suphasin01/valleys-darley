import Link from "next/link";
import { getCmsContent } from './lib/cms';
import { editorialImage } from './lib/editorial-images';
import { HomeEntrance } from './components/HomeEntrance';
export const dynamic = 'force-dynamic';
const CUSTOM_PIECES = [
 {key:'heart-locket',name:'Heart locket',image:'/assets/home/custom-locket.webp',href:'/custom-made/heart-locket'},
 {key:'swirl-bow',name:'Swirl bow necklace',image:'/assets/home/custom-swirl.webp',href:'/custom-made/swirl-bow'},
 {key:'ribbon-earring',name:'Ribbon earrings',image:'/assets/home/custom-earrings.webp',href:'/custom-made/earrings'},
 {key:'pearl-ring',name:'Rosette ring',image:'/assets/home/custom-ring.webp',href:'/custom-made/ring'},
];

// Layout from Figma "Landing page" (1:2418)
const CARDS = [
  ["swirl-bow", "classic swirl bow necklace", "/assets/home/card-swirl.jpg"],
  ["ribbon-earring", "pleated gemstone ribbon earrings", "/assets/home/card-earrings.jpg"],
  ["pearl-ring", "rosette ribbon mother of pearl ring", "/assets/home/card-ring.jpg"],
  ["heart-locket", "the ruffle heart locket necklace", "/assets/home/card-locket.jpg"],
];

export default async function Home() {
  const { products } = await getCmsContent();
  return (
    <main className="supplied-ui"><HomeEntrance /><div className="home">
      <div className="ship-bar left">handcrafted with love in Bangkok, Thailand.</div>
      <section className="hero">
        <img src="/assets/home/hero.jpg" alt="Gemstone ribbon earrings in the sunlight" className="hero-img" fetchPriority="high" />
        <h1 className="hero-title">welcome to our little world</h1>
        <Link href="/about" className="btn hero-btn">discover the world</Link>
      </section>

      <section className="home-duo">
        <img src="/assets/home/girl.jpg" alt="a girl in a white dress sitting under a chandelier" />
        <img src="/assets/home/ring-cake.jpg" alt="a hand wearing the rosette ring beside a cake" />
      </section>
      <img src="/assets/about/bows.png" alt="" className="home-bows" />

      <section className="home-collection">
        <p className="home-keepsakes"><span>Keepsakes of wonder</span><span>and Romance</span></p>
        <p className="home-collection-text">this collection is inspired by the ribbon — reshaped into rosettes and countless other forms</p>
        <Link href="/collections?collection=be-present" className="btn">explore collection</Link>
      </section>

      <section className="home-custom">
        <div className="home-custom-head">
          <h2>custom made</h2>
          <p>custom-made jewelry,<br />crafted around your imagination.</p>
        </div>
        <div className="home-custom-pieces">
          {CUSTOM_PIECES.filter(piece => products.some(product => product.id === piece.key && product.published)).map((p) => (
            <Link key={p.key} href={p.href} aria-label={p.name}><img src={p.image} alt="" loading="lazy" /></Link>
          ))}
        </div>
        <div className="home-custom-foot">
          <Link href="/custom-made" className="btn white">create yours</Link>
          <p>choose your own colour, size, stone or have a name engraved on the piece. each creation is made to order, especially for you.</p>
        </div>
      </section>

      <section className="page home-discover">
        <p className="home-imagined">a few things we&apos;ve already imagined.</p>
        <p className="home-discover-title">discover our jewelry</p>
        <div className="home-cards">
          {CARDS.map(([slug, name, img]) => {
 const product = products.find(item => item.id === slug && item.published);
 if (!product) return null;
 const artwork = editorialImage(product) !== product.image ? img : product.image;
 return (
            <Link key={slug} href={`/products/${slug}`} className="home-card">
              <img src={artwork} alt={product.name} loading="lazy" />
              <span>{product.name}</span>
            </Link>
          ); })}
        </div>
        <p className="home-handmade">handcrafted with love and intentions based in bangkok thailand</p>
      </section>
    </div></main>
  );
}
