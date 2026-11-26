"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/config/site";
import type { AffiliateOffer } from "@/types/commerce";

export function OfferManager({ offers, siteUrl }: { offers: AffiliateOffer[]; siteUrl: string }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setCreating(true);
    setNotice("");
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/affiliate/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.get("title"), digitalPrice: form.get("digitalPrice"), paperbackPrice: form.get("paperbackPrice") }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Offer could not be created.");
      formElement.reset();
      setNoticeTone("success");
      setNotice("Your new offer link is ready.");
      router.refresh();
    } catch (error) {
      setNoticeTone("error");
      setNotice(error instanceof Error ? error.message : "Offer could not be created.");
    } finally {
      setCreating(false);
    }
  }

  async function toggle(offer: AffiliateOffer) {
    setBusyOfferId(offer.id);
    setNotice("");
    try {
      const response = await fetch(`/api/affiliate/offers/${offer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !offer.active }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Offer could not be updated.");
      setNoticeTone("success");
      setNotice(offer.active ? "Offer paused." : "Offer reactivated.");
      router.refresh();
    } catch (error) {
      setNoticeTone("error");
      setNotice(error instanceof Error ? error.message : "Offer could not be updated.");
    } finally {
      setBusyOfferId(null);
    }
  }

  async function remove(offer: AffiliateOffer) {
    if (offer.paidSales > 0) {
      setNoticeTone("error");
      setNotice("Offers with recorded sales cannot be deleted. Pause this offer instead.");
      return;
    }
    if (!window.confirm(`Delete “${offer.title}”? Its link will stop working immediately.`)) return;

    setBusyOfferId(offer.id);
    setNotice("");
    try {
      const response = await fetch(`/api/affiliate/offers/${offer.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Offer could not be deleted.");
      setNoticeTone("success");
      setNotice("Offer link deleted.");
      router.refresh();
    } catch (error) {
      setNoticeTone("error");
      setNotice(error instanceof Error ? error.message : "Offer could not be deleted.");
    } finally {
      setBusyOfferId(null);
    }
  }

  async function copy(code: string) {
    const offer = offers.find((item) => item.code === code);
    try {
      await navigator.clipboard.writeText(`${siteUrl}/r/${code}`);
      setCopiedOfferId(offer?.id ?? null);
      setNoticeTone("success");
      setNotice("Affiliate link copied to your clipboard.");
      window.setTimeout(() => setCopiedOfferId((current) => current === offer?.id ? null : current), 2200);
    } catch {
      setNoticeTone("error");
      setNotice("The link could not be copied. Select the link and copy it manually.");
    }
  }

  return (
    <>
      <section className="affiliate-panel">
        <div className="affiliate-panel-heading"><div><p>Create an offer</p><h2>Choose both customer prices</h2></div><Icon name="money" /></div>
        <p className="affiliate-help">Each offer keeps its original prices. Create another link whenever you want to promote a different price.</p>
        <form className="affiliate-offer-form" onSubmit={create}>
          <label><span><Icon name="star" /> Offer title</span><input name="title" required minLength={2} maxLength={80} placeholder="WhatsApp launch offer" /></label>
          <label><span><Icon name="money" /> Digital price (₦2,000–₦5,000)</span><input name="digitalPrice" type="number" min="2000" max="5000" step="1" defaultValue="3000" required /></label>
          <label><span><Icon name="book" /> Paperback price (₦5,000–₦10,000)</span><input name="paperbackPrice" type="number" min="5000" max="10000" step="1" defaultValue="7000" required /></label>
          <button className="button button--primary" disabled={creating}>{creating ? <><Icon name="refresh" /> Creating…</> : <><Icon name="send" /> Create secure link</>}</button>
        </form>
      </section>
      <section className="affiliate-panel">
        <div className="affiliate-panel-heading"><div><p>Your campaigns</p><h2>Offer links</h2></div><span>{offers.length}</span></div>
        {offers.length === 0 ? <p className="affiliate-empty">Create your first offer to begin sharing Omugwo.</p> : <div className="affiliate-offer-list">
          {offers.map((offer) => <article key={offer.id} className={!offer.active ? "is-inactive" : ""}>
            <div><span className={`affiliate-status affiliate-status--${offer.active ? "approved" : "suspended"}`}>{offer.active ? "Active" : "Paused"}</span><h3>{offer.title}</h3><p>Digital {formatPrice(offer.digitalPrice)} · Paperback {formatPrice(offer.paperbackPrice)}</p></div>
            <div className="affiliate-offer-metrics"><span><strong>{offer.clicks}</strong> Clicks</span><span><strong>{offer.checkouts}</strong> Checkouts</span><span><strong>{offer.paidSales}</strong> Sales</span></div>
            <code>{siteUrl}/r/{offer.code}</code>
            <div className="affiliate-offer-actions"><button className={copiedOfferId === offer.id ? "is-copied" : ""} type="button" onClick={() => copy(offer.code)}>{copiedOfferId === offer.id ? <><Icon name="check" /> Copied!</> : <><Icon name="send" /> Copy link</>}</button><button type="button" onClick={() => toggle(offer)} disabled={busyOfferId === offer.id}><Icon name={offer.active ? "clock" : "refresh"} /> {busyOfferId === offer.id ? "Working…" : offer.active ? "Pause" : "Reactivate"}</button><button className="affiliate-delete-offer" type="button" onClick={() => remove(offer)} disabled={busyOfferId === offer.id || offer.paidSales > 0} title={offer.paidSales > 0 ? "Offers with sales must be kept for financial records." : "Delete this offer link"}><Icon name="trash" /> Delete</button></div>
          </article>)}
        </div>}
      </section>
      {notice && <p className="affiliate-action-toast" data-tone={noticeTone} role={noticeTone === "error" ? "alert" : "status"}><Icon name={noticeTone === "error" ? "x" : "check"} /> {notice}</p>}
    </>
  );
}
