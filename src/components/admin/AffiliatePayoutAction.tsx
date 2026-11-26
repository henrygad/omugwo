"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/config/site";

export function AffiliatePayoutAction({ affiliateId, commissionIds, amount }: { affiliateId: string; commissionIds: string[]; amount: number }) {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  async function record(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!window.confirm(`Confirm that the manual bank payout for ${formatPrice(amount)} has been completed?`)) return;
    setLoading(true); setNotice("");
    try {
      const response = await fetch("/api/admin/affiliate-payouts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ affiliateId, commissionIds, paymentReference: reference }) });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Payout could not be recorded.");
      setNotice("Payout recorded."); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Payout could not be recorded."); }
    finally { setLoading(false); }
  }
  return <form className="admin-payout-action" onSubmit={record}><input value={reference} onChange={(event) => setReference(event.target.value)} required placeholder="Bank transfer reference" /><button disabled={loading}>{loading ? "Recording…" : "Mark as paid"}</button>{notice && <small role="status">{notice}</small>}</form>;
}
