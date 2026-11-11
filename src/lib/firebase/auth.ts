import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { getAdminAuth } from "./admin";

export const adminSessionCookie = "omugwo_admin_session";

export async function getAdminSession(): Promise<DecodedIdToken | null> {
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
