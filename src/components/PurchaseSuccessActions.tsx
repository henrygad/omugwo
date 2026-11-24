"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { trackEvent } from "@/lib/analytics";

export function PurchaseSuccessActions({
  orderId,
  reference,
  editionName,
  amount,
}: {
  orderId: string;
  reference: string;
  editionName: string;
  amount: number;
}) {
  const [copied, setCopied] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://omugwoseries.vercel.app";
  const shareText =
    "I just ordered Omugwo: The Season Mother Came, a Nigerian family story about mothers, daughters, tradition, and family secrets.";

  useEffect(() => {
    const key = `omugwo_purchase_${reference}`;
    if (sessionStorage.getItem(key)) return;
    trackEvent("purchase", {
      transaction_id: reference,
      value: amount,
      currency: "NGN",
      item_name: editionName,
      order_id: orderId,
      items: [{ item_id: orderId, item_name: editionName, price: amount, quantity: 1 }],
    });
    sessionStorage.setItem(key, "tracked");
  }, [amount, editionName, orderId, reference]);

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: "Omugwo", text: shareText, url: siteUrl });
      trackEvent("share", { method: "web_share", content_type: "book" });
      return;
    }
    await copyLink();
  }

  async function copyLink() {
    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    trackEvent("share", { method: "copy_link", content_type: "book" });
  }

  return (
    <div className="purchase-share" aria-labelledby="purchase-share-title">
      <h2 id="purchase-share-title">Know someone who would enjoy Omugwo?</h2>
      <p>Share the book page without sharing any of your private order details.</p>
      <div>
        <button className="button button--primary" type="button" onClick={share}>
          <Icon name="send" /> Share the book
        </button>
        <a
          className="button button--secondary"
          href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${siteUrl}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("share", { method: "whatsapp", content_type: "book" })}
        >
          <Icon name="message" /> WhatsApp
        </a>
        <a
          className="button button--secondary"
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("share", { method: "facebook", content_type: "book" })}
        >
          <Icon name="send" /> Facebook
        </a>
        <button className="button button--secondary" type="button" onClick={copyLink}>
          <Icon name="book" /> {copied ? "Link copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

