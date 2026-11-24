"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";

export function PaymentRecoveryAction({
  orderId,
  customerEmail,
  alreadySent,
}: {
  orderId: string;
  customerEmail: string;
  alreadySent: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function send() {
    const action = alreadySent ? "Resend" : "Send";
    if (
      !window.confirm(
        `${action} a payment recovery email to ${customerEmail}? Paystack will be checked again first.`,
      )
    ) {
      return;
    }
    setLoading(true);
    setNotice("Checking Paystack before sending…");
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/recovery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resend: alreadySent }),
      });
      const result = (await response.json()) as { message?: string; error?: string };
      setNotice(result.message ?? result.error ?? "The request could not be completed.");
      if (response.ok) router.refresh();
    } catch {
      setNotice("The recovery email could not be sent. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recovery-action">
      <button type="button" disabled={loading} onClick={send}>
        <Icon name={alreadySent ? "refresh" : "mail"} />
        {loading
          ? "Checking payment…"
          : alreadySent
            ? "Resend recovery email"
            : "Send recovery email"}
      </button>
      {notice && <p role="status">{notice}</p>}
    </div>
  );
}

