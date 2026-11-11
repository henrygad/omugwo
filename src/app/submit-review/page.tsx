import type { Metadata } from "next";
import Link from "next/link";
import { ReaderReviews } from "@/components/ReaderReviews";
import { SiteFooter } from "@/components/SiteFooter";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Submit a review | Omugwo",
  description:
    "Share your response to Omugwo: The Season Mother Came. Reviews are moderated before publication.",
  robots: { index: true, follow: true },
};

export default function SubmitReviewPage() {
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
        <Link className="button button--header" href="/">
          <Icon name="arrow-left" /> Return to the book
        </Link>
      </header>
      <main className="review-page-main">
        <ReaderReviews showReviews={false} />
      </main>
      <SiteFooter />
    </>
  );
}
