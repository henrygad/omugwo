import { FieldValue } from "firebase-admin/firestore";
import { sendAffiliateStatusEmail } from "@/lib/email/affiliate-status";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { affiliateModerationSchema } from "@/lib/validation";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const administrator = await requireAdminSession();
    const input = affiliateModerationSchema.parse(await request.json());
    const { id } = await context.params;
    const db = getAdminDb();
    const reference = db.collection("affiliates").doc(id);
    const profile = await reference.get();
    if (!profile.exists) return Response.json({ error: "Affiliate not found." }, { status: 404 });
    const batch = db.batch();
    batch.update(reference, { status: input.status, reviewedBy: administrator.uid, reviewedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
    if (input.status !== "approved") {
      const offers = await db.collection("affiliateOffers").where("affiliateId", "==", id).get();
      offers.docs.forEach((offer) => batch.update(offer.ref, { active: false, updatedAt: FieldValue.serverTimestamp() }));
    }
    batch.create(db.collection("auditLogs").doc(), { action: `affiliate.${input.status}`, affiliateId: id, administratorId: administrator.uid, createdAt: FieldValue.serverTimestamp() });
    await batch.commit();
    let emailSent = false;
    try {
      const messageId = await sendAffiliateStatusEmail({ email: String(profile.get("email")), name: String(profile.get("fullName")), status: input.status });
      await reference.update({ statusEmailMessageId: messageId, statusEmailSentAt: FieldValue.serverTimestamp(), statusEmailError: FieldValue.delete() });
      emailSent = true;
    } catch (error) {
      await reference.update({ statusEmailError: error instanceof Error ? error.message.slice(0, 300) : "Unknown email error" });
    }
    return Response.json({ updated: true, emailSent });
  } catch (error) { return apiError(error); }
}
