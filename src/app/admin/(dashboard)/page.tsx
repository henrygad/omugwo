import Link from "next/link";
import { formatPrice } from "@/config/site";
import { getDashboardOverview } from "@/lib/admin-data";
import { Icon, type IconName } from "@/components/Icon";

export default async function AdminOverviewPage() {
  const overview = await getDashboardOverview();
  const cards: ReadonlyArray<readonly [string, string | number, IconName]> = [
    ["Total orders", overview.totalOrders, "orders"],
    ["Total sales", formatPrice(overview.totalSales), "money"],
    ["Successful payments", overview.paidOrders, "check"],
    ["Pending payments", overview.pendingPayments, "clock"],
    ["Pending reviews", overview.pendingReviews, "message"],
  ];
  return (
    <>
      <header className="admin-page-header"><div><p>Store overview</p><h1 className="icon-heading"><Icon name="dashboard" /> Dashboard</h1></div></header>
      <section className="admin-metrics">
        {cards.map(([label, value, icon]) => <article key={label}><span className="admin-metric-icon"><Icon name={icon} /></span><span>{label}</span><strong>{value}</strong></article>)}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading"><h2 className="icon-heading"><Icon name="clock" /> Recent orders</h2><Link className="icon-label" href="/admin/orders">View all <Icon name="arrow-right" /></Link></div>
        {overview.recentOrders.length === 0 ? <p className="admin-empty">No orders yet.</p> : (
          <div className="admin-table-wrap"><table><thead><tr><th>Reference</th><th>Customer</th><th>Edition</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            {overview.recentOrders.map((order) => <tr key={order.id}><td><Link href={`/admin/orders/${order.id}`}>{order.paystackReference}</Link></td><td>{order.customer.name ?? order.customer.email}</td><td>{order.editionName}</td><td>{formatPrice(order.amount)}</td><td><span className={`status status--${order.paymentStatus}`}>{order.paymentStatus}</span></td></tr>)}
          </tbody></table></div>
        )}
      </section>
    </>
  );
}
