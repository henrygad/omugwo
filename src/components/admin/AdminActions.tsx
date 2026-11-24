"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FulfillmentStatus } from "@/types/commerce";
import { Icon } from "@/components/Icon";
import type { EditionId } from "@/config/site";

export function FulfillmentControl({
  orderId,
  current,
  edition,
  currentTracking = "",
  currentNote = "",
}: {
  orderId: string;
  current: FulfillmentStatus;
  edition: EditionId;
  currentTracking?: string;
  currentNote?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(currentTracking);
  const [note, setNote] = useState(currentNote);

  async function update(status: FulfillmentStatus) {
    if (!window.confirm(`Change fulfilment status to ${status}?`)) return;
    setLoading(true);
    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber, note }),
    });
    setLoading(false);
    if (response.ok) router.refresh();
    else window.alert("The order could not be updated.");
  }

  const paperback = edition === "paperback";
  return (
    <div className="admin-fulfillment-control">
      {paperback && (
        <>
          <label className="admin-select-field">
            <span><Icon name="truck" /> Tracking or dispatch reference</span>
            <input value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} placeholder="Optional" />
          </label>
          <label className="admin-select-field">
            <span><Icon name="message" /> Customer update note</span>
            <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional delivery note" />
          </label>
        </>
      )}
      <label className="admin-select-field">
        <span><Icon name="truck" /> Fulfilment status</span>
        <select value={current} disabled={loading} onChange={(event) => update(event.target.value as FulfillmentStatus)}>
          {paperback ? (
            <>
              <option value="unfulfilled">Unfulfilled (legacy)</option>
              <option value="preorder_received">Preorder received</option>
              <option value="printing">Printing</option>
              <option value="ready_for_dispatch">Ready for dispatch</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </>
          ) : (
            <>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="processing">Processing</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </>
          )}
        </select>
      </label>
    </div>
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
