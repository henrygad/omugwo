import type { Metadata } from "next";
import { OfferManager } from "@/components/affiliate/OfferManager";
import { listAffiliateOffers } from "@/lib/affiliate/data";
import { requireApprovedAffiliatePage } from "@/lib/page-auth";

export const metadata: Metadata = { title: "Offer links | Omugwo Affiliate", robots: { index: false, follow: false } };
export default async function AffiliateOffersPage() {
  const { session } = await requireApprovedAffiliatePage();
  const offers = await listAffiliateOffers(session.uid);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://omugwoseries.vercel.app";
  return <><header className="affiliate-page-header"><div><p>Campaign tools</p><h1>Create and manage your offer links.</h1></div></header><OfferManager offers={offers} siteUrl={siteUrl} /></>;
}
