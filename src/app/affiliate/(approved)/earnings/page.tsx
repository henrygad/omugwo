import type { Metadata } from "next";
import { formatPrice } from "@/config/site";
import { listAffiliateCommissions, refreshAvailableCommissions } from "@/lib/affiliate/data";
import { requireApprovedAffiliatePage } from "@/lib/page-auth";

export const metadata: Metadata = { title: "Earnings | Omugwo Affiliate", robots: { index: false, follow: false } };

function saleReference(orderId: string) {
  return `SALE-${orderId.slice(-8).toUpperCase()}`;
}

export default async function AffiliateEarningsPage() {
  const { session } = await requireApprovedAffiliatePage();
  await refreshAvailableCommissions(session.uid);
  const commissions = await listAffiliateCommissions(session.uid);
  const sum = (status: string) => commissions.filter((item) => item.status === status).reduce((total, item) => total + item.affiliateNetAmount, 0);
  return <><header className="affiliate-page-header"><div><p>Commission ledger</p><h1>Your verified earnings.</h1></div></header><section className="affiliate-stats affiliate-stats--three"><article><span>Waiting seven days</span><strong>{formatPrice(sum("pending"))}</strong></article><article><span>Next Friday payout</span><strong>{formatPrice(sum("available"))}</strong></article><article><span>Total paid</span><strong>{formatPrice(sum("paid"))}</strong></article></section><section className="affiliate-panel"><div className="affiliate-panel-heading"><div><p>Every recorded sale</p><h2>Commission history</h2></div><span>{commissions.length}</span></div>{commissions.length === 0 ? <p className="affiliate-empty">Paid sales from your links will appear here.</p> : <div className="affiliate-table-wrap"><table><thead><tr><th>Sale reference</th><th>Date</th><th>Edition</th><th>Sale</th><th>Your earning</th><th>Status</th></tr></thead><tbody>{commissions.map((item) => <tr key={item.id}><td data-label="Sale reference"><code className="affiliate-sale-reference">{saleReference(item.orderId)}</code></td><td data-label="Date">{new Date(item.createdAt).toLocaleDateString("en-NG")}</td><td data-label="Edition">{item.edition}</td><td data-label="Sale">{formatPrice(item.saleAmount)}</td><td data-label="Your earning">{formatPrice(item.affiliateNetAmount)}</td><td data-label="Status"><span className={`affiliate-status affiliate-status--${item.status}`}>{item.status}</span></td></tr>)}</tbody></table></div>}</section></>;
}
