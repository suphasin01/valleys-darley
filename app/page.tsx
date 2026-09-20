import { Hero } from "./components/Hero";
import { ProductGrid } from "./components/ProductGrid";
import { FeaturedCollections } from "./components/FeaturedCollections";
import { AboutSection } from "./components/AboutSection";
import { ARShowcase } from "./components/ARShowcase";

export default function Home() {
  return (
    <>
      <Hero />
      <ARShowcase />
      <ProductGrid />
      <FeaturedCollections />
      <AboutSection />
    </>
  );
}
