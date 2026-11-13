import Link from "next/link";
import { connection } from "next/server";
import { ComplimentaryCopyForm } from "@/components/admin/DigitalDeliveryActions";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/config/site";
import { listDigitalDeliveries } from "@/lib/digital-deliveries";

const filters = [
  ["All", ""],
  ["Awaiting approval", "awaiting_approval"],
  ["Ready to send", "ready_to_send"],
  ["Sent", "sent"],
  ["Failed", "failed"],
  ["Complimentary", "complimentary"],
] as const;

export default async function DigitalDeliveriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await connection();
  const { status } = await searchParams;
  const deliveries = await listDigitalDeliveries(status);
  return (
    <>
      <header className="admin-page-header"><div><p>Manual approval only</p><h1 className="icon-heading"><Icon name="send" /> Digital Deliveries</h1></div></header>
      <nav className="admin-tabs admin-tabs--wrap" aria-label="Delivery filters">
        {filters.map(([label, value]) => <Link key={label} href={value ? `/admin/deliveries?status=${value}` : "/admin/deliveries"}>{label}</Link>)}
      </nav>
      <section className="admin-panel">
        <div className="admin-table-wrap"><table><thead><tr><th>Recipient</th><th>Reference</th><th>Type</th><th>Amount</th><th>EPUB</th><th>Delivery</th><th>Created</th></tr></thead><tbody>
          {deliveries.map((delivery) => <tr key={delivery.id}><td><Link href={`/admin/deliveries/${delivery.id}`}>{delivery.buyerName}</Link><small>{delivery.buyerEmail}</small></td><td>{delivery.orderReference}</td><td>{delivery.fulfilmentType}</td><td>{delivery.fulfilmentType === "paid" ? formatPrice(delivery.amount) : "Free"}</td><td><span className={`status status--${delivery.epubGenerationStatus}`}>{delivery.epubGenerationStatus.replaceAll("_", " ")}</span></td><td><span className={`status status--${delivery.deliveryStatus}`}>{delivery.deliveryStatus.replaceAll("_", " ")}</span></td><td>{delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString("en-NG") : "—"}</td></tr>)}
          {deliveries.length === 0 && <tr><td colSpan={7}>No digital deliveries in this view.</td></tr>}
        </tbody></table></div>
      </section>
      <ComplimentaryCopyForm />
    </>
  );
}
