import {
  generateDeliveryFile,
  sendDelivery,
} from "@/lib/digital-deliveries";
import { requireAdminSession } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { digitalDeliveryActionSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const administrator = await requireAdminSession();
    const { id } = await context.params;
    const { action } = digitalDeliveryActionSchema.parse(await request.json());
    if (action === "regenerate") {
      await generateDeliveryFile(id, administrator.uid, true);
    } else {
      await sendDelivery(id, action, {
        uid: administrator.uid,
        ...(administrator.email ? { email: administrator.email } : {}),
      });
    }
    return Response.json({ updated: true });
  } catch (error) {
    return apiError(error);
  }
}
