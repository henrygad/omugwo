import Link from "next/link";
import { notFound } from "next/navigation";
import { AffiliateModerationAction } from "@/components/admin/AffiliateModerationAction";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/config/site";
import { getAffiliateAdminDetails } from "@/lib/affiliate/admin";
import type { CommissionStatus } from "@/types/commerce";

function formatDate(value: string) {
  return value ? new Date(value).toLocaleString("en-NG") : "Not recorded";
}

function saleReference(orderId: string) {
  return `SALE-${orderId.slice(-8).toUpperCase()}`;
}

export default async function AffiliateDetailPage({ params }: PageProps<"/admin/affiliates/[id]">) {
  const { id } = await params;
  const details = await getAffiliateAdminDetails(id);
  if (!details) notFound();

  const { profile, offers, commissions } = details;
  const earnings = commissions.reduce<Record<CommissionStatus, number>>(
    (totals, commission) => ({
      ...totals,
      [commission.status]: totals[commission.status] + commission.affiliateNetAmount,
    }),
    { pending: 0, available: 0, paid: 0, reversed: 0 },
  );
  const totalClicks = offers.reduce((total, offer) => total + offer.clicks, 0);
  const totalCheckouts = offers.reduce((total, offer) => total + offer.checkouts, 0);
  const totalSales = offers.reduce((total, offer) => total + offer.paidSales, 0);

  return (
    <>
      <header className="admin-page-header">
        <div>
          <p><Link href="/admin/affiliates">Affiliates</Link> / Profile</p>
          <h1 className="icon-heading"><Icon name="user" /> {profile.publicName || profile.fullName}</h1>
        </div>
        <span className={`status status--${profile.status}`}>{profile.status}</span>
      </header>

      <section className="admin-metrics admin-metrics--compact">
        <article><span>Offers</span><strong>{offers.length}</strong></article>
        <article><span>Link clicks</span><strong>{totalClicks}</strong></article>
        <article><span>Checkouts</span><strong>{totalCheckouts}</strong></article>
        <article><span>Paid sales</span><strong>{totalSales}</strong></article>
      </section>

      <div className="admin-detail-grid admin-affiliate-detail-grid">
        <section className="admin-panel">
          <h2>Personal details</h2>
          <dl className="admin-details">
            <div><dt>Full name</dt><dd>{profile.fullName || "Not provided"}</dd></div>
            <div><dt>Public name</dt><dd>{profile.publicName || "Not provided"}</dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
            <div><dt>Phone</dt><dd>{profile.phone ? <a href={`tel:${profile.phone}`}>{profile.phone}</a> : "Not provided"}</dd></div>
            <div><dt>Affiliate ID</dt><dd><code>{profile.id}</code></dd></div>
            <div><dt>Terms version</dt><dd>{profile.termsVersion ?? "Not recorded"}</dd></div>
            <div><dt>Terms accepted</dt><dd>{formatDate(profile.termsAcceptedAt ?? "")}</dd></div>
            <div><dt>Joined</dt><dd>{formatDate(profile.createdAt)}</dd></div>
            <div><dt>Last updated</dt><dd>{formatDate(profile.updatedAt)}</dd></div>
          </dl>
        </section>

        <section className="admin-panel">
          <h2>Bank and account status</h2>
          <dl className="admin-details">
            <div><dt>Bank</dt><dd>{profile.bankName ?? "Not provided"}</dd></div>
            <div><dt>Account name</dt><dd>{profile.accountName ?? "Not provided"}</dd></div>
            <div><dt>Account number</dt><dd>{profile.accountNumber ?? "Not provided"}</dd></div>
            <div><dt>Reversal debt</dt><dd>{formatPrice(profile.negativeBalance ?? 0)}</dd></div>
            <div><dt>Current status</dt><dd><span className={`status status--${profile.status}`}>{profile.status}</span></dd></div>
          </dl>
          <AffiliateModerationAction affiliateId={profile.id} currentStatus={profile.status} />
        </section>
      </div>

      <section className="admin-panel admin-affiliate-section">
        <div className="admin-panel-heading">
          <div><h2>Marketing application</h2><p>The plan submitted during affiliate onboarding.</p></div>
        </div>
        <p className="admin-application-copy">{profile.marketingDetails || "No marketing plan was provided."}</p>
      </section>

      <section className="admin-panel admin-affiliate-section">
        <div className="admin-panel-heading">
          <div><h2>Email communications</h2><p>Delivery status for important affiliate lifecycle emails.</p></div>
        </div>
        <dl className="admin-details">
          <div><dt>Application received email</dt><dd>{profile.applicationEmailSentAt ? `Sent ${formatDate(profile.applicationEmailSentAt)}` : profile.applicationEmailError ? "Failed to send" : "Not recorded"}</dd></div>
          {profile.applicationEmailError && <div><dt>Application email error</dt><dd>{profile.applicationEmailError}</dd></div>}
          <div><dt>Latest account-status email</dt><dd>{profile.statusEmailSentAt ? `Sent ${formatDate(profile.statusEmailSentAt)}` : profile.statusEmailError ? "Failed to send" : "Not sent yet"}</dd></div>
          {profile.statusEmailError && <div><dt>Status email error</dt><dd>{profile.statusEmailError}</dd></div>}
        </dl>
      </section>

      <section className="admin-panel admin-affiliate-section">
        <div className="admin-panel-heading">
          <div><h2>Sales links and prices</h2><p>Every price link created by this affiliate.</p></div>
          <span>{offers.length} total</span>
        </div>
        {offers.length === 0 ? <p className="admin-empty">This affiliate has not created an offer yet.</p> : (
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>Offer</th><th>Digital</th><th>Paperback</th><th>Activity</th><th>Results</th><th>Created</th></tr></thead>
              <tbody>{offers.map((offer) => (
                <tr key={offer.id}>
                  <td><strong>{offer.title}</strong><small><a href={`/r/${offer.code}`} target="_blank" rel="noreferrer">/r/{offer.code}</a></small></td>
                  <td>{formatPrice(offer.digitalPrice)}</td>
                  <td>{formatPrice(offer.paperbackPrice)}</td>
                  <td><span className={`status status--${offer.active ? "approved" : "suspended"}`}>{offer.active ? "Active" : "Inactive"}</span></td>
                  <td>{offer.paidSales} sales<small>{offer.clicks} clicks · {offer.checkouts} checkouts</small></td>
                  <td>{formatDate(offer.createdAt)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-panel admin-affiliate-section">
        <div className="admin-panel-heading">
          <div><h2>Earnings and commissions</h2><p>Sales, holds, available earnings, payments, and reversals.</p></div>
          <span>{commissions.length} records</span>
        </div>
        <div className="admin-earning-summary">
          <div><span>Pending</span><strong>{formatPrice(earnings.pending)}</strong></div>
          <div><span>Available</span><strong>{formatPrice(earnings.available)}</strong></div>
          <div><span>Paid</span><strong>{formatPrice(earnings.paid)}</strong></div>
          <div><span>Reversed</span><strong>{formatPrice(earnings.reversed)}</strong></div>
        </div>
        {commissions.length === 0 ? <p className="admin-empty">No affiliate commissions have been recorded.</p> : (
          <div className="admin-table-wrap">
            <table>
              <thead><tr><th>Sale</th><th>Edition</th><th>Customer paid</th><th>Affiliate earning</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{commissions.map((commission) => (
                <tr key={commission.id}>
                  <td><Link href={`/admin/orders/${commission.orderId}`}>{saleReference(commission.orderId)}</Link></td>
                  <td>{commission.edition}</td>
                  <td>{formatPrice(commission.saleAmount)}</td>
                  <td>{formatPrice(commission.affiliateNetAmount)}</td>
                  <td><span className={`status status--${commission.status}`}>{commission.status}</span></td>
                  <td>{formatDate(commission.createdAt)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
