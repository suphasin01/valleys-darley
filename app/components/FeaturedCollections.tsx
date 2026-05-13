"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    title: "Silver Edition",
    subtitle: "The Beginning",
    description: "Where imagination meets reality in sterling silver",
    image: "/images/silver-edition-catalog.png",
  },
  {
    title: "Heartfelt Chronicles",
    subtitle: "New Collection",
    description: "Charms that tell your unique story",
    image: "/images/heartfelt-chronicles.png",
  },
  {
    title: "The Making",
    subtitle: "Behind the Scenes",
    description: "Witness the artistry and craftsmanship",
    image: "/images/lifestyle-2.png",
  },
  {
    title: "Inspiration",
    subtitle: "Creative Vision",
    description: "The stories behind every piece",
    image: "/images/lifestyle-1.png",
  },
];

export function FeaturedCollections() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      checkScroll();
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    const section = document.getElementById("collections");
    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      );
    }
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = container.clientWidth * 0.85;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="collections" className={`section bg-gradient-to-b from-pink-50 to-rose-100 overflow-hidden transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
      <div className="container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 px-4">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-rose-400">
              Explore
            </span>
            <h2 className="text-section font-bold text-gray-900 mt-4">
              Our Stories
            </h2>
          </div>

          {/* Navigation Buttons - Hidden on mobile, shown on md+ */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "border-blush-600 text-blush-600 hover:bg-blush-600 hover:text-white"
                  : "border-gray-300 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                canScrollRight
                  ? "border-blush-600 text-blush-600 hover:bg-blush-600 hover:text-white"
                  : "border-gray-300 text-gray-300 cursor-not-allowed"
              }`}
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Container - Mobile swipeable */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-4 pb-8 snap-x snap-mandatory -mx-4 px-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {collections.map((collection, index) => (
            <Link
              key={index}
              href="#"
              className={`flex-shrink-0 w-[85vw] md:w-[500px] lg:w-[600px] group snap-start transition-all duration-700 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="card overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-1000 ease-out"
                    sizes="(max-width: 768px) 85vw, 600px"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <span className="text-xs font-bold tracking-[0.3em] uppercase text-rose-300">
                      {collection.subtitle}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-3">
                      {collection.title}
                    </h3>
                    <p className="text-rose-100 font-light text-sm md:text-base mb-5 leading-relaxed">
                      {collection.description}
                    </p>
                    <span className="inline-flex items-center text-white font-semibold tracking-wider text-sm group-hover:gap-2 transition-all">
                      <span>Discover More</span>
                      <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile swipe hint */}
        <div className="md:hidden text-center mt-4">
          <span className="text-xs text-rose-400 tracking-wider">
            ← Swipe to explore more →
          </span>
        </div>
      </div>
    </section>
  );
}
