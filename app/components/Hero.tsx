"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate parallax and fade effects
  const opacity = Math.max(0, 1 - scrollY / 700);
  const transform = scrollY * 0.4;
  const scale = Math.max(0.8, 1 - scrollY / 2000);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-blush-50">
      {/* Decorative Elements - Parallax */}
      <div
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
      />
      <div
        className="absolute bottom-40 left-20 w-72 h-72 bg-gradient-to-tr from-blush-200/30 to-rose-200/30 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
      />

      {/* Main Content */}
      <div className="container relative z-10">
        <div className="min-h-screen flex items-center justify-center py-20">
          <div
            className="max-w-6xl mx-auto text-center"
            style={{
              opacity,
              transform: `translateY(${transform}px) scale(${scale})`,
              transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
            }}
          >
            {/* Badge */}
            <div className="flex justify-center mb-8 fade-in">
              <span className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-rose-200 rounded-full text-rose-600 text-xs font-bold tracking-[0.3em] uppercase shadow-sm animate-bounce">
                ✨ Silver Edition 2025
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-hero font-bold text-center mb-6 text-gray-900">
              Valley&apos;s
              <span className="block bg-gradient-to-r from-rose-600 via-blush-600 to-rose-600 bg-clip-text text-transparent">
                Darling
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-center text-gray-600 font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Handmade jewelry crafted with love in Bangkok
              <span className="block mt-2 text-rose-500 animate-pulse">✨✨✨</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="#shop"
                className="btn btn-primary group hover:scale-105 transition-transform"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Shop Collection
              </Link>
              <Link
                href="#about"
                className="btn btn-outline hover:scale-105 transition-transform"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 animate-bounce"
        style={{ opacity: Math.max(0, 1 - scrollY / 300) }}
      >
        <div className="flex flex-col items-center text-rose-400">
          <span className="text-xs tracking-widest mb-2 font-medium">SCROLL</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-rose-50 to-transparent" />
    </section>
  );
}
