import type { Metadata } from "next";
import Link from "next/link";
import { EditionSelector } from "@/components/EditionSelector";
import { Icon } from "@/components/Icon";
import { SiteFooter } from "@/components/SiteFooter";
import type { EditionId } from "@/config/site";

export const metadata: Metadata = {
  title: "Secure checkout | Omugwo",
  description: "Choose your Omugwo edition and enter the details needed to complete your order.",
  robots: { index: false, follow: false },
};
export const instant = false;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ edition?: string }>;
}) {
  const { edition } = await searchParams;
  const initialEdition: EditionId = edition === "paperback" ? "paperback" : "digital";

  return (
    <>
      <header className="review-page-header" id="top">
        <Link className="brand-lockup" href="/" aria-label="Return to Omugwo home">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span className="brand-copy">
            <strong>Omugwo</strong>
            <small>The Season Mother Came</small>
          </span>
        </Link>
        <Link className="button button--header" href="/#editions">
          <Icon name="arrow-left" /> Back to the book
        </Link>
      </header>
      <main className="checkout-page-main">
        <EditionSelector checkout initialEdition={initialEdition} />
      </main>
      <SiteFooter />
    </>
  );
}
