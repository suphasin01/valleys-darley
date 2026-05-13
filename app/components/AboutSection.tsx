"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export function AboutSection() {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true);
      },
      { threshold: 0.15 }
    );
    const section = document.getElementById("about");
    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className="py-20 md:py-32 px-6 bg-white overflow-hidden">
      <div className="container relative z-10">
        {/* Top Label */}
        <div
          className={`text-center mb-14 md:mb-20 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="text-xs font-bold tracking-[0.4em] uppercase text-rose-400">
            Our Story
          </span>
        </div>

        {/* Image + Text Grid */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-1000 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-rose-100 to-pink-50">
              <Image
                src="/images/fashion-model.png"
                alt="Valley's Darling handmade jewelry"
                fill
                loading="lazy"
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-5 -right-3 md:-right-6 bg-white p-5 md:p-6 rounded-2xl shadow-xl border border-rose-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-blush-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                  V
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Valley&apos;s</div>
                  <div className="text-xs text-gray-500">Darling</div>
                  <div className="text-xs text-rose-400 mt-0.5">Since 2020</div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div
            className={`mt-12 md:mt-0 transition-all duration-1000 delay-200 ${
              isInView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Crafted with
              <span className="block bg-gradient-to-r from-rose-600 to-blush-600 bg-clip-text text-transparent">
                Soul & Love
              </span>
            </h2>

            <div className="space-y-5 text-gray-600 font-light leading-relaxed text-base md:text-lg">
              <p>
                At Valley&apos;s Darley, we believe jewelry is more than adornment—it&apos;s a
                language of self-expression and a bridge between imagination and reality.
              </p>
              <p>
                Each piece begins as a whisper of inspiration, meticulously handcrafted
                in sterling silver to become a tangible story you can wear.
              </p>
              <p>
                From the Silver Edition to our archived gems, every creation carries the
                essence of endless possibilities.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="#" className="btn btn-primary">
                Learn More
              </Link>
              <Link
                href="https://www.instagram.com/valleydarley"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Follow on Instagram
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-8 border-t-2 border-rose-100">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blush-600">36K+</div>
                <div className="text-xs text-gray-500 font-medium tracking-wider uppercase mt-1">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blush-600">100%</div>
                <div className="text-xs text-gray-500 font-medium tracking-wider uppercase mt-1">Handmade</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blush-600">925</div>
                <div className="text-xs text-gray-500 font-medium tracking-wider uppercase mt-1">Sterling Silver</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
