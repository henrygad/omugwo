"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AffiliateStatus } from "@/types/commerce";

export function AffiliateModerationAction({ affiliateId, currentStatus }: { affiliateId: string; currentStatus: AffiliateStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  async function update(status: "approved" | "rejected" | "suspended") {
    const resendingApproval = currentStatus === "approved" && status === "approved";
    if (!window.confirm(resendingApproval ? "Resend the approval email to this affiliate?" : `Change this affiliate's status to ${status}?`)) return;
    setLoading(true); setNotice("");
    try {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const result = (await response.json()) as { error?: string; emailSent?: boolean };
      if (!response.ok) throw new Error(result.error ?? "Status could not be updated.");
      setNotice(result.emailSent ? resendingApproval ? "Approval email resent." : `Affiliate ${status}. Email sent.` : `Affiliate ${status}, but the email could not be sent. Check the Gmail configuration.`); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Status could not be updated."); }
    finally { setLoading(false); }
  }
  return <div className="admin-affiliate-actions">{currentStatus !== "approved" && <button disabled={loading} onClick={() => update("approved")}>{loading ? "Updating…" : "Approve"}</button>}{currentStatus !== "rejected" && <button disabled={loading} onClick={() => update("rejected")}>Reject</button>}{currentStatus === "approved" && <><button disabled={loading} onClick={() => update("approved")}>Resend approval email</button><button disabled={loading} onClick={() => update("suspended")}>Suspend</button></>}{notice && <small role="status">{notice}</small>}</div>;
}
