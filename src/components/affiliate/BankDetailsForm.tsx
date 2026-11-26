"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { AffiliateProfile } from "@/types/commerce";

export function BankDetailsForm({ profile }: { profile: AffiliateProfile }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSaved(false);
    setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/affiliate/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bankName: form.get("bankName"), accountName: form.get("accountName"), accountNumber: form.get("accountNumber") }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Bank details could not be saved.");
      setSaved(true);
      setNotice("Bank details saved securely.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Bank details could not be saved.");
    } finally { setLoading(false); }
  }
  return <form className="affiliate-bank-form affiliate-panel" onSubmit={submit}>
    <div className="affiliate-panel-heading"><div><p>Manual Friday payouts</p><h2>Bank account</h2></div><Icon name="credit-card" /></div>
    <p className="affiliate-help">The account name should match the approved affiliate. We use these details only for commission payouts.</p>
    <label><span><Icon name="credit-card" /> Bank name</span><input name="bankName" required defaultValue={profile.bankName ?? ""} /></label>
    <label><span><Icon name="user" /> Account name</span><input name="accountName" required defaultValue={profile.accountName ?? ""} /></label>
    <label><span><Icon name="lock" /> Account number</span><input name="accountNumber" required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} defaultValue={profile.accountNumber ?? ""} /></label>
    <button className={`button button--primary${saved ? " is-saved" : ""}`} disabled={loading}>{loading ? <><Icon name="refresh" /> Saving…</> : saved ? <><Icon name="check" /> Saved</> : <><Icon name="shield" /> Save payment details</>}</button>
    {notice && <p className="affiliate-notice" role="status"><Icon name={saved ? "check" : "x"} /> {notice}</p>}
  </form>;
}
