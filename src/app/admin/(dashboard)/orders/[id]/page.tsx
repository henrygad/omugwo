import { notFound } from "next/navigation";
import { FulfillmentControl } from "@/components/admin/AdminActions";
import { formatPrice } from "@/config/site";
import { getOrder } from "@/lib/admin-data";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  return (
    <>
      <header className="admin-page-header"><div><p>Order</p><h1>{order.paystackReference}</h1></div><span className={`status status--${order.paymentStatus}`}>{order.paymentStatus}</span></header>
      <div className="admin-detail-grid">
        <section className="admin-panel"><h2>Order details</h2><dl className="admin-details"><div><dt>Edition</dt><dd>{order.editionName}</dd></div><div><dt>Amount</dt><dd>{formatPrice(order.amount)}</dd></div><div><dt>Payment</dt><dd>{order.paymentStatus}</dd></div><div><dt>Paystack transaction</dt><dd>{order.paystackTransactionId ?? "Not verified"}</dd></div><div><dt>Fulfilment</dt><dd><FulfillmentControl orderId={order.id} current={order.fulfillmentStatus} /></dd></div></dl></section>
        <section className="admin-panel"><h2>Customer</h2><dl className="admin-details"><div><dt>Name</dt><dd>{order.customer.name ?? "—"}</dd></div><div><dt>Email</dt><dd>{order.customer.email}</dd></div><div><dt>Phone</dt><dd>{order.customer.phone ?? "—"}</dd></div><div><dt>Country</dt><dd>{order.customer.country ?? "—"}</dd></div><div><dt>State</dt><dd>{order.customer.state ?? "—"}</dd></div><div><dt>City</dt><dd>{order.customer.city ?? "—"}</dd></div><div><dt>Street address</dt><dd>{order.customer.address ?? "Digital delivery"}</dd></div></dl></section>
      </div>
    </>
  );
}
