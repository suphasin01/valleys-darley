import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-rose-50 to-pink-100 text-gray-900">
      {/* Instagram CTA */}
      <div className="py-16 md:py-20 px-6 bg-gradient-to-r from-rose-500 via-blush-600 to-rose-500">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="text-5xl md:text-6xl mb-6">📸✨</div>
            <h3 className="text-3xl md:text-5xl font-bold mb-4">
              Follow Our Journey
            </h3>
            <p className="text-rose-100 text-lg md:text-xl font-light mb-8 leading-relaxed">
              Join 36K+ followers on Instagram for behind-the-scenes,
              new releases, and daily inspiration
            </p>
            <a
              href="https://www.instagram.com/valleydarley"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blush-600 font-bold tracking-wider hover:bg-rose-50 transition-colors rounded-full shadow-xl"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>@valleydarley</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12 md:py-16 px-6">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Brand */}
            <div className="col-span-2">
              <Link href="/" className="text-2xl md:text-3xl font-bold tracking-tight">
                Valley&apos;s Darley
              </Link>
              <p className="text-gray-600 font-light mt-4 max-w-md leading-relaxed">
                Enter the world of endless possibilities. Handmade jewelry based in Bangkok,
                crafted with passion and precision.
              </p>

              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                <a
                  href="https://www.instagram.com/valleydarley"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-white hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-all shadow-md"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-11 h-11 bg-white hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-all shadow-md"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-11 h-11 bg-white hover:bg-rose-500 hover:text-white rounded-full flex items-center justify-center transition-all shadow-md"
                  aria-label="Line"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zM9 17H7v-7h2v7zm-1-8a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 8h-2v-3.5c0-1.4-.6-2.1-1.6-2.1-.9 0-1.4.6-1.4 1.5V17h-2v-7h2v1.1c.3-.5 1-1.1 2.2-1.1 1.6 0 2.8 1.1 2.8 3.3V17z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-6 text-sm tracking-wider uppercase text-gray-900">
                Shop
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#shop" className="text-gray-600 hover:text-blush-600 transition-colors font-light">
                    Silver Edition
                  </Link>
                </li>
                <li>
                  <Link href="#collections" className="text-gray-600 hover:text-blush-600 transition-colors font-light">
                    Collections
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blush-600 transition-colors font-light">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blush-600 transition-colors font-light">
                    Archive
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-6 text-sm tracking-wider uppercase text-gray-900">
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link href="#about" className="text-gray-600 hover:text-blush-600 transition-colors font-light">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="https://www.instagram.com/valleydarley" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blush-600 transition-colors font-light">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blush-600 transition-colors font-light">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-blush-600 transition-colors font-light">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6 px-6 border-t border-rose-200">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 gap-4">
            <p className="font-light">
              © {currentYear} Valley&apos;s Darley. All rights reserved. Made with 💕 in Bangkok
            </p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-blush-600 transition-colors font-light">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-blush-600 transition-colors font-light">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
