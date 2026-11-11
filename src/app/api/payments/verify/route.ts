import { connection } from "next/server";
import { apiError } from "@/lib/http";
import { verifyAndApplyPayment } from "@/lib/orders";

export async function GET(request: Request) {
  await connection();
  try {
    const reference = new URL(request.url).searchParams.get("reference")?.trim();
    if (!reference) {
      return Response.json({ error: "Payment reference is required." }, { status: 400 });
    }

    const order = await verifyAndApplyPayment(reference);
    return Response.json({
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      reference: order.paystackReference,
    });
  } catch (error) {
    return apiError(error);
  }
}
