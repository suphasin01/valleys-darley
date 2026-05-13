import { Hero } from "./components/Hero";
import { ProductGrid } from "./components/ProductGrid";
import { FeaturedCollections } from "./components/FeaturedCollections";
import { AboutSection } from "./components/AboutSection";

export default function Home() {
  return (
    <>
      <Hero />
      <ProductGrid />
      <FeaturedCollections />
      <AboutSection />
    </>
  );
}
