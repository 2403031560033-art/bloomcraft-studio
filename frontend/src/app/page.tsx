import React from "react";
import Header from "@/components/storefront/Header";
import Hero from "@/components/storefront/Hero";
import CategorySection from "@/components/storefront/CategorySection";
import BestsellersSection from "@/components/storefront/BestsellersSection";
import ReviewsSection from "@/components/storefront/ReviewsSection";
import TrustStrip from "@/components/storefront/TrustStrip";
import Footer from "@/components/storefront/Footer";
import CartDrawer from "@/components/storefront/CartDrawer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF8]">
      <Header />
      <main className="flex-1">
        <Hero />
        <CategorySection />
        <BestsellersSection />
        <TrustStrip />
        <ReviewsSection />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
