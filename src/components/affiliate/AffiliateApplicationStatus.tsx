"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import type { AffiliateStatus } from "@/types/commerce";

export function AffiliateApplicationStatus({ status }: { status: Exclude<AffiliateStatus, "approved"> }) {
  const router = useRouter();
  const [checking, startTransition] = useTransition();

  useEffect(() => {
    if (status !== "pending") return;
    const interval = window.setInterval(() => router.refresh(), 20_000);
    return () => window.clearInterval(interval);
  }, [router, status]);

  function checkStatus() {
    startTransition(() => router.refresh());
  }

  return (
    <section className="affiliate-status-card">
      <span className={`affiliate-status affiliate-status--${status}`}>{status}</span>
      <h1>{statusTitle(status)}</h1>
      <p>{statusCopy(status)}</p>
      {status === "pending" && <p className="affiliate-status-email-note"><Icon name="mail" /> We will email you as soon as the review is complete.</p>}
      <div className="affiliate-status-actions">
        {status === "pending" && <button className="button button--primary" type="button" onClick={checkStatus} disabled={checking}><Icon name="refresh" /> {checking ? "Checking…" : "Check approval status"}</button>}
        <Link className="button button--secondary" href="/">Return to the book</Link>
      </div>
    </section>
  );
}

function statusTitle(status: Exclude<AffiliateStatus, "approved">) {
  if (status === "pending") return "Your application is being reviewed.";
  if (status === "rejected") return "Your application was not approved.";
  return "Your affiliate account is currently suspended.";
}

function statusCopy(status: Exclude<AffiliateStatus, "approved">) {
  if (status === "pending") return "Your details are safely submitted. This page checks for approval automatically, so you do not need to create another account.";
  if (status === "rejected") return "Contact us if you believe important information was missing from your application.";
  return "Your offer links are inactive. Contact us for information about restoring the account.";
}
