import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireApprovedAffiliate } from "@/lib/affiliate/data";
import { apiError } from "@/lib/http";
import { affiliateOfferSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { session, profile } = await requireApprovedAffiliate();
    const input = affiliateOfferSchema.parse(await request.json());
    const reference = getAdminDb().collection("affiliateOffers").doc();
    const now = FieldValue.serverTimestamp();
    const code = randomBytes(12).toString("base64url");
    await reference.create({
      code,
      affiliateId: session.uid,
      affiliateName: profile.publicName,
      title: input.title,
      digitalPrice: input.digitalPrice,
      paperbackPrice: input.paperbackPrice,
      active: true,
      clicks: 0,
      checkouts: 0,
      paidSales: 0,
      createdAt: now,
      updatedAt: now,
    });
    return Response.json({ id: reference.id, code }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
