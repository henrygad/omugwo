import Link from "next/link";
import { formatPrice } from "@/config/site";
import { Icon } from "@/components/Icon";
import { PaymentRecoveryAction } from "@/components/admin/PaymentRecoveryAction";
import { listPaymentRecoveryOrders } from "@/lib/admin-data";

export default async function PaymentRecoveryPage() {
  const orders = await listPaymentRecoveryOrders();
  const failed = orders.filter((order) =>
    ["failed", "abandoned"].includes(order.paymentStatus),
  );
  const pending = orders.filter((order) => order.paymentStatus === "pending");

  return (
    <>
      <header className="admin-page-header">
        <div>
          <p>Sales follow-up</p>
          <h1 className="icon-heading"><Icon name="refresh" /> Payment recovery</h1>
        </div>
        <span>{failed.length} ready for review</span>
      </header>
      <section className="admin-metrics admin-metrics--compact">
        <article><span>Failed or abandoned</span><strong>{failed.length}</strong></article>
        <article><span>Still pending</span><strong>{pending.length}</strong></article>
        <article><span>Recovery emails sent</span><strong>{orders.filter((order) => order.recoveryEmailStatus === "sent").length}</strong></article>
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Failed and abandoned payments</h2>
            <p>Every manual email rechecks Paystack before it is sent.</p>
          </div>
        </div>
        {failed.length === 0 ? <p className="admin-empty">No failed payments need attention.</p> : (
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>Order</th><th>Customer</th><th>Edition</th><th>Amount</th><th>Payment</th><th>Email</th><th>Action</th></tr></thead>
              <tbody>
                {failed.map((order) => (
                  <tr key={order.id}>
                    <td><Link href={`/admin/orders/${order.id}`}>{order.paystackReference}</Link><small>{order.createdAt ? new Date(order.createdAt).toLocaleString("en-NG") : "—"}</small></td>
                    <td>{order.customer.name ?? "Reader"}<small>{order.customer.email}</small></td>
                    <td>{order.editionName}</td>
                    <td>{formatPrice(order.amount)}</td>
                    <td><span className={`status status--${order.paymentStatus}`}>{order.paymentStatus}</span></td>
                    <td>{order.recoveryEmailStatus ?? "Not sent"}{order.recoveryEmailSentAt && <small>{new Date(order.recoveryEmailSentAt).toLocaleString("en-NG")}</small>}</td>
                    <td><PaymentRecoveryAction orderId={order.id} customerEmail={order.customer.email} alreadySent={order.recoveryEmailStatus === "sent"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {pending.length > 0 && (
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>Payments still pending</h2></div>
          <p className="admin-help">These orders are not eligible for recovery email until Paystack reports a final failed or abandoned status.</p>
          <div className="admin-table-wrap"><table><thead><tr><th>Reference</th><th>Customer</th><th>Edition</th><th>Date</th></tr></thead><tbody>{pending.map((order) => <tr key={order.id}><td><Link href={`/admin/orders/${order.id}`}>{order.paystackReference}</Link></td><td>{order.customer.name ?? "Reader"}<small>{order.customer.email}</small></td><td>{order.editionName}</td><td>{order.createdAt ? new Date(order.createdAt).toLocaleString("en-NG") : "—"}</td></tr>)}</tbody></table></div>
        </section>
      )}
    </>
  );
}

