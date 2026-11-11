import { cookies } from "next/headers";
import { adminSessionCookie } from "@/lib/firebase/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookie);
  return Response.json({ authenticated: false });
}
