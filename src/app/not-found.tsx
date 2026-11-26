import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Page not found | Omugwo",
  description: "The page you requested could not be found.",
};

export default function NotFound() {
  return (
    <main className="not-found-page">
      <header className="not-found-header">
        <Link className="brand" href="/" aria-label="Return to Omugwo home">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span><strong>Omugwo</strong><small>The Season Mother Came</small></span>
        </Link>
      </header>
      <section className="not-found-content">
        <div className="not-found-copy">
          <p className="eyebrow">Error 404</p>
          <h1>This page has wandered out of the story.</h1>
          <p>The link may be outdated, or the page may have moved. Return to the book page or contact us if you need help with an order.</p>
          <div className="not-found-actions">
            <Link className="button button--primary" href="/"><Icon name="book" /> Return to Omugwo</Link>
            <a className="button button--secondary" href="mailto:omugwobooks@gmail.com"><Icon name="mail" /> Contact us</a>
          </div>
        </div>
        <div className="not-found-book" aria-hidden="true">
          <span>Lost page</span>
          <Image src={siteConfig.cover.digital} alt="" width={320} height={480} priority sizes="(max-width: 700px) 180px, 280px" />
        </div>
      </section>
    </main>
  );
}
