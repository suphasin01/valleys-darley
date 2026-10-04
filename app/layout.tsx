import type { Metadata } from "next";
import { Geist, Geist_Mono, Pinyon_Script, Cormorant_Garamond, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { StorefrontOnly } from "./components/StorefrontOnly";
import { getLocale } from "./lib/locale";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const script = Pinyon_Script({ weight: "400", subsets: ["latin"], variable: "--font-brand-script", display: "swap" });
const editorial = Cormorant_Garamond({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-editorial", display: "swap" });
const thai = Noto_Serif_Thai({ weight: ["400", "500"], subsets: ["thai", "latin"], variable: "--font-editorial-thai", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://valleys-darley.vercel.app"),
  title: "Valley's Darling — Handmade Jewelry in Bangkok",
  description: "Enter the world of endless possibilities. Handmade sterling silver jewelry crafted with passion in Bangkok. Discover unique pieces that tell your story.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${script.variable} ${editorial.variable} ${thai.variable} antialiased`}
      >
        <StorefrontOnly><Header locale={locale} /></StorefrontOnly>
        <div>{children}</div>
        <StorefrontOnly><Footer locale={locale} /></StorefrontOnly>
      </body>
    </html>
  );
}
