import "server-only";

import { redirect } from "next/navigation";
import { getAffiliateProfile } from "@/lib/affiliate/data";
import { getAdminSession, getAffiliateSession } from "@/lib/firebase/auth";

export async function requireApprovedAffiliatePage() {
  const session = await getAffiliateSession();
  if (!session) redirect("/affiliate/login");
  const profile = await getAffiliateProfile(session.uid);
  if (!profile || profile.status !== "approved") redirect("/affiliate/dashboard");
  return { session, profile };
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
