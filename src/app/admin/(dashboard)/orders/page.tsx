import Link from "next/link";
import { formatPrice } from "@/config/site";
import { listOrders } from "@/lib/admin-data";
import { Icon } from "@/components/Icon";

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const result = await listOrders({
    search: query.search,
    payment: query.payment,
    fulfillment: query.fulfillment,
    edition: query.edition,
    page: Number(query.page ?? 1),
  });
  return (
    <>
      <header className="admin-page-header"><div><p>Commerce</p><h1 className="icon-heading"><Icon name="orders" /> Orders</h1></div><span>{result.total} records{result.capped ? "+" : ""}</span></header>
      <form className="admin-filters">
        <label className="admin-filter-field"><span><Icon name="search" /> Search</span><input name="search" defaultValue={query.search} placeholder="Order, customer, or email" /></label>
        <label className="admin-filter-field"><span><Icon name="money" /> Payment</span><select name="payment" defaultValue={query.payment ?? ""}><option value="">All payments</option><option value="paid">Paid</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="abandoned">Abandoned</option></select></label>
        <label className="admin-filter-field"><span><Icon name="truck" /> Fulfilment</span><select name="fulfillment" defaultValue={query.fulfillment ?? ""}><option value="">All fulfilment</option><option value="unfulfilled">Unfulfilled</option><option value="processing">Processing</option><option value="fulfilled">Fulfilled</option><option value="cancelled">Cancelled</option></select></label>
        <label className="admin-filter-field"><span><Icon name="book" /> Edition</span><select name="edition" defaultValue={query.edition ?? ""}><option value="">All editions</option><option value="digital">Digital</option><option value="paperback">Paperback</option></select></label>
        <button><Icon name="filter" /> Filter</button>
      </form>
      <section className="admin-panel">
        {result.items.length === 0 ? <p className="admin-empty">No matching orders.</p> : <div className="admin-table-wrap"><table><thead><tr><th>Reference</th><th>Customer</th><th>Edition</th><th>Amount</th><th>Payment</th><th>Fulfilment</th><th>Date</th></tr></thead><tbody>
          {result.items.map((order) => <tr key={order.id}><td><Link href={`/admin/orders/${order.id}`}>{order.paystackReference}</Link></td><td>{order.customer.name ?? "—"}<small>{order.customer.email}</small></td><td>{order.editionName}</td><td>{formatPrice(order.amount)}</td><td><span className={`status status--${order.paymentStatus}`}>{order.paymentStatus}</span></td><td>{order.fulfillmentStatus}</td><td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-NG") : "—"}</td></tr>)}
        </tbody></table></div>}
        <nav className="admin-pagination" aria-label="Order pages">{result.page > 1 && <Link className="icon-label" href={{ query: { ...query, page: result.page - 1 } }}><Icon name="arrow-left" /> Previous</Link>}<span>Page {result.page} of {result.pages}</span>{result.page < result.pages && <Link className="icon-label" href={{ query: { ...query, page: result.page + 1 } }}>Next <Icon name="arrow-right" /></Link>}</nav>
      </section>
    </>
  );
}
