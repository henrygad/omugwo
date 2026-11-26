import { redirect } from "next/navigation";
import { AffiliateShell } from "@/components/affiliate/AffiliateShell";
import { getAffiliateProfile } from "@/lib/affiliate/data";
import { getAffiliateSession } from "@/lib/firebase/auth";

export const instant = false;

export default async function ApprovedAffiliateLayout({ children }: { children: React.ReactNode }) {
  const session = await getAffiliateSession();
  if (!session) redirect("/affiliate/login");
  const profile = await getAffiliateProfile(session.uid);
  if (!profile || profile.status !== "approved") redirect("/affiliate/dashboard");
  return <AffiliateShell publicName={profile.publicName}>{children}</AffiliateShell>;
}
