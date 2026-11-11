import { moderateReview } from "@/lib/admin-data";
import { requireAdminSession } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { reviewModerationSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const administrator = await requireAdminSession();
    const { id } = await context.params;
    const { status } = reviewModerationSchema.parse(await request.json());
    await moderateReview(id, status, administrator.uid);
    return Response.json({ updated: true });
  } catch (error) {
    return apiError(error);
  }
}
