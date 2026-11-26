import { FieldValue } from "firebase-admin/firestore";
import { sendAffiliateApplicationReceivedEmail } from "@/lib/email/affiliate-status";
import { getAdminDb } from "@/lib/firebase/admin";
import { requireAffiliateSession } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { affiliateBankSchema, affiliateOnboardingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await requireAffiliateSession();
    const input = affiliateOnboardingSchema.parse(await request.json());
    const reference = getAdminDb().collection("affiliates").doc(session.uid);
    const existing = await reference.get();
    if (existing.exists) {
      return Response.json({ error: "Your application has already been submitted." }, { status: 409 });
    }
    const now = FieldValue.serverTimestamp();
    await reference.create({
      email: session.email ?? "",
      fullName: input.fullName,
      publicName: input.publicName,
      phone: input.phone,
      marketingDetails: input.marketingDetails,
      status: "pending",
      termsVersion: "2026-11-26",
      termsAcceptedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    let emailSent = false;
    try {
      const messageId = await sendAffiliateApplicationReceivedEmail({
        email: session.email ?? "",
        name: input.fullName,
      });
      await reference.update({ applicationEmailMessageId: messageId, applicationEmailSentAt: FieldValue.serverTimestamp() });
      emailSent = true;
    } catch (error) {
      await reference.update({ applicationEmailError: error instanceof Error ? error.message.slice(0, 300) : "Unknown email error" });
    }
    return Response.json({ submitted: true, emailSent }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAffiliateSession();
    const input = affiliateBankSchema.parse(await request.json());
    const reference = getAdminDb().collection("affiliates").doc(session.uid);
    const profile = await reference.get();
    if (!profile.exists || profile.get("status") !== "approved") {
      return Response.json({ error: "Affiliate approval required." }, { status: 403 });
    }
    await reference.update({ ...input, updatedAt: FieldValue.serverTimestamp() });
    return Response.json({ updated: true });
  } catch (error) {
    return apiError(error);
  }
}
