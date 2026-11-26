import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { affiliatePricing } from "@/config/site";
import { affiliateOfferCookie, findActiveOfferByCode } from "@/lib/affiliate/offers";
import { getAdminDb } from "@/lib/firebase/admin";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const offer = await findActiveOfferByCode(code).catch(() => null);
  const destination = new URL("/", request.url);
  if (!offer || offer.isCompany) {
    destination.searchParams.set("offer", "unavailable");
    return NextResponse.redirect(destination);
  }

  await getAdminDb().collection("affiliateOffers").doc(offer.id).update({
    clicks: FieldValue.increment(1),
    lastClickedAt: FieldValue.serverTimestamp(),
  });
  const response = NextResponse.redirect(destination);
  response.cookies.set(affiliateOfferCookie, offer.code, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: affiliatePricing.cookieDays * 24 * 60 * 60,
  });
  return response;
}
