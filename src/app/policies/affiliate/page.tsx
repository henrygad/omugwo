import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";
import { AffiliateTermsContent } from "@/components/affiliate/AffiliateTermsContent";

export const metadata: Metadata = { title: "Affiliate Programme Terms | Omugwo", description: "Terms governing participation in the Omugwo Affiliate Programme." };

export default function AffiliateTermsPage() {
  return <PolicyPage eyebrow="Affiliate Programme" title="Affiliate Programme Terms">
    <AffiliateTermsContent />
  </PolicyPage>;
}
