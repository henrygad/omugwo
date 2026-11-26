import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AffiliateOnboardingForm } from "@/components/affiliate/AffiliateOnboardingForm";
import { getAffiliateProfile } from "@/lib/affiliate/data";
import { getAffiliateSession } from "@/lib/firebase/auth";

export const metadata: Metadata = { title: "Affiliate application | Omugwo", robots: { index: false, follow: false } };
export const instant = false;

export default async function AffiliateOnboardingPage() {
  const session = await getAffiliateSession();
  if (!session) redirect("/affiliate/login");
  if (await getAffiliateProfile(session.uid)) redirect("/affiliate/dashboard");
  return <main className="affiliate-onboarding-page"><Link className="affiliate-auth-brand" href="/"><span className="brand-mark">O</span><span><strong>Omugwo</strong><small>Affiliate Programme</small></span></Link><section className="affiliate-onboarding-card"><div><p className="eyebrow">One final step</p><h1>Tell us how you will introduce Omugwo to readers.</h1><p>Your public affiliate name will appear discreetly to customers who use your links.</p></div><AffiliateOnboardingForm /></section></main>;
}
