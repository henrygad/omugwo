import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { DigitalDeliveryActions } from "@/components/admin/DigitalDeliveryActions";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/config/site";
import { getDigitalDelivery } from "@/lib/digital-deliveries";

export default async function DigitalDeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const delivery = await getDigitalDelivery(id);
  if (!delivery) notFound();
  return (
    <>
      <header className="admin-page-header"><div><p>Digital delivery</p><h1>{delivery.orderReference}</h1></div><span className={`status status--${delivery.deliveryStatus}`}>{delivery.deliveryStatus.replaceAll("_", " ")}</span></header>
      <div className="admin-detail-grid">
        <section className="admin-panel"><h2>Recipient</h2><dl className="admin-details"><div><dt>Name</dt><dd>{delivery.buyerName}</dd></div><div><dt>Email</dt><dd>{delivery.buyerEmail}</dd></div><div><dt>Type</dt><dd>{delivery.fulfilmentType}</dd></div>{delivery.administratorNote && <div><dt>Admin note</dt><dd>{delivery.administratorNote}</dd></div>}</dl></section>
        <section className="admin-panel"><h2>Source</h2><dl className="admin-details">{delivery.orderId && <div><dt>Order</dt><dd><Link href={`/admin/orders/${delivery.orderId}`}>Open order</Link></dd></div>}<div><dt>Payment reference</dt><dd>{delivery.paymentReference ?? "Complimentary"}</dd></div><div><dt>Amount</dt><dd>{delivery.fulfilmentType === "paid" ? formatPrice(delivery.amount) : "Free"}</dd></div><div><dt>Created</dt><dd>{delivery.createdAt ? new Date(delivery.createdAt).toLocaleString("en-NG") : "—"}</dd></div></dl></section>
        <section className="admin-panel"><h2>Personalized EPUB</h2><dl className="admin-details"><div><dt>Generation</dt><dd>{delivery.epubGenerationStatus.replaceAll("_", " ")}</dd></div><div><dt>Generation number</dt><dd>{delivery.generationNumber}</dd></div><div><dt>File</dt><dd>{delivery.generatedFileName ?? "Not generated"}</dd></div><div><dt>Generated</dt><dd>{delivery.generatedAt ? new Date(delivery.generatedAt).toLocaleString("en-NG") : "—"}</dd></div></dl></section>
        <section className="admin-panel"><h2>Email delivery</h2><dl className="admin-details"><div><dt>Status</dt><dd>{delivery.deliveryStatus.replaceAll("_", " ")}</dd></div><div><dt>Approved by</dt><dd>{delivery.approvedBy ?? "Not approved"}</dd></div><div><dt>Sent</dt><dd>{delivery.sentAt ? new Date(delivery.sentAt).toLocaleString("en-NG") : "Not sent"}</dd></div><div><dt>Message ID</dt><dd>{delivery.emailMessageId ?? "—"}</dd></div></dl>{delivery.lastDeliveryError && <p className="field-error">{delivery.lastDeliveryError}</p>}</section>
      </div>
      <section className="admin-panel admin-delivery-command"><h2 className="icon-heading"><Icon name="shield" /> Administrator approval</h2><p className="admin-help">No book is sent automatically. Review the personalized EPUB, confirm the recipient, then explicitly choose Send EPUB.</p><DigitalDeliveryActions delivery={delivery} /></section>
    </>
  );
}
