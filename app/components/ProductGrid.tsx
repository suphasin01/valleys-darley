"use client";

import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: string;
  size: "normal" | "large";
}

const products: Product[] = [
  {
    id: "1",
    name: "Immaginazione Necklace",
    price: 8900,
    category: "Silver Edition",
    badge: "Best Seller",
    size: "normal",
    image: "/images/product-closeup-1.png",
  },
  {
    id: "2",
    name: "Fortuna's Darling",
    price: 12500,
    originalPrice: 15000,
    category: "Limited Edition",
    badge: "Sale",
    size: "normal",
    image: "/images/collection-overview.png",
  },
  {
    id: "3",
    name: "Silver Streak Earrings",
    price: 4900,
    category: "New Arrival",
    badge: "New",
    size: "normal",
    image: "/images/product-closeup-3.png",
  },
  {
    id: "4",
    name: "Artistry Collection",
    price: 15900,
    category: "Exclusive",
    badge: "Premium",
    size: "normal",
    image: "/images/product-closeup-2.png",
  },
  {
    id: "5",
    name: "Breaking Midas Touch",
    price: 9500,
    category: "Collection",
    badge: "Popular",
    size: "normal",
    image: "/images/product-closeup-4.png",
  },
  {
    id: "6",
    name: "Creative Vision",
    price: 7800,
    category: "Inspiration",
    badge: "Unique",
    size: "normal",
    image: "/images/product-closeup-5.png",
  },
];

export function ProductGrid() {
  return (
    <section id="shop" className="section bg-gradient-to-b from-rose-50 to-pink-50">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-xs font-bold tracking-[0.4em] uppercase text-rose-400">
            Handcrafted Excellence
          </span>
          <h2 className="text-section font-bold mt-4 mb-6 text-gray-900">
            Our Collection
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-light leading-relaxed px-4">
            Discover unique pieces crafted with passion and precision
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group block"
            >
              <div className="card overflow-hidden">
                {/* Image Container */}
                <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-rose-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    loading="lazy"
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-blush-600 text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-md">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Quick View Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-6">
                    <span className="bg-white text-gray-900 px-6 py-3 text-sm font-semibold tracking-wider uppercase rounded-full shadow-lg">
                      Quick View
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-5 md:p-6">
                  <span className="text-xs font-medium tracking-wider uppercase text-rose-400">
                    {product.category}
                  </span>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mt-2 mb-3 group-hover:text-blush-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl md:text-2xl font-bold text-blush-600">
                      ฿{product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        ฿{product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && (
                    <span className="inline-block mt-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12 md:mt-16">
          <Link href="#" className="btn btn-primary text-base px-12">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
