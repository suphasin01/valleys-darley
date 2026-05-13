"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm shadow-rose-100/50"
          : "bg-transparent"
      }`}
    >
      <nav className="container">
        <div className="flex items-center justify-center h-16 md:h-20">
          {/* Centered Logo Only */}
          <Link
            href="/"
            className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 hover:text-blush-600 transition-colors"
          >
            Valley&apos;s Darley
          </Link>
        </div>
      </nav>
    </header>
  );
}
