import type { Metadata } from "next";
import { AffiliateAccountSettings } from "@/components/affiliate/AffiliateAccountSettings";
import { BankDetailsForm } from "@/components/affiliate/BankDetailsForm";
import { requireApprovedAffiliatePage } from "@/lib/page-auth";

export const metadata: Metadata = { title: "Settings | Omugwo Affiliate", robots: { index: false, follow: false } };
export default async function AffiliateSettingsPage() {
  const { profile } = await requireApprovedAffiliatePage();
  return <><header className="affiliate-page-header"><div><p>Affiliate settings</p><h1>Manage your profile and account.</h1></div></header><AffiliateAccountSettings profile={profile} /><BankDetailsForm profile={profile} /></>;
}
