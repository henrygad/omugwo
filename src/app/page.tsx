import type { Metadata } from "next";
import { CreatorsSection } from "@/components/CreatorsSection";
import { EditionSelector } from "@/components/EditionSelector";
import { FAQSection } from "@/components/FAQSection";
import { FinalCTA } from "@/components/FinalCTA";
import { HeroSection } from "@/components/HeroSection";
import { MobilePurchaseBar } from "@/components/MobilePurchaseBar";
import { PersistentBookScene } from "@/components/PersistentBookScene";
import { ReaderReviews } from "@/components/ReaderReviews";
import { SalesNarrative } from "@/components/SalesNarrative";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TypographyMotion } from "@/components/TypographyMotion";
import { editions, siteConfig } from "@/config/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const publicUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://omugwoseries.vercel.app";

const bookStructuredData = {
  "@context": "https://schema.org",
  "@type": "Book",
  name: siteConfig.title,
  description: siteConfig.description,
  image: `${publicUrl}${siteConfig.cover.digital}`,
  author: { "@type": "Person", name: "Ifeoma Clark" },
  contributor: { "@type": "Person", name: "Henry Loveday" },
  offers: Object.values(editions).map((edition) => ({
    "@type": "Offer",
    name: edition.name,
    price: edition.price,
    priceCurrency: edition.currency,
    availability:
      edition.format === "paperback"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/InStock",
    url: `${publicUrl}/checkout?edition=${edition.format}`,
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(bookStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <SiteHeader />
      <main>
        <TypographyMotion />
        <PersistentBookScene />
        <HeroSection />
        <SalesNarrative />
        <EditionSelector />
        <CreatorsSection />
        <FAQSection />
        <ReaderReviews showForm={false} />
        <FinalCTA />
      </main>
      <SiteFooter />
      <MobilePurchaseBar />
    </>
  );
}
