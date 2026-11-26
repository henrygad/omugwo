import { FieldValue } from "firebase-admin/firestore";
import { requireApprovedAffiliate } from "@/lib/affiliate/data";
import { getAdminDb } from "@/lib/firebase/admin";
import { apiError } from "@/lib/http";
import { affiliateOfferUpdateSchema } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { session } = await requireApprovedAffiliate();
    const { id } = await context.params;
    const input = affiliateOfferUpdateSchema.parse(await request.json());
    const reference = getAdminDb().collection("affiliateOffers").doc(id);
    const snapshot = await reference.get();
    if (!snapshot.exists || snapshot.get("affiliateId") !== session.uid) {
      return Response.json({ error: "Offer not found." }, { status: 404 });
    }
    await reference.update({ active: input.active, updatedAt: FieldValue.serverTimestamp() });
    return Response.json({ updated: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext<"/api/affiliate/offers/[id]">) {
  try {
    const { session } = await requireApprovedAffiliate();
    const { id } = await context.params;
    const database = getAdminDb();
    const reference = database.collection("affiliateOffers").doc(id);
    const snapshot = await reference.get();

    if (!snapshot.exists || snapshot.get("affiliateId") !== session.uid) {
      return Response.json({ error: "Offer not found." }, { status: 404 });
    }

    const commissionSnapshot = await database
      .collection("affiliateCommissions")
      .where("offerId", "==", id)
      .limit(1)
      .get();
    if (Number(snapshot.get("paidSales") ?? 0) > 0 || !commissionSnapshot.empty) {
      return Response.json(
        { error: "Offers with recorded sales cannot be deleted. Pause this offer instead." },
        { status: 409 },
      );
    }

    await reference.delete();
    return Response.json({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
