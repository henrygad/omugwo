import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AffiliateShell } from "@/components/affiliate/AffiliateShell";
import { AffiliateApplicationStatus } from "@/components/affiliate/AffiliateApplicationStatus";
import { Icon } from "@/components/Icon";
import { formatPrice } from "@/config/site";
import { getAffiliateProfile, listAffiliateCommissions, listAffiliateOffers, refreshAvailableCommissions } from "@/lib/affiliate/data";
import { getAffiliateSession } from "@/lib/firebase/auth";

export const metadata: Metadata = { title: "Affiliate dashboard | Omugwo", robots: { index: false, follow: false } };
export const instant = false;

export default async function AffiliateDashboardPage() {
  const session = await getAffiliateSession();
  if (!session) redirect("/affiliate/login");
  const profile = await getAffiliateProfile(session.uid);
  if (!profile) redirect("/affiliate/onboarding");
  if (profile.status !== "approved") return <main className="affiliate-status-page"><Link className="affiliate-auth-brand" href="/"><span className="brand-mark">O</span><span><strong>Omugwo</strong><small>Affiliate Programme</small></span></Link><AffiliateApplicationStatus status={profile.status} /></main>;
  await refreshAvailableCommissions(session.uid);
  const [offers, commissions] = await Promise.all([listAffiliateOffers(session.uid), listAffiliateCommissions(session.uid)]);
  const sum = (status: string) => commissions.filter((item) => item.status === status).reduce((total, item) => total + item.affiliateNetAmount, 0);
  return <AffiliateShell publicName={profile.publicName}><header className="affiliate-page-header"><div><p>Affiliate overview</p><h1>Good to see you, {profile.publicName}.</h1></div><Link className="button button--primary" href="/affiliate/offers"><Icon name="send" /> Create an offer</Link></header>{Boolean(profile.negativeBalance) && <section className="affiliate-debt-notice"><Icon name="refresh" /><div><strong>Reversal balance: {formatPrice(profile.negativeBalance ?? 0)}</strong><p>This amount will be cleared from future available earnings before another cash payout.</p></div></section>}<section className="affiliate-stats"><article><Icon name="send" /><span>Active offers</span><strong>{offers.filter((offer) => offer.active).length}</strong></article><article><Icon name="clock" /><span>Pending earnings</span><strong>{formatPrice(sum("pending"))}</strong></article><article><Icon name="money" /><span>Available</span><strong>{formatPrice(sum("available"))}</strong></article><article><Icon name="check" /><span>Paid</span><strong>{formatPrice(sum("paid"))}</strong></article></section><section className="affiliate-panel"><div className="affiliate-panel-heading"><div><p>Start selling</p><h2>Your next best action</h2></div><Icon name="book" /></div>{offers.length ? <><p>Your offer links are ready. Share the one that best fits your audience.</p><Link className="affiliate-inline-link" href="/affiliate/offers">View and copy offer links</Link></> : <><p>Create a link with one digital price and one paperback price. We will track it securely for 30 days.</p><Link className="affiliate-inline-link" href="/affiliate/offers">Create your first offer</Link></>}</section></AffiliateShell>;
}

