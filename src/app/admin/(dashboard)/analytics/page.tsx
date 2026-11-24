import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getVisitorAnalytics } from "@/lib/visitor-analytics";

export default async function AnalyticsPage() {
  const analytics = await getVisitorAnalytics();
  const cards = [
    ["Visitors today", analytics.visitorsToday],
    ["Visitors — 7 days", analytics.visitorsSevenDays],
    ["Visitors — 30 days", analytics.visitorsThirtyDays],
    ["Page views — 30 days", analytics.pageViewsThirtyDays],
    ["Checkout starts", analytics.checkoutStartsThirtyDays],
    ["Recorded purchases", analytics.purchasesThirtyDays],
    ["Book shares", analytics.sharesThirtyDays],
  ] as const;

  return (
    <>
      <header className="admin-page-header">
        <div><p>Audience</p><h1 className="icon-heading"><Icon name="eye" /> Visitor analytics</h1></div>
        <span>Consent-based records only</span>
      </header>
      <p className="admin-page-note">Ordinary visitors are anonymous. A visitor is linked to an order only after completing a recorded purchase.</p>
      <section className="admin-metrics">
        {cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}
      </section>
      <div className="admin-detail-grid admin-insight-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>Top visitor sources</h2></div>
          {analytics.topSources.length ? <dl className="admin-details">{analytics.topSources.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.count}</dd></div>)}</dl> : <p className="admin-empty">No consented visits recorded yet.</p>}
        </section>
        <section className="admin-panel">
          <div className="admin-panel-heading"><h2>Most viewed pages</h2></div>
          {analytics.topPaths.length ? <dl className="admin-details">{analytics.topPaths.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.count}</dd></div>)}</dl> : <p className="admin-empty">No page views recorded yet.</p>}
        </section>
      </div>
      <section className="admin-panel">
        <div className="admin-panel-heading"><h2>Recent anonymous visitors</h2><span>{analytics.capped ? "Showing recent records" : `${analytics.recentVisitors.length} recorded`}</span></div>
        {analytics.recentVisitors.length === 0 ? <p className="admin-empty">Visitor records will appear after deployment when someone accepts analytics.</p> : (
          <div className="admin-table-wrap"><table><thead><tr><th>Visitor</th><th>Source</th><th>Device</th><th>Pages</th><th>Last page</th><th>Last seen</th><th>Conversion</th></tr></thead><tbody>{analytics.recentVisitors.map((visitor) => <tr key={visitor.id}><td><code>{visitor.id.slice(0, 8)}</code><small>{visitor.sessionCount} session{visitor.sessionCount === 1 ? "" : "s"}</small></td><td>{visitor.source}<small>{visitor.campaign ?? visitor.medium ?? "—"}</small></td><td>{visitor.device}</td><td>{visitor.pageViews}</td><td>{visitor.lastPath}</td><td>{visitor.lastSeenAt ? new Date(visitor.lastSeenAt).toLocaleString("en-NG") : "—"}</td><td>{visitor.convertedOrderId ? <Link href={`/admin/orders/${visitor.convertedOrderId}`}>Purchased</Link> : visitor.linkedOrderId ? <Link href={`/admin/orders/${visitor.linkedOrderId}`}>Checkout order</Link> : "Anonymous visitor"}</td></tr>)}</tbody></table></div>
        )}
      </section>
      <section className="admin-panel">
        <div className="admin-panel-heading"><h2>Recent activity</h2></div>
        {analytics.recentEvents.length === 0 ? <p className="admin-empty">No visitor events recorded yet.</p> : <div className="admin-table-wrap"><table><thead><tr><th>Event</th><th>Page</th><th>Source</th><th>Device</th><th>Details</th><th>Time</th></tr></thead><tbody>{analytics.recentEvents.map((event) => <tr key={event.id}><td>{event.event.replaceAll("_", " ")}</td><td>{event.path}</td><td>{event.source}</td><td>{event.device}</td><td>{event.edition ?? event.method ?? (event.orderId ? <Link href={`/admin/orders/${event.orderId}`}>Order</Link> : "—")}</td><td>{event.createdAt ? new Date(event.createdAt).toLocaleString("en-NG") : "—"}</td></tr>)}</tbody></table></div>}
      </section>
    </>
  );
}

