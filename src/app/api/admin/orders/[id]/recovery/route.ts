import { sendManualPaymentRecovery } from "@/lib/admin-data";
import { requireAdminSession } from "@/lib/firebase/auth";
import { apiError } from "@/lib/http";
import { paymentRecoveryActionSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const administrator = await requireAdminSession();
    const { id } = await context.params;
    const { resend } = paymentRecoveryActionSchema.parse(await request.json());
    const result = await sendManualPaymentRecovery(
      id,
      administrator.uid,
      resend,
    );
    return Response.json(result, { status: result.sent ? 200 : 409 });
  } catch (error) {
    return apiError(error);
  }
}

