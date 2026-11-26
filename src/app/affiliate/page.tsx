import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Affiliate Programme | Omugwo", description: "Apply to promote Omugwo, create your own approved offers, and earn from verified book sales." };

export default function AffiliateProgrammePage() {
  return (
    <>
      <header className="review-page-header">
        <Link className="brand-lockup" href="/"><span className="brand-mark">O</span><span className="brand-copy"><strong>Omugwo</strong><small>The Season Mother Came</small></span></Link>
        <Link className="button button--header" href="/affiliate/login"><Icon name="log-in" /> Affiliate sign in</Link>
      </header>
      <main className="affiliate-marketing-page">
        <section className="affiliate-marketing-hero">
          <div className="affiliate-marketing-hero-copy">
            <p className="eyebrow">Omugwo Affiliate Programme</p>
            <h1>Share a memorable story. Build an income around every sale.</h1>
            <p>Choose approved selling prices, share your secure links, and earn the difference after payment costs. We handle checkout, delivery and customer support.</p>
            <div className="affiliate-marketing-actions">
              <Link className="button button--primary" href="/affiliate/login"><Icon name="user" /> Apply to become an affiliate</Link>
              <a className="button button--secondary" href="#how-it-works"><Icon name="arrow-right" /> See how it works</a>
            </div>
          </div>
          <figure className="affiliate-marketing-hero-image">
            <Image src="/images/affiliate/omugwo-affiliate-bookstore-real.png" alt="A Nigerian reader holding the Omugwo paperback in a bookstore" width={1024} height={1536} priority sizes="(max-width: 700px) 100vw, 48vw" />
            <figcaption><Icon name="book" /> Share the story personally</figcaption>
          </figure>
        </section>

        <section className="affiliate-how" id="how-it-works">
          <div><p className="section-index">A simple partnership</p><h2>You bring readers. We fulfil every verified order.</h2></div>
          <div className="affiliate-how-grid">
            <article><Icon name="user" /><h3>Apply</h3><p>Create an account with Google or email, verify your address, tell us how you plan to promote the book, and wait for approval.</p></article>
            <article><Icon name="money" /><h3>Set your offers</h3><p>Choose digital prices from ₦2,000–₦5,000 and paperback prices from ₦5,000–₦10,000.</p></article>
            <article><Icon name="send" /><h3>Share your links</h3><p>Every secure link remembers your offer for 30 days. The most recently clicked valid offer receives the sale.</p></article>
            <article><Icon name="credit-card" /><h3>Receive payouts</h3><p>Verified earnings clear after seven days and are paid manually to your bank account on Fridays.</p></article>
          </div>
        </section>

        <section className="affiliate-pricing-explainer">
          <figure className="affiliate-earnings-image">
            <Image src="/images/affiliate/omugwo-affiliate-workspace-real.png" alt="A Black woman using her phone at a desk beside the Omugwo paperback" width={1024} height={1536} sizes="(max-width: 800px) 100vw, 48vw" />
          </figure>
          <div className="affiliate-pricing-copy">
            <p className="eyebrow">Clear earnings</p>
            <h2>Every verified sale is recorded transparently.</h2>
            <p>Your affiliate dashboard separates pending, available, paid and reversed earnings so you always know where you stand.</p>
            <p>The complete calculation, holding period and reversal rules are explained in the Affiliate Programme Terms during onboarding.</p>
            <Link className="button button--ivory" href="/affiliate/login"><Icon name="user" /> Create affiliate account</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
