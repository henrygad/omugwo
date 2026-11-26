import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import { affiliateSessionCookie } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { affiliateSessionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { idToken, remember } = affiliateSessionSchema.parse(await request.json());
    const auth = getAdminAuth();
    const claims = await auth.verifyIdToken(idToken);
    const authenticationAge = Math.floor(Date.now() / 1000) - claims.auth_time;
    if (authenticationAge > 5 * 60) {
      return Response.json({ error: "Please sign in again." }, { status: 401 });
    }
    if (claims.email_verified !== true) {
      return Response.json(
        { error: "Verify your email address before continuing." },
        { status: 403 },
      );
    }
    const expiresIn = remember ? 14 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    (await cookies()).set(affiliateSessionCookie, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(remember ? { maxAge: expiresIn / 1000 } : {}),
    });
    return Response.json({ authenticated: true, uid: claims.uid });
  } catch (error) {
    return apiError(error);
  }
}
