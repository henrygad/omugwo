import { updateFulfillment } from "@/lib/admin-data";
import { requireAdminSession } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { fulfillmentUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const administrator = await requireAdminSession();
    const { id } = await context.params;
    const { status, trackingNumber, note } = fulfillmentUpdateSchema.parse(
      await request.json(),
    );
    await updateFulfillment(id, status, administrator.uid, {
      trackingNumber,
      note,
    });
    return Response.json({ updated: true });
  } catch (error) {
    return apiError(error);
  }
}
