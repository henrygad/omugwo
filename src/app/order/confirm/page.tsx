import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { formatPrice } from "@/config/site";
import { verifyAndApplyPayment } from "@/lib/orders";
import { Icon } from "@/components/Icon";

export const metadata: Metadata = {
  title: "Order confirmation | Omugwo",
  robots: { index: false, follow: false },
};
export const instant = false;

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  await connection();
  const parameters = await searchParams;
  const reference = parameters.reference ?? parameters.trxref;
  let order:
    | {
        id: string;
        paymentStatus?: string;
        paystackReference?: string;
        editionName?: string;
        amount?: number;
      }
    | undefined;
  let error = "";

  if (!reference) {
    error = "No payment reference was supplied.";
  } else {
    try {
      order = await verifyAndApplyPayment(reference);
    } catch {
      error =
        "We could not verify this payment yet. If you were charged, keep your reference and contact us.";
    }
  }

  const paid = order?.paymentStatus === "paid";

  return (
    <main className="confirmation-page">
      <section className="confirmation-card" aria-live="polite">
        <span className={`confirmation-mark ${paid ? "is-paid" : ""}`} aria-hidden="true">
          <Icon name={paid ? "check" : "clock"} />
        </span>
        <p className="section-index">Order confirmation</p>
        <h1>{paid ? "Your payment is confirmed." : "Payment not confirmed."}</h1>
        <p>
          {paid
            ? "Thank you for choosing Omugwo. We have recorded your order and will use the details you supplied for fulfilment."
            : error || "The transaction is still pending or was not completed."}
        </p>
        {order && (
          <dl className="confirmation-summary">
            <div><dt>Reference</dt><dd>{order.paystackReference}</dd></div>
            <div><dt>Edition</dt><dd>{order.editionName}</dd></div>
            <div><dt>Amount</dt><dd>{formatPrice(Number(order.amount ?? 0))}</dd></div>
            <div><dt>Status</dt><dd>{order.paymentStatus}</dd></div>
          </dl>
        )}
        <div className="confirmation-actions">
          <Link className="button button--primary" href="/"><Icon name="arrow-left" /> Return to Omugwo</Link>
          {!paid && reference && (
            <Link
              className="button button--secondary"
              href={`/order/confirm?reference=${encodeURIComponent(reference)}`}
            >
              <Icon name="refresh" /> Check again
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
