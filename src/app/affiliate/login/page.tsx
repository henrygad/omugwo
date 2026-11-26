import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AffiliateAuthForm } from "@/components/affiliate/AffiliateAuthForm";
import { getAffiliateSession } from "@/lib/firebase/auth";

export const metadata: Metadata = { title: "Affiliate sign in | Omugwo", robots: { index: false, follow: false } };
export const instant = false;

export default async function AffiliateLoginPage() {
  if (await getAffiliateSession()) redirect("/affiliate/dashboard");
  return <main className="affiliate-auth-page"><Link className="affiliate-auth-brand" href="/"><span className="brand-mark">O</span><span><strong>Omugwo</strong><small>Affiliate Programme</small></span></Link><section><div className="affiliate-auth-copy"><p className="eyebrow">Partner with Omugwo</p><h1>Your links. Your offers. Your earnings.</h1><p>Sign in or create an account, then complete the short affiliate application.</p></div><AffiliateAuthForm /></section><p className="affiliate-auth-footnote">Buying the book? <Link href="/">Return to the Omugwo sales page.</Link></p></main>;
}
