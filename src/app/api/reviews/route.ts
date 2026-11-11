import { FieldValue } from "firebase-admin/firestore";
import { verifyAppCheckRequest } from "@/lib/firebase/app-check";
import { getAdminDb } from "@/lib/firebase/admin";
import { apiError } from "@/lib/http";
import { reviewSubmissionSchema } from "@/lib/validation";

export async function GET() {
  try {
    const snapshot = await getAdminDb()
      .collection("reviews")
      .where("status", "==", "approved")
      .limit(30)
      .get();
    const reviews = snapshot.docs
      .map((document) => {
        const value = document.data();
        return {
          id: document.id,
          name: String(value.name),
          rating: Number(value.rating),
          comment: String(value.comment),
          createdAt: value.createdAt?.toDate?.().toISOString?.() ?? "",
        };
      })
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return Response.json(
      { reviews },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await verifyAppCheckRequest(request);
    const input = reviewSubmissionSchema.parse(await request.json());
    const now = FieldValue.serverTimestamp();
    const review = await getAdminDb().collection("reviews").add({
      ...input,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return Response.json(
      { id: review.id, message: "Thank you. Your review is awaiting moderation." },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
