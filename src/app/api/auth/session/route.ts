import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { adminSessionCookie } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { sessionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { idToken, remember } = sessionSchema.parse(await request.json());
    const auth = getAdminAuth();
    const claims = await auth.verifyIdToken(idToken);
    const authenticationAge = Math.floor(Date.now() / 1000) - claims.auth_time;

    if (authenticationAge > 5 * 60 || claims.admin !== true) {
      return Response.json({ error: "Administrator access required." }, { status: 403 });
    }

    const expiresIn = remember ? 5 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    const cookieStore = await cookies();
    cookieStore.set(adminSessionCookie, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(remember ? { maxAge: expiresIn / 1000 } : {}),
    });

    return Response.json({ authenticated: true });
  } catch (error) {
    return apiError(error);
  }
}
