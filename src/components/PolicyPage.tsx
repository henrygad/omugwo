import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SiteFooter } from "@/components/SiteFooter";

export function PolicyPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="review-page-header" id="top">
        <Link className="brand-lockup" href="/" aria-label="Return to Omugwo home">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span className="brand-copy"><strong>Omugwo</strong><small>The Season Mother Came</small></span>
        </Link>
        <Link className="button button--header" href="/"><Icon name="arrow-left" /> Return to the book</Link>
      </header>
      <main className="policy-page">
        <article className="policy-card">
          <p className="section-index">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="policy-updated">Effective 11 November 2026</p>
          {children}
          <section>
            <h2>Contact</h2>
            <p>Questions may be sent to <a href="mailto:Henrygad.orji@gmail.com">Henrygad.orji@gmail.com</a> or <a href="tel:+2347081477330">+234 708 147 7330</a>.</p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
