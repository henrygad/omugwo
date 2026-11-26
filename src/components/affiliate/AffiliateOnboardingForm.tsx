"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { AffiliateTermsContent } from "@/components/affiliate/AffiliateTermsContent";

export function AffiliateOnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [termsOpen, setTermsOpen] = useState(true);
  const [termsRead, setTermsRead] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const termsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!termsOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [termsOpen]);

  function trackTermsScroll() {
    const element = termsScrollRef.current;
    if (!element) return;
    const reachedBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight <= 12;
    if (reachedBottom) setTermsRead(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!acceptedTerms) {
      setNotice("Read and accept the Affiliate Programme Terms before submitting.");
      setTermsOpen(true);
      return;
    }
    setLoading(true);
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/affiliate/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          publicName: form.get("publicName"),
          phone: form.get("phone"),
          marketingDetails: form.get("marketingDetails"),
          acceptedTerms,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Application could not be submitted.");
      router.push("/affiliate/dashboard");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Application could not be submitted.");
      setLoading(false);
    }
  }

  return (
    <>
      <form className="affiliate-onboarding-form" onSubmit={submit}>
        <label><span><Icon name="user" /> Full legal name</span><input name="fullName" autoComplete="name" required minLength={2} /></label>
        <label><span><Icon name="star" /> Public affiliate name</span><input name="publicName" required minLength={2} placeholder="The name customers will see" /></label>
        <label><span><Icon name="phone" /> Phone number</span><input name="phone" type="tel" autoComplete="tel" required /></label>
        <label className="affiliate-field-full"><span><Icon name="message" /> How will you market Omugwo?</span><textarea name="marketingDetails" required minLength={20} maxLength={1000} placeholder="Tell us about your audience, social pages, community or sales plan." /></label>
        <div className="affiliate-terms-accepted affiliate-field-full">
          <span><Icon name={acceptedTerms ? "check" : "shield"} /> {acceptedTerms ? "Affiliate Programme Terms accepted" : "Affiliate Programme Terms must be accepted"}</span>
          <button type="button" onClick={() => setTermsOpen(true)}><Icon name="shield" /> {acceptedTerms ? "Review terms" : "Read terms"}</button>
        </div>
        <button className="button button--primary affiliate-field-full" disabled={loading || !acceptedTerms}>{loading ? <><Icon name="refresh" /> Submitting application…</> : <><Icon name="send" /> Submit application</>}</button>
        {notice && <p className="affiliate-notice affiliate-field-full" role="status"><Icon name="message" /> {notice}</p>}
      </form>

      {termsOpen && (
        <div className="affiliate-terms-backdrop">
          <section
            className="affiliate-terms-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="affiliate-terms-title"
          >
            <header>
              <div>
                <p>Required before applying</p>
                <h2 id="affiliate-terms-title">Affiliate Programme Terms</h2>
              </div>
              <Icon name="shield" />
            </header>
            <div
              className="affiliate-terms-scroll"
              ref={termsScrollRef}
              onScroll={trackTermsScroll}
              tabIndex={0}
            >
              <p className="affiliate-terms-intro">
                Please read these terms carefully. Scroll to the bottom before
                you can confirm your agreement and continue your application.
              </p>
              <AffiliateTermsContent />
              <div className="affiliate-terms-end" aria-hidden="true">End of terms</div>
            </div>
            <footer>
              {!termsRead ? (
                <p className="affiliate-terms-scroll-note"><Icon name="arrow-right" /> Scroll through the complete document to continue.</p>
              ) : (
                <label className="affiliate-terms-consent">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                  />
                  <span>I have read and agree to the Affiliate Programme Terms.</span>
                </label>
              )}
              <div className="affiliate-terms-actions">
                <Link href="/affiliate/login">Leave application</Link>
                <button
                  type="button"
                  className="button button--primary"
                  disabled={!termsRead || !acceptedTerms}
                  onClick={() => setTermsOpen(false)}
                >
                  Agree and continue
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
