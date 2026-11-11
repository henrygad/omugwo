"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FulfillmentStatus } from "@/types/commerce";
import { Icon } from "@/components/Icon";

export function FulfillmentControl({
  orderId,
  current,
}: {
  orderId: string;
  current: FulfillmentStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function update(status: FulfillmentStatus) {
    if (!window.confirm(`Change fulfilment status to ${status}?`)) return;
    setLoading(true);
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (response.ok) router.refresh();
    else window.alert("The order could not be updated.");
  }

  return (
    <label className="admin-select-field">
      <span><Icon name="truck" /> Fulfilment status</span>
      <select value={current} disabled={loading} onChange={(event) => update(event.target.value as FulfillmentStatus)}>
        <option value="unfulfilled">Unfulfilled</option>
        <option value="processing">Processing</option>
        <option value="fulfilled">Fulfilled</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </label>
  );
}

export function ReviewActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function moderate(status: "approved" | "rejected") {
    if (!window.confirm(`${status === "approved" ? "Approve" : "Reject"} this review?`)) return;
    setLoading(true);
    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (response.ok) router.refresh();
    else window.alert("The review could not be updated.");
  }

  return (
    <div className="admin-actions">
      <button disabled={loading} onClick={() => moderate("approved")}><Icon name="check" /> Approve</button>
      <button disabled={loading} onClick={() => moderate("rejected")}><Icon name="x" /> Reject</button>
    </div>
  );
}
