import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { requireApprovedAffiliate } from "@/lib/affiliate/data";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { affiliateSessionCookie } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import {
  affiliateAccountClosureSchema,
  affiliateProfileSettingsSchema,
} from "@/lib/validation";

export async function PATCH(request: Request) {
  try {
    const { session } = await requireApprovedAffiliate();
    const input = affiliateProfileSettingsSchema.parse(await request.json());
    const database = getAdminDb();
    const profileReference = database.collection("affiliates").doc(session.uid);
    const offers = await database
      .collection("affiliateOffers")
      .where("affiliateId", "==", session.uid)
      .limit(400)
      .get();
    const batch = database.batch();
    batch.update(profileReference, { ...input, updatedAt: FieldValue.serverTimestamp() });
    offers.docs.forEach((offer) => batch.update(offer.ref, {
      affiliateName: input.publicName,
      updatedAt: FieldValue.serverTimestamp(),
    }));
    await batch.commit();
    return Response.json({ updated: true });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const { session, profile } = await requireApprovedAffiliate();
    affiliateAccountClosureSchema.parse(await request.json());
    const database = getAdminDb();
    const commissions = await database
      .collection("affiliateCommissions")
      .where("affiliateId", "==", session.uid)
      .limit(2000)
      .get();
    const hasUnsettledEarnings = commissions.docs.some((commission) => {
      const status = commission.get("status");
      return status === "pending" || status === "available";
    });
    if (hasUnsettledEarnings) {
      return Response.json(
        { error: "Your account cannot be closed while earnings are pending or awaiting payout." },
        { status: 409 },
      );
    }
    if ((profile.negativeBalance ?? 0) > 0) {
      return Response.json(
        { error: "Your account cannot be closed while a reversal balance remains." },
        { status: 409 },
      );
    }

    const offers = await database
      .collection("affiliateOffers")
      .where("affiliateId", "==", session.uid)
      .limit(400)
      .get();
    const auth = getAdminAuth();
    await auth.updateUser(session.uid, { disabled: true });

    const closureReference = database.collection("affiliateAccountClosures").doc(session.uid);
    try {
      const batch = database.batch();
      offers.docs.forEach((offer) => batch.update(offer.ref, {
        active: false,
        affiliateName: "Closed affiliate",
        updatedAt: FieldValue.serverTimestamp(),
      }));
      batch.delete(database.collection("affiliates").doc(session.uid));
      batch.set(closureReference, {
        affiliateId: session.uid,
        financialRecordsRetained: !commissions.empty,
        authCleanupPending: false,
        closedAt: FieldValue.serverTimestamp(),
      });
      batch.create(database.collection("auditLogs").doc(), {
        action: "affiliate.account_closed",
        affiliateId: session.uid,
        createdAt: FieldValue.serverTimestamp(),
      });
      await batch.commit();
    } catch (error) {
      await auth.updateUser(session.uid, { disabled: false }).catch(() => undefined);
      throw error;
    }

    try {
      await auth.deleteUser(session.uid);
    } catch (error) {
      await closureReference.update({
        authCleanupPending: true,
        authCleanupError: error instanceof Error ? error.message.slice(0, 300) : "Unknown authentication cleanup error",
      });
    }
    (await cookies()).delete(affiliateSessionCookie);
    return Response.json({ closed: true });
  } catch (error) {
    return apiError(error);
  }
}
