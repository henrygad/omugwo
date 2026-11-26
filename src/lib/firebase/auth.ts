import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getAdminAuth } from "./admin";

export const adminSessionCookie = "omugwo_admin_session";
export const affiliateSessionCookie = "omugwo_affiliate_session";

export async function getAdminSession(): Promise<DecodedIdToken | null> {
  await connection();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(adminSessionCookie)?.value;
  if (!sessionCookie) return null;

  try {
    const claims = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return claims.admin === true ? claims : null;
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function getAffiliateSession(): Promise<DecodedIdToken | null> {
  await connection();
  const sessionCookie = (await cookies()).get(affiliateSessionCookie)?.value;
  if (!sessionCookie) return null;
  try {
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}

export async function requireAffiliateSession() {
  const session = await getAffiliateSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
