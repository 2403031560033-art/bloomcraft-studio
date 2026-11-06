import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BloomCraft Studio | Handcrafted Blooms & Thoughtful Gifts",
  description: "Handmade bouquets, crochet flower pots, keychains, floral torans, and personalised gifts crafted with love in Jhansi, India.",
  keywords: ["handmade gifts", "crochet flowers", "flower bouquets", "toran", "crochet keychains", "personalized gifts", "Jhansi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#FFFBF8] text-[#261F26]">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
