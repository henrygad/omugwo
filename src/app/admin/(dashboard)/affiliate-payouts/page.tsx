import { AffiliatePayoutAction } from "@/components/admin/AffiliatePayoutAction";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/config/site";
import { listAllAffiliates, listAvailableCommissions } from "@/lib/affiliate/admin";
import { refreshAvailableCommissions } from "@/lib/affiliate/data";

export default async function AdminAffiliatePayoutsPage() {
  const affiliates = await listAllAffiliates();
  await Promise.all(affiliates.map((affiliate) => refreshAvailableCommissions(affiliate.id)));
  const commissions = await listAvailableCommissions();
  const groups = affiliates.map((affiliate) => ({ affiliate, commissions: commissions.filter((item) => item.affiliateId === affiliate.id) })).filter((group) => group.commissions.length > 0);
  return <><header className="admin-page-header"><div><p>Manual Friday payments</p><h1 className="icon-heading"><Icon name="money" /> Affiliate payouts</h1></div><span>{groups.length} affiliates ready</span></header><section className="admin-panel"><div className="admin-panel-heading"><h2>Available commissions</h2><p>Complete the bank transfer first, then record its reference here. Seven-day holds and reversals are applied before this queue.</p></div>{groups.length === 0 ? <p className="admin-empty">No affiliate earnings are ready for payout.</p> : <div className="admin-payout-list">{groups.map(({ affiliate, commissions: items }) => { const gross = items.reduce((total, item) => total + item.affiliateNetAmount, 0); const payout = Math.max(0, gross - (affiliate.negativeBalance ?? 0)); return <article key={affiliate.id}><div><span className="status status--available">Ready</span><h3>{affiliate.publicName}</h3><p>{affiliate.bankName ?? "Bank details missing"} · {affiliate.accountName ?? "—"} · {affiliate.accountNumber ? `•••• ${affiliate.accountNumber.slice(-4)}` : "—"}</p></div><dl><div><dt>Commissions</dt><dd>{items.length}</dd></div><div><dt>Gross</dt><dd>{formatPrice(gross)}</dd></div><div><dt>Reversal debt</dt><dd>{formatPrice(affiliate.negativeBalance ?? 0)}</dd></div><div><dt>Transfer</dt><dd>{formatPrice(payout)}</dd></div></dl><AffiliatePayoutAction affiliateId={affiliate.id} commissionIds={items.map((item) => item.id)} amount={payout} /></article>; })}</div>}</section></>;
}
