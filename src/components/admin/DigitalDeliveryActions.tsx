"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import type { DigitalDeliveryView } from "@/types/commerce";

export function ComplimentaryCopyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const note = String(form.get("note") ?? "");
    if (!window.confirm(`Create a personalized complimentary copy for ${name} (${email})? It will not be sent until you approve it.`)) return;
    setLoading(true);
    setNotice("Generating the personalized EPUB…");
    const response = await fetch("/api/admin/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, note }),
    });
    const result = (await response.json()) as { deliveryId?: string; error?: string };
    setLoading(false);
    if (!response.ok || !result.deliveryId) {
      setNotice(result.error ?? "The complimentary copy could not be created.");
      return;
    }
    router.push(`/admin/deliveries/${result.deliveryId}`);
    router.refresh();
  }

  return (
    <form className="admin-panel admin-delivery-form" onSubmit={submit}>
      <div className="admin-panel-heading">
        <div><p>Manual gift</p><h2 className="icon-heading"><Icon name="book" /> Create Complimentary Copy</h2></div>
      </div>
      <p className="admin-help">This creates a personalized EPUB without a paid order. It remains unsent until you explicitly approve delivery.</p>
      <label><span><Icon name="user" /> Recipient name</span><input name="name" required minLength={2} maxLength={100} /></label>
      <label><span><Icon name="mail" /> Recipient email</span><input name="email" type="email" required maxLength={254} /></label>
      <label className="admin-delivery-form__full"><span><Icon name="message" /> Note or reason (optional)</span><textarea name="note" rows={3} maxLength={500} /></label>
      <button disabled={loading} className="button button--primary"><Icon name="book" /> {loading ? "Generating…" : "Create personalized copy"}</button>
      {notice && <p className="review-notice" role="status">{notice}</p>}
    </form>
  );
}

export function DigitalDeliveryActions({ delivery }: { delivery: DigitalDeliveryView }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  async function run(action: "send" | "retry" | "regenerate" | "resend") {
    const descriptions = {
      send: `SEND ${delivery.generatedFileName ?? "the EPUB"} to ${delivery.buyerEmail}? This is your explicit approval to deliver the book.`,
      retry: `RETRY sending ${delivery.generatedFileName ?? "the EPUB"} to ${delivery.buyerEmail}?`,
      regenerate: `Generate a new personalized EPUB for ${delivery.buyerName}? The current generated file will be preserved and nothing will be sent.`,
      resend: `RESEND ${delivery.generatedFileName ?? "the EPUB"} to ${delivery.buyerEmail}? This will create another delivery attempt.`,
    } as const;
    if (!window.confirm(descriptions[action])) return;
    setLoading(true);
    setNotice(action === "regenerate" ? "Regenerating EPUB…" : "Sending EPUB…");
    const response = await fetch(`/api/admin/deliveries/${delivery.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const result = (await response.json()) as { error?: string };
    setLoading(false);
    setNotice(response.ok ? "Action completed successfully." : result.error ?? "The action failed.");
    router.refresh();
  }

  return (
    <div className="admin-delivery-actions">
      {delivery.epubGenerationStatus === "ready" && (
        <a className="button button--secondary" href={`/api/admin/deliveries/${delivery.id}/file`}><Icon name="book" /> Download for review</a>
      )}
      {delivery.deliveryStatus === "awaiting_approval" && delivery.epubGenerationStatus === "ready" && (
        <button disabled={loading} className="button button--primary" onClick={() => run("send")}><Icon name="send" /> Send EPUB</button>
      )}
      {delivery.deliveryStatus === "failed" && delivery.epubGenerationStatus === "ready" && (
        <button disabled={loading} className="button button--primary" onClick={() => run("retry")}><Icon name="refresh" /> Retry failed delivery</button>
      )}
      {delivery.deliveryStatus === "sent" && (
        <button disabled={loading} className="button button--primary" onClick={() => run("resend")}><Icon name="send" /> Resend</button>
      )}
      <button disabled={loading || delivery.epubGenerationStatus === "generating"} className="button button--secondary" onClick={() => run("regenerate")}><Icon name="refresh" /> Regenerate EPUB</button>
      {notice && <p className="review-notice" role="status">{notice}</p>}
    </div>
  );
}
