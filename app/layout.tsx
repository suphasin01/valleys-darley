import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StorefrontOnly><Header locale={locale} /></StorefrontOnly>
        <main>{children}</main>
        <StorefrontOnly><Footer locale={locale} /></StorefrontOnly>
      </body>
    </html>
  );
}
