import { FieldValue } from "firebase-admin/firestore";
import { verifyAppCheckRequest } from "@/lib/firebase/app-check";
import { getAdminDb } from "@/lib/firebase/admin";
import { apiError } from "@/lib/http";
import { analyticsEventSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    await verifyAppCheckRequest(request);
    const input = analyticsEventSchema.parse(await request.json());
    const db = getAdminDb();
    const visitor = db.collection("analyticsVisitors").doc(input.visitorId);
    const event = db.collection("analyticsEvents").doc();
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(visitor);
      const previousSession = snapshot.exists
        ? String(snapshot.get("lastSessionId") ?? "")
        : "";
      const visitorData = {
        lastSessionId: input.sessionId,
        lastSeenAt: now,
        lastPath: input.path,
        device: input.device,
        source: snapshot.exists
          ? String(snapshot.get("source") ?? input.source ?? "Direct / unknown")
          : input.source || "Direct / unknown",
        ...(snapshot.exists && snapshot.get("medium")
          ? { medium: String(snapshot.get("medium")) }
          : input.medium
            ? { medium: input.medium }
            : {}),
        ...(snapshot.exists && snapshot.get("campaign")
          ? { campaign: String(snapshot.get("campaign")) }
          : input.campaign
            ? { campaign: input.campaign }
            : {}),
        ...(input.orderId ? { linkedOrderId: input.orderId } : {}),
        ...(input.orderId && input.event === "purchase"
          ? { convertedOrderId: input.orderId }
          : {}),
        pageViews: FieldValue.increment(input.event === "page_view" ? 1 : 0),
        eventCount: FieldValue.increment(1),
        sessionCount: FieldValue.increment(previousSession === input.sessionId ? 0 : 1),
      };

      if (snapshot.exists) {
        transaction.update(visitor, visitorData);
      } else {
        transaction.create(visitor, {
          ...visitorData,
          firstSeenAt: now,
        });
      }
      transaction.create(event, {
        ...input,
        source: input.source || "Direct / unknown",
        createdAt: now,
      });
    });

    return Response.json({ recorded: true }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

