import { createComplimentaryDelivery } from "@/lib/digital-deliveries";
import { requireAdminSession } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { complimentaryDeliverySchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const administrator = await requireAdminSession();
    const input = complimentaryDeliverySchema.parse(await request.json());
    const deliveryId = await createComplimentaryDelivery(input, {
      uid: administrator.uid,
      ...(administrator.email ? { email: administrator.email } : {}),
    });
    return Response.json({ deliveryId }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
