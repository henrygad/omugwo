import { cookies } from "next/headers";
import { affiliateSessionCookie } from "@/lib/firebase/auth";

export async function POST() {
  (await cookies()).delete(affiliateSessionCookie);
  return Response.json({ authenticated: false });
}
